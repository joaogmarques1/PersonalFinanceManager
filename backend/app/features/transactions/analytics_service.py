from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from typing import List
from datetime import date
from features.transactions.models import Transaction
from features.categories.models import Category
from features.transactions.analytics_schemas import MonthlySummary, AnalyticsResponse, CategorySpending, SpendingByCategoryResponse
from decimal import Decimal

# Helper imports - Assuming we might need to redefine schemas if we delete features/analytics
# But for now I'll import schemas from there, then later move them. 
# Better plan: Move schemas first/concurrently? 
# I'll likely need to recreate the schemas in features/transactions/schemas.py or just use the Pydantic models in place.
# Let's keep it simple and assume I'll copy schemas to features/transactions/schemas.py or similar.

class TransactionAnalyticsService:
    @staticmethod
    def get_monthly_summary(
        db: Session, 
        user_id: int, 
        start_date: date, 
        end_date: date, 
        category_id: int = None, 
        exclude_credit_card: bool = False,
        exclude_card_repayment: bool = False
    ):
        # Base query
        query = db.query(
            extract('year', Transaction.date).label('year'),
            extract('month', Transaction.date).label('month'),
            Transaction.type,
            func.sum(Transaction.amount).label('total')
        ).join(Transaction.category, isouter=True).filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date,
            Transaction.deleted_at.is_(None)
        )

        # Apply Filters
        if category_id:
            query = query.filter(Transaction.category_id == category_id)
        
        if exclude_credit_card:
            query = query.filter(Transaction.payment_method.notin_(['Cartão de crédito', 'credit_card', 'Credit Card']))

        if exclude_card_repayment:
            query = query.filter(
                ~and_(
                    Transaction.description.ilike('Pagamento de Cartão de Crédito%'),
                    Category.name == 'Pagamento de dívidas'
                )
            )

        results = query.group_by(
            extract('year', Transaction.date),
            extract('month', Transaction.date),
            Transaction.type
        ).all()

        summary_map = {}
        for r in results:
            key = (int(r.year), int(r.month))
            if key not in summary_map:
                summary_map[key] = {'income': Decimal('0.00'), 'expense': Decimal('0.00')}
            
            if r.type == 'income':
                summary_map[key]['income'] = r.total
            elif r.type == 'expense':
                summary_map[key]['expense'] = r.total

        data = []
        for (year, month), values in summary_map.items():
            income = values['income']
            expense = values['expense']
            data.append({
                "year": year,
                "month": month,
                "total_income": income,
                "total_expense": expense,
                "balance": income - expense
            })
        
        data.sort(key=lambda x: (x['year'], x['month']))

        return {"data": data}

    @staticmethod
    def get_spending_by_category(
        db: Session, 
        user_id: int, 
        start_date: date, 
        end_date: date, 
        category_id: int = None, 
        exclude_credit_card: bool = False,
        exclude_card_repayment: bool = False
    ):
        query = db.query(
            Category.name,
            func.sum(Transaction.amount).label('total')
        ).join(Transaction.category)\
        .filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date,
            Transaction.type == 'expense',
            Transaction.deleted_at.is_(None)
        )

        # Apply Filters
        if category_id:
            query = query.filter(Transaction.category_id == category_id)
        
        if exclude_credit_card:
            query = query.filter(Transaction.payment_method.notin_(['Cartão de crédito', 'credit_card', 'Credit Card']))

        if exclude_card_repayment:
            query = query.filter(
                ~and_(
                    Transaction.description.ilike('Pagamento de Cartão de Crédito%'),
                    Category.name == 'Pagamento de dívidas'
                )
            )

        results = query.group_by(Category.name).all()

        total_spent = sum((r.total for r in results), Decimal('0.00'))
        
        category_spending = []
        for r in results:
            percentage = (float(r.total) / float(total_spent) * 100) if total_spent > 0 else 0
            category_spending.append({
                "category_name": r.name,
                "total_amount": r.total,
                "percentage": round(percentage, 2)
            })

        category_spending.sort(key=lambda x: x['total_amount'], reverse=True)

        return {
            "categories": category_spending,
            "total_spent": total_spent
        }
