from app.database import SessionLocal
from app.features.analytics.service import AnalyticsService
from app.features.users.models import User
from datetime import date, timedelta

db = SessionLocal()
try:
    user = db.query(User).first()
    if not user:
        print("No user found")
    else:
        print(f"Testing for user: {user.email} (ID: {user.id})")
        
        end_date = date.today()
        start_date = end_date - timedelta(days=180) # 6 months
        
        print(f"Date Range: {start_date} to {end_date}")
        
        # Test Category Spending
        print("\n--- Spending By Category ---")
        cat_response = AnalyticsService.get_spending_by_category(db, user.id, start_date, end_date)
        print(f"Total Spent: {cat_response.total_spent} (Type: {type(cat_response.total_spent)})")
        for cat in cat_response.categories:
            print(f"Category: {cat.category_name}, Amount: {cat.total_amount} (Type: {type(cat.total_amount)}), %: {cat.percentage}")

        # Test Monthly Summary
        print("\n--- Monthly Summary ---")
        summary_response = AnalyticsService.get_monthly_summary(db, user.id, start_date, end_date)
        for item in summary_response.data:
            print(f"{item.month}/{item.year}: Income={item.total_income}, Expense={item.total_expense}")

finally:
    db.close()
