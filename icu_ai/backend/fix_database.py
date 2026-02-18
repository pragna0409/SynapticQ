"""
Script to fix database schema issues by recreating tables with correct schema.
WARNING: This will delete all existing data!
"""
from app import app
from database import db, User, Project, Evaluation, GeneratedIdea, Task, Subtask, SavedProject, TaskInteraction, ScheduleBlock
import os

def fix_database():
    """Drop all tables and recreate them with the correct schema"""
    with app.app_context():
        print("Dropping all existing tables...")
        db.drop_all()
        
        print("Creating tables with correct schema...")
        db.create_all()
        
        print("Database schema fixed successfully!")
        print("\nTables created:")
        print("  - users (with password_hash column)")
        print("  - projects")
        print("  - evaluations")
        print("  - generated_ideas")
        print("  - tasks")
        print("  - subtasks")
        print("  - saved_projects")
        print("  - task_interactions")
        print("  - schedule_blocks")

if __name__ == '__main__':
    fix_database()

