// API Client for Next.js Image Gen Backend

export const API_BASE_URL = 'http://localhost:8000/api/v1';
export const ASSET_BASE_URL = 'http://localhost:8000';

export interface PipelineInfo {
  description: string;
  types: Record<string, string>;
}

export interface PipelinesResponse {
  pipelines: Record<string, PipelineInfo>;
}

export interface GenerateRequestPayload {
  prompt: string;
  pipeline: string;
  style_type?: string;
  width: number;
  height: number;
  steps: number;
  cfg: number;
  negative_prompt?: string;
}

export interface JobResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  image_url: string | null;
  error: string | null;
  updated_at: number;
}

export async function fetchPipelines(): Promise<PipelinesResponse> {
  const res = await fetch(`${API_BASE_URL}/pipelines`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch pipelines');
  return res.json();
}

export async function submitGeneration(payload: GenerateRequestPayload): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      style_type: payload.style_type || null,
      negative_prompt: payload.negative_prompt || null,
    }),
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Failed to submit job');
  }
  
  const data = await res.json();
  return data.job_id;
}

export async function pollJobStatus(jobId: string): Promise<JobResponse> {
  const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to poll status');
  return res.json();
}
