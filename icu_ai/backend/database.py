from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

def init_db(app):
    """Initialize database with app"""
    db.init_app(app)
    with app.app_context():
        # Enable foreign key constraints for SQLite
        if 'sqlite' in app.config['SQLALCHEMY_DATABASE_URI']:
            from sqlalchemy import event
            from sqlalchemy.engine import Engine
            
            @event.listens_for(Engine, "connect")
            def set_sqlite_pragma(dbapi_conn, connection_record):
                cursor = dbapi_conn.cursor()
                cursor.execute("PRAGMA foreign_keys=ON")
                cursor.close()
        
        db.create_all()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    avatar_url = db.Column(db.Text)
    status_message = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships (backrefs are automatically created for reverse relationships)
    projects = db.relationship('Project', backref='user', lazy=True, cascade='all, delete-orphan')
    generated_ideas = db.relationship('GeneratedIdea', backref='user', lazy=True, cascade='all, delete-orphan')
    tasks = db.relationship('Task', backref='user', lazy=True, cascade='all, delete-orphan')
    saved_projects = db.relationship('SavedProject', backref='user', lazy=True, cascade='all, delete-orphan')

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    input_type = db.Column(db.String(50))  # 'text', 'file', 'github'
    input_data = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    evaluations = db.relationship('Evaluation', backref='project', lazy=True, cascade='all, delete-orphan')
    tasks = db.relationship('Task', backref='project', lazy=True)
    saved_projects = db.relationship('SavedProject', backref='project', lazy=True)

class Evaluation(db.Model):
    __tablename__ = 'evaluations'
    
    id = db.Column(db.String(36), primary_key=True)
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=False)
    overall_score = db.Column(db.Integer)
    scores = db.Column(db.Text)  # JSON string
    analysis = db.Column(db.Text)  # JSON string
    recommendations = db.Column(db.Text)  # JSON string
    readiness_level = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_scores(self, scores_dict):
        self.scores = json.dumps(scores_dict)
    
    def get_scores(self):
        return json.loads(self.scores) if self.scores else {}
    
    def set_analysis(self, analysis_dict):
        self.analysis = json.dumps(analysis_dict)
    
    def get_analysis(self):
        return json.loads(self.analysis) if self.analysis else {}
    
    def set_recommendations(self, recommendations_dict):
        self.recommendations = json.dumps(recommendations_dict)
    
    def get_recommendations(self):
        return json.loads(self.recommendations) if self.recommendations else {}

class GeneratedIdea(db.Model):
    __tablename__ = 'generated_ideas'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    questionnaire_data = db.Column(db.Text)  # JSON string
    ideas = db.Column(db.Text)  # JSON string
    selected_idea_index = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    tasks = db.relationship('Task', backref='idea', lazy=True)
    saved_projects = db.relationship('SavedProject', backref='idea', lazy=True)
    
    def set_questionnaire_data(self, data_dict):
        self.questionnaire_data = json.dumps(data_dict)
    
    def get_questionnaire_data(self):
        return json.loads(self.questionnaire_data) if self.questionnaire_data else {}
    
    def set_ideas(self, ideas_list):
        self.ideas = json.dumps(ideas_list)
    
    def get_ideas(self):
        return json.loads(self.ideas) if self.ideas else []

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='draft')  # draft, in_progress, editing, done
    priority = db.Column(db.String(20), default='secondary')  # main, secondary, tertiary
    progress = db.Column(db.Integer, default=0)  # 0-100
    is_favorite = db.Column(db.Boolean, default=False)
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=True)
    idea_id = db.Column(db.String(36), db.ForeignKey('generated_ideas.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subtasks = db.relationship('Subtask', backref='task', lazy=True, cascade='all, delete-orphan')
    interactions = db.relationship('TaskInteraction', backref='task', lazy=True, cascade='all, delete-orphan')
    # schedule_blocks and saved_projects backrefs are created in their respective models

class Subtask(db.Model):
    __tablename__ = 'subtasks'
    
    id = db.Column(db.String(36), primary_key=True)
    task_id = db.Column(db.String(36), db.ForeignKey('tasks.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(1))  # A, B, C, D
    color = db.Column(db.String(20))  # blue, purple, pink, yellow, teal
    completed = db.Column(db.Boolean, default=False)
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SavedProject(db.Model):
    __tablename__ = 'saved_projects'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=True)
    idea_id = db.Column(db.String(36), db.ForeignKey('generated_ideas.id'), nullable=True)
    task_id = db.Column(db.String(36), db.ForeignKey('tasks.id'), nullable=True)
    saved_type = db.Column(db.String(20))  # 'evaluation' or 'idea'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships (backrefs are created automatically from other models)

class TaskInteraction(db.Model):
    __tablename__ = 'task_interactions'
    
    id = db.Column(db.String(36), primary_key=True)
    task_id = db.Column(db.String(36), db.ForeignKey('tasks.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(20))  # comment, view, attachment
    content = db.Column(db.Text)  # For comments or attachment URLs
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships (backref='task' is already created in Task model)
    user = db.relationship('User', backref='task_interactions', lazy=True)

class ScheduleBlock(db.Model):
    __tablename__ = 'schedule_blocks'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    task_id = db.Column(db.String(36), db.ForeignKey('tasks.id'), nullable=True)
    title = db.Column(db.String(255))
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    date = db.Column(db.Date, nullable=False)
    color = db.Column(db.String(20))  # blue, purple, pink, yellow, teal
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='schedule_blocks', lazy=True)
    task = db.relationship('Task', backref='schedule_blocks', lazy=True)

