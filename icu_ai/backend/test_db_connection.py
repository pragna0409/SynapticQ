from app import app
from database import db

print("Testing Supabase connection...")
with app.app_context():
    try:
        # Create all tables
        db.create_all()
        print("SUCCESS! Database connected and tables created")
        print("\nTables created:")
        print("  - users")
        print("  - projects")
        print("  - evaluations")
        print("  - generated_ideas")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise
