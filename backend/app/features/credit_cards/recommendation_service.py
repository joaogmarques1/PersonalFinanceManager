from sqlalchemy.orm import Session
from sqlalchemy import func
from features.credit_cards.models import CreditCard
from features.loans.models import Loan

class RecommendationService:
    @staticmethod
    def get_repayment_recommendations(db: Session, user_id: int, amount: float):
        """
        Avalanche Method: Pay off highest interest rate debt first.
        """
        # 1. Get all credit cards with their current debt
        cards = db.query(CreditCard).filter(
            CreditCard.user_id == user_id
        ).all()

        card_debts = []
        total_debt = 0.0

        for card in cards:
            # Calculate current debt for this card
            current_debt = db.query(func.sum(Loan.principal)).filter(
                Loan.used_credit_card == card.id,
                Loan.user_id == user_id,
                Loan.deleted_at.is_(None)
            ).scalar() or 0.0
            
            if current_debt > 0:
                card_debts.append({
                    "id": card.id,
                    "name": card.name,
                    "interest_rate": card.interest_rate,
                    "current_debt": float(current_debt),
                    "recommended_payment": 0.0
                })
                total_debt += float(current_debt)

        # 2. Sort by Interest Rate DESC (Avalanche)
        card_debts.sort(key=lambda x: x["interest_rate"], reverse=True)

        # 3. Allocate amount
        remaining_amount = amount
        allocations = []

        for card in card_debts:
            if remaining_amount <= 0:
                allocations.append(card)
                continue

            # We can pay at most the debt of this card
            payment = min(remaining_amount, card["current_debt"])
            card["recommended_payment"] = payment
            remaining_amount -= payment
            allocations.append(card)

        return {
            "recommendations": allocations,
            "total_debt": total_debt,
            "remaining_amount_to_allocate": remaining_amount if remaining_amount > 0 else 0
        }

    @staticmethod
    def get_purchase_recommendations(db: Session, user_id: int, amount: float):
        """
        Cheapest Credit Method: Use lowest interest rate card first, respecting limits.
        """
        # 1. Get all credit cards
        cards = db.query(CreditCard).filter(
            CreditCard.user_id == user_id
        ).all()

        card_availabilities = []

        for card in cards:
            # Calculate current debt
            current_debt = db.query(func.sum(Loan.principal)).filter(
                Loan.used_credit_card == card.id,
                Loan.user_id == user_id,
                Loan.deleted_at.is_(None)
            ).scalar() or 0.0

            # Calculate available limit
            limit = float(card.credit_card_limit)
            debt = float(current_debt)
            available = max(0, limit - debt)

            card_availabilities.append({
                "id": card.id,
                "name": card.name,
                "interest_rate": card.interest_rate,
                "available_limit": available,
                "recommended_usage": 0.0
            })

        # 2. Sort by Interest Rate ASC (Cheapest First)
        card_availabilities.sort(key=lambda x: x["interest_rate"])

        # 3. Allocate amount
        remaining_amount = amount
        allocations = []
        possible_to_cover = False
        total_available = sum(c["available_limit"] for c in card_availabilities)
        
        if total_available >= amount:
            possible_to_cover = True
            for card in card_availabilities:
                if remaining_amount <= 0:
                    allocations.append(card)
                    continue

                # We can use at most the available limit of this card
                usage = min(remaining_amount, card["available_limit"])
                card["recommended_usage"] = usage
                remaining_amount -= usage
                allocations.append(card)
        else:
            # Not enough limit total
            allocations = card_availabilities # Return empty recommendations logically or just info

        return {
            "recommendations": allocations,
            "possible": possible_to_cover,
            "total_available": total_available
        }
