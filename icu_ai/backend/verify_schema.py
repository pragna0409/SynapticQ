"""
Script to verify and add any missing tables/columns from the provided schema
"""
from app import app
from database import db
from sqlalchemy import inspect, text

def verify_and_update_schema():
    """Check if all tables and columns from the provided schema exist"""
    with app.app_context():
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        # Schema definition from user
        required_schema = {
            'users': ['id', 'email', 'name', 'created_at'],
            'projects': ['id', 'user_id', 'name', 'description', 'input_type', 'input_data', 'created_at', 'updated_at'],
            'evaluations': ['id', 'project_id', 'overall_score', 'scores', 'analysis', 'recommendations', 'readiness_level', 'created_at'],
            'generated_ideas': ['id', 'user_id', 'questionnaire_data', 'ideas', 'selected_idea_index', 'created_at'],
            'tasks': ['id', 'user_id', 'title', 'description', 'status', 'priority', 'progress', 'is_favorite', 'project_id', 'idea_id', 'created_at', 'updated_at'],
            'subtasks': ['id', 'task_id', 'title', 'type', 'color', 'completed', 'order_index', 'created_at'],
            'saved_projects': ['id', 'user_id', 'project_id', 'idea_id', 'task_id', 'saved_type', 'created_at'],
            'task_interactions': ['id', 'task_id', 'user_id', 'type', 'content', 'created_at'],
            'schedule_blocks': ['id', 'user_id', 'task_id', 'title', 'start_time', 'end_time', 'date', 'color', 'created_at']
        }
        
        print("Checking database schema...")
        print(f"Existing tables: {existing_tables}\n")
        
        missing_items = []
        
        # Check each table
        for table_name, required_columns in required_schema.items():
            if table_name not in existing_tables:
                print(f"[X] Table '{table_name}' is MISSING")
                missing_items.append(('table', table_name))
            else:
                # Check columns
                existing_columns = [col['name'] for col in inspector.get_columns(table_name)]
                for col in required_columns:
                    if col not in existing_columns:
                        print(f"[X] Column '{col}' is MISSING in table '{table_name}'")
                        missing_items.append(('column', table_name, col))
                    else:
                        print(f"[OK] Column '{col}' exists in table '{table_name}'")
        
        if missing_items:
            print(f"\n[WARNING] Found {len(missing_items)} missing items")
            print("Note: SQLAlchemy will create missing tables/columns automatically on next db.create_all()")
            print("Running db.create_all() to ensure everything exists...")
            db.create_all()
            print("[OK] Database schema updated!")
        else:
            print("\n[SUCCESS] All required tables and columns exist!")
        
        # Show final state
        print("\n=== Final Database State ===")
        for table_name in sorted(inspector.get_table_names()):
            columns = [col['name'] for col in inspector.get_columns(table_name)]
            print(f"\n{table_name}:")
            for col in columns:
                print(f"  - {col}")

if __name__ == '__main__':
    verify_and_update_schema()

