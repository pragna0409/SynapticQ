import os
import json
import uuid
import re
from database import db, GeneratedIdea
from services.ai_client import AIClient

class IdeaGenerationService:
    def __init__(self):
        self.ai_client = AIClient()
    
    def generate_ideas(self, questionnaire: dict) -> dict:
        """Generate personalized project ideas"""
        
        # 1. Build profile from questionnaire
        profile = self._build_user_profile(questionnaire)
        
        # 2. Create generation prompt
        prompt = self._build_generation_prompt(profile)
        
        # 3. Call AI with automatic provider fallback
        try:
            response_text = self.ai_client.generate_content(prompt)
            
            # 4. Extract JSON from response (handle markdown code blocks)
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            elif response_text.startswith('```'):
                response_text = response_text[3:]
            
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Try to find JSON object if wrapped in other text
            json_match = re.search(r'\{[\s\S]*"ideas"[\s\S]*\}', response_text)
            if json_match:
                response_text = json_match.group(0)
            
            # Parse JSON
            try:
                result = json.loads(response_text)
                ideas = result.get('ideas', [])
            except json.JSONDecodeError as json_err:
                print(f"JSON Parse Error: {json_err}")
                print(f"Response text (first 500 chars): {response_text[:500]}")
                raise Exception(f"Failed to parse AI response as JSON: {str(json_err)}")
                
        except Exception as e:
            print(f"Error in generate_ideas: {str(e)}")
            raise Exception(f"Failed to generate ideas: {str(e)}")
        
        # 5. Calculate match scores
        for idea in ideas:
            idea['match_score'] = self._calculate_match_score(profile, idea)
        
        # 6. Sort by match score
        ideas.sort(key=lambda x: x['match_score'], reverse=True)
        
        # 7. Save to database
        idea_id = str(uuid.uuid4())
        generated_idea = GeneratedIdea(
            id=idea_id,
            selected_idea_index=None
        )
        generated_idea.set_questionnaire_data(questionnaire)
        generated_idea.set_ideas(ideas)
        
        db.session.add(generated_idea)
        db.session.commit()
        
        return {
            'id': idea_id,
            'ideas': ideas
        }
    
    def _build_user_profile(self, q: dict) -> dict:
        """Extract key attributes from questionnaire"""
        return {
            'skill_level': q['skill_level'],
            'primary_skill': q['primary_skill'],
            'languages': q['languages'],
            'frameworks': q.get('frameworks', []),
            'team_size': q.get('team_size', 1),
            'time_available': q['time_available'],
            'theme': q.get('theme', ''),
            'required_tech': q.get('required_tech', ''),
            'goals': q['primary_goal'],
            'interests': q.get('domain_interests', []),
            'frustrations': q.get('personal_frustrations', ''),
            'tech_interests': q.get('emerging_tech', []),
            'project_type': q.get('project_type', ''),
            'platform': q.get('platform', []),
            'ui_importance': q.get('ui_importance', 'medium'),
            'ai_preference': q.get('ai_preference', 'optional'),
            'target_audience': q.get('target_audience', []),
            'desired_change': q.get('desired_change', [])
        }
    
    def _build_generation_prompt(self, profile: dict) -> str:
        """Construct idea generation prompt"""
        return f"""
Generate 4 personalized hackathon project ideas based on this profile:

TECHNICAL PROFILE:
- Skill Level: {profile['skill_level']}
- Primary Skill: {profile['primary_skill']}
- Languages: {', '.join(profile['languages'])}
- Frameworks: {', '.join(profile['frameworks']) if profile['frameworks'] else 'None specified'}
- Team Size: {profile['team_size']}

CONSTRAINTS:
- Time Available: {profile['time_available']} hours
- Theme: {profile['theme'] or 'Open-ended'}
- Required Tech: {profile['required_tech'] or 'None'}
- Primary Goal: {profile['goals']}

INTERESTS:
- Domains: {', '.join(profile['interests'])}
- Personal Frustrations: {profile['frustrations'] or 'None mentioned'}
- Tech Interests: {', '.join(profile['tech_interests'])}

PREFERENCES:
- Project Type: {profile['project_type']}
- Platform: {', '.join(profile['platform'])}
- UI Importance: {profile['ui_importance']}
- AI Preference: {profile['ai_preference']}

TARGET:
- Audience: {', '.join(profile['target_audience'])}
- Desired Change: {', '.join(profile['desired_change'])}

Generate 4 diverse ideas in this JSON structure:
{{
  "ideas": [
    {{
      "name": "Creative Project Name",
      "tagline": "One-sentence description",
      "domain": "Primary domain (HealthTech, EdTech, etc.)",
      "problem": {{
        "statement": "Clear problem definition",
        "why_matters": "Impact and importance",
        "current_gaps": "What's missing in existing solutions"
      }},
      "solution": {{
        "description": "How your solution works",
        "key_features": ["feature1", "feature2", "feature3", "feature4"],
        "value_proposition": "What makes this unique"
      }},
      "technical": {{
        "tech_stack": ["React", "Node.js", ...],
        "architecture": "High-level system design description",
        "components": ["component1", "component2"],
        "apis": ["API name and purpose"]
      }},
      "roadmap": {{
        "phase1": {{"hours": "0-8", "tasks": ["task1", "task2", "task3"]}},
        "phase2": {{"hours": "8-16", "tasks": ["task1", "task2", "task3"]}},
        "phase3": {{"hours": "16-24", "tasks": ["task1", "task2", "task3"]}}
      }},
      "feasibility": {{
        "complexity": "low/medium/high",
        "learning_curve": "Description of what needs to be learned",
        "time_fit": "How it fits time constraints",
        "risks": ["risk1 and mitigation", "risk2 and mitigation"]
      }},
      "differentiation": {{
        "unique_factors": ["factor1", "factor2"],
        "judge_appeal": "Why judges will care",
        "competition": "Existing solutions and how you're different"
      }},
      "impact": {{
        "beneficiaries": "Who benefits and how",
        "scale": "Number of people affected",
        "real_world": "Practical applications"
      }},
      "wow_factors": ["impressive element1", "impressive element2"],
      "getting_started": {{
        "steps": ["step1", "step2", "step3"],
        "resources": ["resource1", "resource2"],
        "boilerplate": "Template suggestion"
      }},
      "challenges": [
        {{"obstacle": "challenge", "solution": "how to overcome"}}
      ],
      "extensions": {{
        "post_hackathon": ["feature1", "feature2"],
        "monetization": "Business model ideas",
        "startup_potential": "high/medium/low and why"
      }}
    }}
  ]
}}

CRITICAL JSON REQUIREMENTS:
- Return ONLY valid JSON - no markdown, no code blocks, no explanations
- NO trailing commas in arrays or objects
- NO comments in the JSON
- Use double quotes for all strings
- Ensure all brackets and braces are properly closed

OTHER REQUIREMENTS:
- Make ideas SPECIFIC, not generic
- Ensure feasibility within time constraints
- Match complexity to skill level
- Include at least one "safe" idea and one "ambitious" idea
- Reference real APIs, frameworks, and tools
- Be creative and avoid clichés
- Tailor to their interests and frustrations
"""
    
    def _calculate_match_score(self, profile: dict, idea: dict) -> int:
        """Calculate how well idea matches user profile (0-100)"""
        score = 0
        
        # Skill match (30 points)
        tech_stack = idea.get('technical', {}).get('tech_stack', [])
        languages = profile['languages']
        frameworks = profile['frameworks']
        
        tech_match = sum(1 for tech in tech_stack 
                        if any(lang.lower() in tech.lower() for lang in languages))
        framework_match = sum(1 for tech in tech_stack
                             if any(fw.lower() in tech.lower() for fw in frameworks))
        
        skill_score = min((tech_match + framework_match) * 5, 30)
        score += skill_score
        
        # Complexity vs skill level (20 points)
        complexity = idea.get('feasibility', {}).get('complexity', 'medium')
        skill_level = profile['skill_level']
        
        complexity_match = {
            ('beginner', 'low'): 20,
            ('intermediate', 'medium'): 20,
            ('advanced', 'high'): 20,
            ('intermediate', 'low'): 15,
            ('advanced', 'medium'): 15,
            ('beginner', 'medium'): 10,
        }
        score += complexity_match.get((skill_level, complexity), 5)
        
        # Interest alignment (25 points)
        idea_domain = idea.get('domain', '')
        interest_match = any(interest.lower() in idea_domain.lower() 
                            for interest in profile['interests'])
        if interest_match:
            score += 25
        else:
            score += 10  # Partial credit for diversity
        
        # Time feasibility (15 points)
        time_fit = idea.get('feasibility', {}).get('time_fit', '')
        if 'fits' in time_fit.lower() or 'perfect' in time_fit.lower():
            score += 15
        elif 'tight' in time_fit.lower():
            score += 10
        elif 'ambitious' in time_fit.lower():
            score += 5
        
        # Goal alignment (10 points)
        goal = profile['goals']
        if goal == 'win' and idea.get('differentiation', {}).get('judge_appeal'):
            score += 10
        elif goal == 'learn' and idea.get('feasibility', {}).get('learning_curve'):
            score += 10
        else:
            score += 5
        
        return min(score, 100)
