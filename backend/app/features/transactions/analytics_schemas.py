from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

class MonthlySummary(BaseModel):
    month: int
    year: int
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal

class AnalyticsResponse(BaseModel):
    data: List[MonthlySummary]

class CategorySpending(BaseModel):
    category_name: str
    total_amount: Decimal
    percentage: Optional[float] = None

class SpendingByCategoryResponse(BaseModel):
    categories: List[CategorySpending]
    total_spent: Decimal
