from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, case, or_
from datetime import date, timedelta
from features.transactions.models import Transaction
from features.loans.models import Loan
from features.credit_cards.models import CreditCard
from features.categories.models import Category
from decimal import Decimal

class CreditCardsAnalyticsService:
    @staticmethod
    def get_analytics(db: Session, user_id: int):
        # 1. credit Cards Data (Limits & Interest Rates)
        cards = db.query(CreditCard).filter(CreditCard.user_id == user_id).all()
        if not cards:
             return {
                "utilization": {"used": 0, "available": 0, "total_limit": 0},
                "total_debt": 0,
                "interest_rates_utilization": [],
                "evolution": []
            }

        card_ids = [c.id for c in cards]
        total_limit = sum(c.credit_card_limit for c in cards)

        # 2. Current Debt (Utilization)
        # Sum of principals of all active loans linked to these cards
        total_debt = db.query(func.sum(Loan.principal)).filter(
            Loan.user_id == user_id,
            Loan.used_credit_card.in_(card_ids),
            Loan.deleted_at.is_(None)
        ).scalar() or Decimal(0)

        # Ensure we don't have negative available credit visually
        available_credit = total_limit - total_debt
        
        utilization_data = {
            "used": float(total_debt),
            "available": float(available_credit),
            "total_limit": float(total_limit)
        }

        # 3. Interest Rate Utilization (Radial Bar)
        # Group cards by interest rate
        results_by_rate = []
        # Get debt per card first to make it easier
        debt_per_card = {}
        loans_per_card = db.query(
            Loan.used_credit_card, 
            func.sum(Loan.principal).label('total')
        ).filter(
             Loan.user_id == user_id,
             Loan.used_credit_card.in_(card_ids),
             Loan.deleted_at.is_(None)
        ).group_by(Loan.used_credit_card).all()

        for card_id, debt in loans_per_card:
            debt_per_card[card_id] = debt

        # Group logic in python to be simpler with small number of cards
        rate_groups = {}
        for card in cards:
            rate = float(card.interest_rate or 0)
            if rate not in rate_groups:
                rate_groups[rate] = {"limit": 0, "used": 0}
            
            rate_groups[rate]["limit"] += float(card.credit_card_limit)
            rate_groups[rate]["used"] += float(debt_per_card.get(card.id, 0))

        for rate, data in rate_groups.items():
            percent = (data["used"] / data["limit"] * 100) if data["limit"] > 0 else 0
            results_by_rate.append({
                "interest_rate": rate,
                "used": data["used"],
                "limit": data["limit"],
                "percentage": round(percent, 2)
            })
        
        # Sort by interest rate ascending (inner to outer rings usually)
        results_by_rate.sort(key=lambda x: x["interest_rate"])

        # 4. Evolution (Line Chart - Bi-weekly)
        # Last 12 months
        today = date.today()
        # Start of month 12 months ago
        # Logic: Subtract 1 year, set to day 1
        try:
             start_date = today.replace(year=today.year - 1, day=1)
        except ValueError:
             # Handle leap year edge case if today was Feb 29 (though we set day=1 so it's safe)
             start_date = date(today.year - 1, today.month, 1)
             
        end_date = today

        # 4a. Spending (Expenses via Credit Card)
        spending_query = db.query(
            extract('year', Transaction.date).label('year'),
            extract('month', Transaction.date).label('month'),
            case(
                (extract('day', Transaction.date) <= 15, 1),
                else_=2
            ).label('period_part'),
            func.sum(Transaction.amount).label('total')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date,
            Transaction.type == 'expense',
            Transaction.deleted_at.is_(None),
            Transaction.payment_method.in_(['Cartão de crédito', 'credit_card', 'Credit Card'])
        ).group_by(
            extract('year', Transaction.date),
            extract('month', Transaction.date),
            'period_part'
        ).all()

        # 4b. Repayments (Income/Transfers used to pay CC)
        # Assuming repayment logic: Description like 'Pagamento de Cartão%' AND Category 'Pagamento de dívidas'
        # Or Transaction type 'expense' but category 'Pagamento de dívidas'?
        # Let's check existing logic in TransactionsAnalytics:
        # exclude_card_repayment uses: Transaction.description.ilike('Pagamento de Cartão de Crédito%') AND Category.name == 'Pagamento de dívidas'
        
        repayment_query = db.query(
            extract('year', Transaction.date).label('year'),
            extract('month', Transaction.date).label('month'),
            case(
                (extract('day', Transaction.date) <= 15, 1),
                else_=2
            ).label('period_part'),
            func.sum(Transaction.amount).label('total')
        ).join(Transaction.category)\
        .filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date,
            Transaction.deleted_at.is_(None),
            and_(
                Transaction.description.ilike('Pagamento de Cartão de Crédito%'),
                Category.name == 'Pagamento de dívidas'
            )
        ).group_by(
            extract('year', Transaction.date),
            extract('month', Transaction.date),
            'period_part'
        ).all()

        # Map results
        spending_map = {}
        for r in spending_query:
            key = (int(r.year), int(r.month), int(r.period_part))
            spending_map[key] = float(r.total)

        repayment_map = {}
        for r in repayment_query:
            key = (int(r.year), int(r.month), int(r.period_part))
            repayment_map[key] = float(r.total)

        # Generate timeline
        evolution_data = []
        current = start_date
        while current <= end_date:
            year = current.year
            month = current.month
            
            # Period 1 (1-15)
            key1 = (year, month, 1)
            evolution_data.append({
                "period_label": f"{month}/{str(year)[2:]} (1ª Q)",
                "raw_date": f"{year}-{month:02d}-01",
                "spending": spending_map.get(key1, 0),
                "repayment": repayment_map.get(key1, 0)
            })

            # Period 2 (16-End)
            key2 = (year, month, 2)
            evolution_data.append({
                "period_label": f"{month}/{str(year)[2:]} (2ª Q)",
                "raw_date": f"{year}-{month:02d}-16",
                "spending": spending_map.get(key2, 0),
                "repayment": repayment_map.get(key2, 0)
            })

            # Move to next month
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1)
            else:
                current = current.replace(month=current.month + 1)

        return {
            "utilization": utilization_data,
            "interest_rates_utilization": results_by_rate,
            "evolution": evolution_data,
            "total_debt": float(total_debt)
        }
