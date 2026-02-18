import os
import json
import uuid
from database import db, Project, Evaluation
from services.ai_client import AIClient

class EvaluationService:
    def __init__(self):
        self.ai_client = AIClient()
    
    def evaluate_project(self, project_data: dict) -> dict:
        """Main evaluation function"""
        
        # 1. Build comprehensive prompt
        prompt = self._build_evaluation_prompt(project_data)
        
        # 2. Call AI with automatic provider fallback
        try:
            response_text = self.ai_client.generate_content(prompt)
            print(f"DEBUG: AI Response: {response_text[:500]}...") # Log first 500 chars
            
            # 3. Extract JSON from response (more robustly)
            import re
            json_match = re.search(r'(\{.*\})', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1)
            else:
                # Fallback to existing logic if regex fails (unlikely if JSON is present)
                if response_text.startswith('```json'):
                    response_text = response_text[7:]
                elif response_text.startswith('```'):
                    response_text = response_text[3:]
                
                if response_text.endswith('```'):
                    response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            analysis = json.loads(response_text)
            
        except Exception as e:
            print(f"Error in evaluate_project: {str(e)}")
            if 'response_text' in locals():
                print(f"Failed response text: {response_text}")
            raise Exception(f"Failed to evaluate project: {str(e)}")
        
        # 4. Calculate scores
        scores = self._calculate_scores(analysis.get('scores', {}))
        
        # 5. Generate recommendations
        recommendations = {
            'quick_wins': analysis.get('quick_wins', []),
            'improvements': analysis.get('improvements', []),
            'strengths': analysis.get('strengths', []),
            'pitch': analysis.get('pitch_suggestions', {})
        }
        
        # 6. Save to database
        project_id = str(uuid.uuid4())
        eval_id = str(uuid.uuid4())
        
        project = Project(
            id=project_id,
            name=project_data['name'],
            description=project_data['description'],
            input_type='text',
            input_data=json.dumps(project_data)
        )
        
        evaluation = Evaluation(
            id=eval_id,
            project_id=project_id,
            overall_score=scores['overall'],
            readiness_level=self._classify_readiness(scores['overall'])
        )
        evaluation.set_scores(scores)
        evaluation.set_analysis(analysis)
        evaluation.set_recommendations(recommendations)
        
        db.session.add(project)
        db.session.add(evaluation)
        db.session.commit()
        
        return {
            'id': eval_id,
            'overall_score': scores['overall'],
            'scores': scores,
            'analysis': analysis,
            'recommendations': recommendations,
            'readiness_level': evaluation.readiness_level
        }
    
    def _build_evaluation_prompt(self, project_data: dict) -> str:
        """Construct detailed evaluation prompt"""
        return f"""
Evaluate this hackathon project AS AN EXTREMELY HARSH CRITIC:

PROJECT NAME: {project_data['name']}
DESCRIPTION: {project_data['description']}
TECH STACK: {project_data.get('tech_stack', 'Not specified')}
TEAM SIZE: {project_data.get('team_size', 1)}
TIME: {project_data.get('time_available', 'Not specified')} hours
THEME: {project_data.get('theme', 'Open-ended')}

CRITICAL SCORING GUIDELINES - BE BRUTALLY HARSH:
- Novelty/joke projects (smart dustbins, meme generators): 10-25 MAX
- Simple CRUD apps or basic prototypes: 20-40 MAX
- Decent working projects with some innovation: 40-60
- Only truly exceptional, production-ready projects: 60-75
- Scores 75+ are EXTREMELY rare (top 5% globally)
- Scores 85+ are nearly impossible (unicorn startups)

ASK YOURSELF (be brutally honest):
- Is this a joke/novelty project? → 10-25 MAX
- Just combining existing tools? → 30 MAX
- Could be used in production? If NO → 40 MAX
- Would investors fund this? If NO → 35 MAX
- Is there real innovation? If NO → 30 MAX

SCORING SCALE (BE BRUTAL):
- 9-10: Impossible to achieve, unicorn potential
- 7-8: Could raise funding (extremely rare)
- 5-6: Solid product, real innovation (rare)
- 3-4: Working prototype (most good projects)
- 1-2: Toy/novelty/joke (most projects)

EXAMPLES:
- Smart dustbin that insults: 15-22 (novelty)
- AI todo app: 25-35 (overdone)
- Meme generator: 10-20 (toy)

Provide evaluation in this EXACT JSON structure:
{{
  "classification": {{
    "primary_domain": "string (e.g., HealthTech, EdTech, FinTech)",
    "secondary_domains": ["string"],
    "tech_categories": ["string"]
  }},
  "executive_summary": "string (100-150 words overview)",
  "scores": {{
    "code_quality": 0-10,
    "technical_complexity": 0-10,
    "tech_stack_modernity": 0-10,
    "implementation_quality": 0-10,
    "originality": 0-10,
    "creative_problem_solving": 0-10,
    "feature_innovation": 0-10,
    "real_world_applicability": 0-10,
    "market_potential": 0-10,
    "social_impact": 0-10,
    "scalability": 0-10,
    "completeness": 0-10,
    "user_experience": 0-10,
    "presentation_quality": 0-10,
    "documentation": 0-10,
    "wow_factor": 0-10
  }},
  "strengths": [
    {{"title": "string", "description": "string", "impact": "high/medium/low"}}
  ],
  "improvements": [
    {{"title": "string", "description": "string", "priority": "high/medium/low"}}
  ],
  "quick_wins": [
    {{
      "action": "string",
      "why": "string",
      "how": "string",
      "time_estimate": "1-2 hours"
    }}
  ],
  "pitch_suggestions": {{
    "elevator_pitch": "string",
    "key_points": ["string"],
    "demo_flow": ["string"],
    "anticipated_questions": [
      {{"question": "string", "answer": "string"}}
    ]
  }},
  "wow_factor_enhancements": ["string"],
  "resources": {{
    "apis": ["string"],
    "libraries": ["string"],
    "tutorials": ["string"]
  }}
}}

Be specific, actionable, and constructive. Focus on improvement paths.
"""
    
    def _calculate_scores(self, scores_dict: dict) -> dict:
        """Calculate weighted overall score"""
        
        # Technical Excellence (25%)
        technical = (
            scores_dict.get('code_quality', 5) +
            scores_dict.get('technical_complexity', 5) +
            scores_dict.get('tech_stack_modernity', 5) +
            scores_dict.get('implementation_quality', 5)
        ) / 4
        
        # Innovation (25%)
        innovation = (
            scores_dict.get('originality', 5) +
            scores_dict.get('creative_problem_solving', 5) +
            scores_dict.get('feature_innovation', 5)
        ) / 3
        
        # Impact (25%)
        impact = (
            scores_dict.get('real_world_applicability', 5) +
            scores_dict.get('market_potential', 5) +
            scores_dict.get('social_impact', 5) +
            scores_dict.get('scalability', 5)
        ) / 4
        
        # Execution (25%)
        execution = (
            scores_dict.get('completeness', 5) +
            scores_dict.get('user_experience', 5) +
            scores_dict.get('presentation_quality', 5) +
            scores_dict.get('documentation', 5)
        ) / 4
        
        overall = (technical * 0.25 + innovation * 0.25 + 
                   impact * 0.25 + execution * 0.25) * 10
        
        # Add wow factor bonus (up to +5)
        wow_bonus = min(scores_dict.get('wow_factor', 5) * 0.5, 5)
        overall = min(overall + wow_bonus, 100)
        
        return {
            'technical': round(technical, 1),
            'innovation': round(innovation, 1),
            'impact': round(impact, 1),
            'execution': round(execution, 1),
            'overall': round(overall, 0),
            'detailed': scores_dict
        }
    
    def _classify_readiness(self, overall_score: float) -> str:
        """Classify project readiness level"""
        if overall_score >= 90:
            return 'exceptional'
        elif overall_score >= 76:
            return 'winner_potential'
        elif overall_score >= 61:
            return 'competition_ready'
        elif overall_score >= 41:
            return 'demo_ready'
        else:
            return 'early_prototype'
