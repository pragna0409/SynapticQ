from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import uuid
from datetime import datetime, date, time
from database import db, init_db, User, Project, Evaluation, GeneratedIdea, Task, Subtask, SavedProject, TaskInteraction, ScheduleBlock
from services.evaluation_service import EvaluationService
from services.idea_generation_service import IdeaGenerationService
from auth import hash_password, verify_password, generate_token, require_auth, optional_auth

# Load environment variables from parent directory's .env file
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///hackathon_helper.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')


CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3001", "http://localhost:3000", "http://localhost:3002", "http://localhost:3004"]}}, supports_credentials=True)

# Initialize database
init_db(app)

# Initialize services
eval_service = EvaluationService()
idea_service = IdeaGenerationService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Hackathon Helper API',
        'version': '1.0.0'
    })

@app.route('/api/evaluate', methods=['POST'])
def evaluate_project():
    """Evaluate a hackathon project"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('name') or not data.get('description'):
            return jsonify({'error': 'Project name and description are required'}), 400
        
        # Check description length
        if len(data['description'].split()) < 100:
            return jsonify({'error': 'Description must be at least 100 words'}), 400
        
        # Perform evaluation
        result = eval_service.evaluate_project(data)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error in evaluate_project: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-ideas', methods=['POST'])
def generate_ideas():
    """Generate personalized project ideas"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['skill_level', 'primary_skill', 'languages', 'time_available', 'primary_goal']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Generate ideas
        result = idea_service.generate_ideas(data)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error in generate_ideas: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file uploads"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file size
        max_size = int(os.getenv('MAX_FILE_SIZE_MB', 25)) * 1024 * 1024
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > max_size:
            return jsonify({'error': f'File too large. Max size: {max_size // (1024*1024)}MB'}), 413
        
        # Parse file based on extension
        from services.file_parser import parse_file
        text = parse_file(file)
        
        return jsonify({'text': text}), 200
        
    except Exception as e:
        print(f"Error in upload_file: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/github-fetch', methods=['POST'])
def fetch_github():
    """Fetch GitHub repository information"""
    try:
        data = request.json
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'GitHub URL is required'}), 400
        
        from services.file_parser import fetch_github_repo
        result = fetch_github_repo(url)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error in fetch_github: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Create a new user account"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({'error': 'Email, password, and name are required'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(data['password'])
        
        new_user = User(
            id=user_id,
            email=data['email'],
            password_hash=hashed_password,
            name=data['name'],
            avatar_url=data.get('avatar_url'),
            status_message=data.get('status_message', 'Ready to build amazing projects!')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate token
        token = generate_token(user_id, data['email'])
        
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': {
                'id': user_id,
                'email': data['email'],
                'name': data['name'],
                'avatar_url': data.get('avatar_url'),
                'status_message': new_user.status_message
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in signup: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login and get JWT token"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Verify password
        if not verify_password(data['password'], user.password_hash):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token(user.id, user.email)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'avatar_url': user.avatar_url,
                'status_message': user.status_message
            }
        }), 200
        
    except Exception as e:
        print(f"Error in login: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@require_auth
def get_current_user():
    """Get current user info"""
    try:
        user = User.query.get(request.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'avatar_url': user.avatar_url,
            'status_message': user.status_message,
            'created_at': user.created_at.isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error in get_current_user: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    """Logout endpoint (token invalidation handled client-side)"""
    try:
        # With JWT, logout is primarily client-side (token removal)
        # In a production app, you might want to maintain a blacklist
        return jsonify({
            'message': 'Logout successful'
        }), 200
        
    except Exception as e:
        print(f"Error in logout: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============================================
# TASK MANAGEMENT ENDPOINTS
# ============================================

@app.route('/api/tasks', methods=['GET'])
@require_auth
def get_tasks():
    """Get all tasks for current user"""
    try:
        tasks = Task.query.filter_by(user_id=request.user_id).order_by(Task.created_at.desc()).all()
        
        result = []
        for task in tasks:
            # Get subtasks
            subtasks = [{
                'id': st.id,
                'title': st.title,
                'type': st.type,
                'color': st.color,
                'completed': st.completed,
                'order_index': st.order_index
            } for st in task.subtasks]
            
            # Get interaction counts
            comments_count = TaskInteraction.query.filter_by(task_id=task.id, type='comment').count()
            views_count = TaskInteraction.query.filter_by(task_id=task.id, type='view').count()
            attachments_count = TaskInteraction.query.filter_by(task_id=task.id, type='attachment').count()
            
            result.append({
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'status': task.status,
                'priority': task.priority,
                'progress': task.progress,
                'is_favorite': task.is_favorite,
                'subtasks': subtasks,
                'interactions': {
                    'comments': comments_count,
                    'views': views_count,
                    'attachments': attachments_count
                },
                'created_at': task.created_at.isoformat(),
                'updated_at': task.updated_at.isoformat()
            })
        
        return jsonify({'tasks': result}), 200
        
    except Exception as e:
        print(f"Error in get_tasks: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks', methods=['POST'])
@require_auth
def create_task():
    """Create a new task"""
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'error': 'Task title is required'}), 400
        
        task_id = str(uuid.uuid4())
        new_task = Task(
            id=task_id,
            user_id=request.user_id,
            title=data['title'],
            description=data.get('description'),
            status=data.get('status', 'draft'),
            priority=data.get('priority', 'secondary'),
            progress=data.get('progress', 0),
            is_favorite=data.get('is_favorite', False)
        )
        
        db.session.add(new_task)
        
        # Add subtasks if provided
        if data.get('subtasks'):
            for idx, subtask_data in enumerate(data['subtasks']):
                subtask = Subtask(
                    id=str(uuid.uuid4()),
                    task_id=task_id,
                    title=subtask_data['title'],
                    type=subtask_data.get('type'),
                    color=subtask_data.get('color'),
                    completed=subtask_data.get('completed', False),
                    order_index=idx
                )
                db.session.add(subtask)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Task created successfully',
            'task_id': task_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in create_task: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<task_id>', methods=['PUT'])
@require_auth
def update_task(task_id):
    """Update a task"""
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Verify ownership
        if task.user_id != request.user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.json
        
        # Update fields
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'status' in data:
            task.status = data['status']
        if 'priority' in data:
            task.priority = data['priority']
        if 'progress' in data:
            task.progress = data['progress']
        if 'is_favorite' in data:
            task.is_favorite = data['is_favorite']
        
        task.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Task updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in update_task: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@require_auth
def delete_task(task_id):
    """Delete a task"""
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Verify ownership
        if task.user_id != request.user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': 'Task deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_task: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<task_id>/subtasks', methods=['POST'])
@require_auth
def add_subtask(task_id):
    """Add a subtask to a task"""
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Verify ownership
        if task.user_id != request.user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.json
        if not data.get('title'):
            return jsonify({'error': 'Subtask title is required'}), 400
        
        # Get current max order index
        max_order = db.session.query(db.func.max(Subtask.order_index)).filter_by(task_id=task_id).scalar() or -1
        
        subtask = Subtask(
            id=str(uuid.uuid4()),
            task_id=task_id,
            title=data['title'],
            type=data.get('type'),
            color=data.get('color'),
            completed=data.get('completed', False),
            order_index=max_order + 1
        )
        
        db.session.add(subtask)
        db.session.commit()
        
        return jsonify({'message': 'Subtask added successfully', 'subtask_id': subtask.id}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in add_subtask: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/subtasks/<subtask_id>', methods=['PUT'])
@require_auth
def update_subtask(subtask_id):
    """Update a subtask"""
    try:
        subtask = Subtask.query.get(subtask_id)
        if not subtask:
            return jsonify({'error': 'Subtask not found'}), 404
        
        # Verify ownership through task
        task = Task.query.get(subtask.task_id)
        if task.user_id != request.user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.json
        
        if 'title' in data:
            subtask.title = data['title']
        if 'completed' in data:
            subtask.completed = data['completed']
        if 'type' in data:
            subtask.type = data['type']
        if 'color' in data:
            subtask.color = data['color']
        
        db.session.commit()
        
        return jsonify({'message': 'Subtask updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in update_subtask: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============================================
# SAVED PROJECTS ENDPOINTS
# ============================================

@app.route('/api/saved-projects', methods=['POST'])
@require_auth
def save_project():
    """Save an evaluation or idea to user's dashboard"""
    try:
        data = request.json
        
        saved_type = data.get('type')  # 'evaluation' or 'idea'
        if saved_type not in ['evaluation', 'idea']:
            return jsonify({'error': 'Type must be "evaluation" or "idea"'}), 400
        
        # Check if we should create a task (default: True for backward compatibility)
        create_task = data.get('create_task', True)
        
        saved_id = str(uuid.uuid4())
        task_id = None
        
        if saved_type == 'evaluation':
            # Get evaluation data
            project_id = data.get('project_id')
            evaluation = Evaluation.query.filter_by(project_id=project_id).first()
            project = Project.query.get(project_id)
            
            if not evaluation or not project:
                return jsonify({'error': 'Project or evaluation not found'}), 404
            
            if create_task:
                # Create task from saved project
                task_id = str(uuid.uuid4())
                
                # Determine status based on score
                score = evaluation.overall_score
                if score < 40:
                    status = 'draft'
                    priority = 'tertiary'
                elif score < 60:
                    status = 'in_progress'
                    priority = 'secondary'
                elif score < 76:
                    status = 'editing'
                    priority = 'secondary'
                else:
                    status = 'done'
                    priority = 'main'
                
                # Create task
                task = Task(
                    id=task_id,
                    user_id=request.user_id,
                    title=project.name,
                    description=project.description,
                    status=status,
                    priority=priority,
                    progress=score,
                    project_id=project_id
                )
                db.session.add(task)
                
                # Add subtasks from recommendations
                recommendations = evaluation.get_recommendations()
                if recommendations:
                    quick_wins = recommendations.get('quick_wins', [])
                    medium_improvements = recommendations.get('medium_improvements', [])
                    major_enhancements = recommendations.get('major_enhancements', [])
                    
                    idx = 0
                    for win in quick_wins[:3]:
                        subtask = Subtask(
                            id=str(uuid.uuid4()),
                            task_id=task_id,
                            title=win,
                            type='A',
                            color='blue',
                            order_index=idx
                        )
                        db.session.add(subtask)
                        idx += 1
                    
                    for improvement in medium_improvements[:3]:
                        subtask = Subtask(
                            id=str(uuid.uuid4()),
                            task_id=task_id,
                            title=improvement,
                            type='B',
                            color='purple',
                            order_index=idx
                        )
                        db.session.add(subtask)
                        idx += 1
                    
                    for enhancement in major_enhancements[:2]:
                        subtask = Subtask(
                            id=str(uuid.uuid4()),
                            task_id=task_id,
                            title=enhancement,
                            type='C',
                            color='pink',
                            order_index=idx
                        )
                        db.session.add(subtask)
                        idx += 1
            
            saved_project = SavedProject(
                id=saved_id,
                user_id=request.user_id,
                project_id=project_id,
                task_id=task_id,
                saved_type='evaluation'
            )
            
        else:  # idea
            idea_id = data.get('idea_id')
            idea_index = data.get('idea_index', 0)
            
            generated_idea = GeneratedIdea.query.get(idea_id)
            if not generated_idea:
                return jsonify({'error': 'Idea not found'}), 404
            
            if create_task:
                # Create task from idea
                task_id = str(uuid.uuid4())
                ideas = generated_idea.get_ideas()
                if idea_index >= len(ideas):
                    return jsonify({'error': 'Invalid idea index'}), 400
                
                selected_idea = ideas[idea_index]
                
                # Create task
                task = Task(
                    id=task_id,
                    user_id=request.user_id,
                    title=selected_idea.get('name', 'Untitled Idea'),
                    description=selected_idea.get('problem', {}).get('statement', ''),
                    status='draft',
                    priority='main' if selected_idea.get('match_score', 0) > 80 else 'secondary',
                    progress=0,
                    idea_id=idea_id
                )
                db.session.add(task)
                
                # Add subtasks from roadmap
                roadmap = selected_idea.get('roadmap', {})
                idx = 0
                for phase_key in ['phase1', 'phase2', 'phase3']:
                    phase = roadmap.get(phase_key, {})
                    tasks_list = phase.get('tasks', [])
                    for task_title in tasks_list[:2]:  # Take first 2 tasks from each phase
                        subtask = Subtask(
                            id=str(uuid.uuid4()),
                            task_id=task_id,
                            title=task_title,
                            type=chr(65 + (idx % 4)),  # A, B, C, D
                            color=['blue', 'purple', 'pink', 'yellow'][idx % 4],
                            order_index=idx
                        )
                        db.session.add(subtask)
                        idx += 1
            
            saved_project = SavedProject(
                id=saved_id,
                user_id=request.user_id,
                idea_id=idea_id,
                task_id=task_id,
                saved_type='idea'
            )
        
        db.session.add(saved_project)
        db.session.commit()
        
        return jsonify({
            'message': 'Project saved successfully',
            'saved_id': saved_id,
            'task_id': task_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in save_project: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/saved-projects', methods=['GET'])
@require_auth
def get_saved_projects():
    """Get all saved projects for current user"""
    try:
        saved_projects = SavedProject.query.filter_by(user_id=request.user_id).order_by(SavedProject.created_at.desc()).all()
        
        result = []
        for sp in saved_projects:
            name = 'Untitled'
            if sp.saved_type == 'evaluation' and sp.project_id:
                project = Project.query.get(sp.project_id)
                if project:
                    name = project.name
            elif sp.saved_type == 'idea' and sp.idea_id:
                generated_idea = GeneratedIdea.query.get(sp.idea_id)
                if generated_idea:
                    ideas = generated_idea.get_ideas()
                    if ideas:
                        name = ideas[0].get('name', 'Untitled Idea')
            
            result.append({
                'id': sp.id,
                'type': sp.saved_type,
                'name': name,
                'project_id': sp.project_id,
                'idea_id': sp.idea_id,
                'task_id': sp.task_id,
                'created_at': sp.created_at.isoformat() if sp.created_at else None
            })
        
        return jsonify({'saved_projects': result}), 200
        
    except Exception as e:
        print(f"Error in get_saved_projects: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ============================================
# ANALYTICS ENDPOINTS
# ============================================

@app.route('/api/analytics/completed', methods=['GET'])
@require_auth
def get_completed_tasks_analytics():
    """Get completed tasks statistics"""
    try:
        completed_tasks = Task.query.filter_by(user_id=request.user_id, status='done').all()
        
        # Count by priority
        main_count = sum(1 for t in completed_tasks if t.priority == 'main')
        secondary_count = sum(1 for t in completed_tasks if t.priority == 'secondary')
        tertiary_count = sum(1 for t in completed_tasks if t.priority == 'tertiary')
        
        return jsonify({
            'total': len(completed_tasks),
            'by_priority': {
                'main': main_count,
                'secondary': secondary_count,
                'tertiary': tertiary_count
            }
        }), 200
        
    except Exception as e:
        print(f"Error in get_completed_tasks_analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/efficiency', methods=['GET'])
@require_auth
def get_efficiency_analytics():
    """Get efficiency metrics"""
    try:
        all_tasks = Task.query.filter_by(user_id=request.user_id).all()
        
        if not all_tasks:
            return jsonify({'efficiency': 0}), 200
        
        # Calculate efficiency based on progress and completion
        total_progress = sum(t.progress for t in all_tasks)
        avg_progress = total_progress / len(all_tasks) if all_tasks else 0
        
        completed_count = sum(1 for t in all_tasks if t.status == 'done')
        completion_rate = (completed_count / len(all_tasks) * 100) if all_tasks else 0
        
        # Overall efficiency is average of progress and completion rate
        efficiency = (avg_progress + completion_rate) / 2
        
        return jsonify({
            'efficiency': round(efficiency),
            'avg_progress': round(avg_progress),
            'completion_rate': round(completion_rate),
            'total_tasks': len(all_tasks),
            'completed_tasks': completed_count
        }), 200
        
    except Exception as e:
        print(f"Error in get_efficiency_analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/schedule', methods=['GET'])
@require_auth
def get_schedule():
    """Get today's schedule"""
    try:
        today = date.today()
        schedule_blocks = ScheduleBlock.query.filter_by(
            user_id=request.user_id,
            date=today
        ).order_by(ScheduleBlock.start_time).all()
        
        result = []
        for block in schedule_blocks:
            result.append({
                'id': block.id,
                'title': block.title,
                'start_time': block.start_time.strftime('%H:%M'),
                'end_time': block.end_time.strftime('%H:%M'),
                'color': block.color,
                'task_id': block.task_id
            })
        
        return jsonify({'schedule': result}), 200
        
    except Exception as e:
        print(f"Error in get_schedule: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/schedule', methods=['POST'])
@require_auth
def add_schedule_block():
    """Add a schedule block"""
    try:
        data = request.json
        
        if not data.get('title') or not data.get('start_time') or not data.get('end_time'):
            return jsonify({'error': 'Title, start_time, and end_time are required'}), 400
        
        # Parse times
        from datetime import datetime as dt
        start_time = dt.strptime(data['start_time'], '%H:%M').time()
        end_time = dt.strptime(data['end_time'], '%H:%M').time()
        schedule_date = dt.strptime(data.get('date', date.today().isoformat()), '%Y-%m-%d').date()
        
        block = ScheduleBlock(
            id=str(uuid.uuid4()),
            user_id=request.user_id,
            task_id=data.get('task_id'),
            title=data['title'],
            start_time=start_time,
            end_time=end_time,
            date=schedule_date,
            color=data.get('color', 'blue')
        )
        
        db.session.add(block)
        db.session.commit()
        
        return jsonify({'message': 'Schedule block added successfully', 'block_id': block.id}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in add_schedule_block: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
