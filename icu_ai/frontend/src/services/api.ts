import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface ProjectEvaluationRequest {
    name: string;
    description: string;
    tech_stack?: string;
    theme?: string;
    time_available?: number;
    team_size?: number;
    github_url?: string;
}

export interface EvaluationResponse {
    id: string;
    overall_score: number;
    scores: {
        technical: number;
        innovation: number;
        impact: number;
        execution: number;
        detailed: Record<string, number>;
    };
    analysis: {
        classification: {
            primary_domain: string;
            secondary_domains: string[];
            tech_categories: string[];
        };
        executive_summary: string;
        strengths: Array<{ title: string; description: string; impact: string }>;
        improvements: Array<{ title: string; description: string; priority: string }>;
    };
    recommendations: {
        quick_wins: Array<{ action: string; why: string; how: string; time_estimate: string }>;
        improvements: Array<{ title: string; description: string; priority: string }>;
        pitch?: {
            elevator_pitch: string;
            key_points: string[];
            demo_flow: string[];
            anticipated_questions: Array<{ question: string; answer: string }>;
        };
    };
    readiness_level: string;
}

export interface QuestionnaireData {
    skill_level: string;
    primary_skill: string;
    languages: string[];
    frameworks: string[];
    team_size: number;
    time_available: number;
    theme?: string;
    required_tech?: string;
    primary_goal: string;
    domain_interests: string[];
    personal_frustrations?: string;
    emerging_tech: string[];
    project_type: string;
    platform: string[];
    ui_importance: string;
    ai_preference: string;
    target_audience: string[];
    desired_change: string[];
}

export interface IdeaResponse {
    id: string;
    ideas: Array<{
        name: string;
        tagline: string;
        domain?: string;
        problem: {
            statement: string;
            why_matters: string;
            current_gaps: string;
        };
        solution: {
            description: string;
            key_features: string[];
            value_proposition: string;
        };
        technical: {
            tech_stack: string[];
            architecture: string;
            components: string[];
            apis: string[];
        };
        roadmap: {
            phase1: { hours: string; tasks: string[] };
            phase2: { hours: string; tasks: string[] };
            phase3: { hours: string; tasks: string[] };
        };
        feasibility: {
            complexity: string;
            learning_curve: string;
            time_fit: string;
            risks: string[];
        };
        differentiation: {
            unique_factors: string[];
            judge_appeal: string;
            competition: string;
        };
        impact: {
            beneficiaries: string;
            scale: string;
            real_world: string;
        };
        wow_factors: string[];
        getting_started?: {
            steps: string[];
            resources: string[];
            boilerplate: string;
        };
        match_score: number;
    }>;
}

export const evaluateProject = async (data: ProjectEvaluationRequest): Promise<EvaluationResponse> => {
    const response = await api.post('/api/evaluate', data);
    return response.data;
};

export const generateIdeas = async (data: QuestionnaireData): Promise<IdeaResponse> => {
    const response = await api.post('/api/generate-ideas', data);
    return response.data;
};

export const uploadFile = async (file: File): Promise<{ text: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const fetchGithubRepo = async (url: string): Promise<{ readme: string; languages: string[] }> => {
    const response = await api.post('/api/github-fetch', { url });
    return response.data;
};

export const fetchStats = async (): Promise<{
    projects_evaluated: number;
    ideas_generated: number;
    recent_activity: Array<{
        type: string;
        name: string;
        created_at: string;
    }>;
}> => {
    const response = await api.get('/api/stats');
    return response.data;
};

export const saveProject = async (data: {
    type: 'evaluation' | 'idea';
    project_id?: string;
    idea_id?: string;
    idea_index?: number;
    create_task?: boolean;
}, token: string): Promise<{ message: string; saved_id: string; task_id?: string }> => {
    const response = await api.post('/api/saved-projects', data, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getSavedProjects = async (token: string): Promise<{
    saved_projects: Array<{
        id: string;
        type: string;
        name: string;
        created_at: string;
        task_id?: string;
    }>;
}> => {
    const response = await api.get('/api/saved-projects', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

export default api;
