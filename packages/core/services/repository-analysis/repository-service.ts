import { BaseService } from '../base/base-service';
import {
  AnalyzeRepositoryRequest,
  AnalyzeRepositoryResponse,
  RepositoryAnalysisStatusResponse,
  RepositoryAnalysisResultResponse,
  RepositoryListResponse,
  RepositoryDetailsResponse,
  DeleteRepositoryResponse,
} from './repository-types';

export class RepositoryAnalysisService extends BaseService {
  async analyzeRepository(request: AnalyzeRepositoryRequest): Promise<AnalyzeRepositoryResponse> {
    return this.post<AnalyzeRepositoryResponse>('/repository-analysis/analyze', request);
  }

  async getAnalysisStatus(taskId: string): Promise<RepositoryAnalysisStatusResponse> {
    return this.get<RepositoryAnalysisStatusResponse>(`/repository-analysis/tasks/${taskId}`);
  }

  async getAnalysisResult(taskId: string): Promise<RepositoryAnalysisResultResponse> {
    return this.get<RepositoryAnalysisResultResponse>(
      `/repository-analysis/tasks/${taskId}/result`
    );
  }

  async listRepositories(skip?: number, limit?: number): Promise<RepositoryListResponse> {
    const queryParams = new URLSearchParams();

    if (skip !== undefined) queryParams.append('skip', skip.toString());
    if (limit !== undefined) queryParams.append('limit', limit.toString());

    const url = `/repository-analysis/repositories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<RepositoryListResponse>(url);
  }

  async getRepositoryDetails(repoId: string): Promise<RepositoryDetailsResponse> {
    return this.get<RepositoryDetailsResponse>(`/repository-analysis/repositories/${repoId}`);
  }

  async deleteRepository(repoId: string): Promise<DeleteRepositoryResponse> {
    return this.delete<DeleteRepositoryResponse>(`/repository-analysis/repositories/${repoId}`);
  }
}
