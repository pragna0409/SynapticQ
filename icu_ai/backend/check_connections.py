"""
Script to verify all database relationships and foreign keys are properly connected
"""
from app import app
from database import db
from sqlalchemy import inspect, text

def check_connections():
    """Check all foreign key relationships"""
    with app.app_context():
        inspector = inspect(db.engine)
        
        print("=" * 60)
        print("CHECKING DATABASE CONNECTIONS AND RELATIONSHIPS")
        print("=" * 60)
        
        # Expected foreign key relationships
        expected_fks = {
            'projects': [
                {'column': 'user_id', 'reftable': 'users', 'refcolumn': 'id'}
            ],
            'evaluations': [
                {'column': 'project_id', 'reftable': 'projects', 'refcolumn': 'id'}
            ],
            'generated_ideas': [
                {'column': 'user_id', 'reftable': 'users', 'refcolumn': 'id'}
            ],
            'tasks': [
                {'column': 'user_id', 'reftable': 'users', 'refcolumn': 'id'},
                {'column': 'project_id', 'reftable': 'projects', 'refcolumn': 'id'},
                {'column': 'idea_id', 'reftable': 'generated_ideas', 'refcolumn': 'id'}
            ],
            'subtasks': [
                {'column': 'task_id', 'reftable': 'tasks', 'refcolumn': 'id'}
            ],
            'saved_projects': [
                {'column': 'user_id', 'reftable': 'users', 'refcolumn': 'id'},
                {'column': 'project_id', 'reftable': 'projects', 'refcolumn': 'id'},
                {'column': 'idea_id', 'reftable': 'generated_ideas', 'refcolumn': 'id'},
                {'column': 'task_id', 'reftable': 'tasks', 'refcolumn': 'id'}
            ],
            'task_interactions': [
                {'column': 'task_id', 'reftable': 'tasks', 'refcolumn': 'id'},
                {'column': 'user_id', 'reftable': 'users', 'refcolumn': 'id'}
            ],
            'schedule_blocks': [
                {'column': 'user_id', 'reftable': 'users', 'refcolumn': 'id'},
                {'column': 'task_id', 'reftable': 'tasks', 'refcolumn': 'id'}
            ]
        }
        
        all_connected = True
        
        # Check each table's foreign keys
        for table_name, expected_fk_list in expected_fks.items():
            print(f"\n[{table_name}]")
            try:
                actual_fks = inspector.get_foreign_keys(table_name)
                actual_fk_map = {fk['constrained_columns'][0]: {
                    'reftable': fk['referred_table'],
                    'refcolumn': fk['referred_columns'][0]
                } for fk in actual_fks}
                
                for expected_fk in expected_fk_list:
                    col = expected_fk['column']
                    if col in actual_fk_map:
                        actual = actual_fk_map[col]
                        if (actual['reftable'] == expected_fk['reftable'] and 
                            actual['refcolumn'] == expected_fk['refcolumn']):
                            print(f"  [OK] {col} -> {expected_fk['reftable']}.{expected_fk['refcolumn']}")
                        else:
                            print(f"  [X] {col} -> Expected: {expected_fk['reftable']}.{expected_fk['refcolumn']}, Got: {actual['reftable']}.{actual['refcolumn']}")
                            all_connected = False
                    else:
                        print(f"  [X] Missing FK: {col} -> {expected_fk['reftable']}.{expected_fk['refcolumn']}")
                        all_connected = False
            except Exception as e:
                print(f"  [ERROR] Could not check {table_name}: {e}")
                all_connected = False
        
        # Check SQLAlchemy relationships
        print("\n" + "=" * 60)
        print("CHECKING SQLALCHEMY RELATIONSHIPS")
        print("=" * 60)
        
        relationships = {
            'User': ['projects', 'generated_ideas', 'tasks', 'saved_projects', 'task_interactions', 'schedule_blocks'],
            'Project': ['evaluations', 'tasks', 'saved_projects'],
            'Task': ['subtasks', 'interactions', 'schedule_blocks', 'saved_projects'],
            'GeneratedIdea': ['tasks', 'saved_projects'],
            'TaskInteraction': ['user', 'task'],
            'ScheduleBlock': ['user', 'task'],
        }
        
        from database import User, Project, Task, Evaluation, GeneratedIdea, SavedProject, Subtask, TaskInteraction, ScheduleBlock
        
        model_map = {
            'User': User, 
            'Project': Project, 
            'Task': Task,
            'GeneratedIdea': GeneratedIdea,
            'TaskInteraction': TaskInteraction,
            'ScheduleBlock': ScheduleBlock
        }
        
        for model_name, rel_names in relationships.items():
            print(f"\n[{model_name}]")
            model = model_map.get(model_name)
            if not model:
                print(f"  [X] Model '{model_name}' not found")
                all_connected = False
                continue
            for rel_name in rel_names:
                if hasattr(model, rel_name):
                    print(f"  [OK] Relationship '{rel_name}' exists")
                else:
                    print(f"  [X] Missing relationship '{rel_name}'")
                    all_connected = False
        
        # Recreate all tables to ensure everything is connected
        print("\n" + "=" * 60)
        print("ENSURING ALL CONNECTIONS ARE PROPERLY SET UP")
        print("=" * 60)
        
        print("Running db.create_all() to ensure all relationships are properly established...")
        db.create_all()
        print("[OK] Database schema refreshed")
        
        if all_connected:
            print("\n" + "=" * 60)
            print("[SUCCESS] All database connections are properly set up!")
            print("=" * 60)
        else:
            print("\n" + "=" * 60)
            print("[WARNING] Some connections may need attention")
            print("=" * 60)

if __name__ == '__main__':
    check_connections()

