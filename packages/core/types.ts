export interface CodeGuideRequest {
  prompt: string;
  language?: string;
  context?: string;
}

export interface CodeGuideResponse {
  id?: string;
  response?: string;
  refined_prompt?: string;
  content?: string;
  timestamp: string;
  language?: string;
}

export interface APIServiceConfig {
  baseUrl: string;
  apiKey?: string;
  userId?: string;
  timeout?: number;
}

export interface CodeGuideOptions {
  language?: string;
  context?: string;
  verbose?: boolean;
}
