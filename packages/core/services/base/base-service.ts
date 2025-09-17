import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { APIServiceConfig } from '../../types';

export abstract class BaseService {
  protected client: AxiosInstance;
  protected config: APIServiceConfig;

  constructor(config: APIServiceConfig) {
    this.config = config;

    // Ensure baseUrl includes the API version
    const baseUrl = config.baseUrl.endsWith('/v1')
      ? config.baseUrl
      : `${config.baseUrl}${config.baseUrl.endsWith('/') ? '' : '/'}v1`;

    this.client = axios.create({
      baseURL: baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
        ...(config.userId && { 'X-User-ID': config.userId }),
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      error => {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.detail || error.response?.data?.message || error.message;
          throw new Error(`API Error: ${message}`);
        }
        throw error;
      }
    );
  }

  protected async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  protected async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  protected async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  protected async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  protected buildUrl(endpoint: string): string {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }
}
