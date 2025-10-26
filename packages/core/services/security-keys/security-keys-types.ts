/**
 * Security Keys Service Types
 *
 * This file contains type definitions for the Security Keys service,
 * which manages provider API keys and GitHub tokens.
 */

// ============================================================================
// Core Types
// ============================================================================

export interface SecurityKeyData {
  id: string
  created_at: string
  user_id: string
  name: string
  displayed_name: string
  value_masked: string
  value?: string // Only included when reveal=true
  object_value: Record<string, any>
  encryption: string
  key_version: string
}

export interface ProviderAPIKeyData extends SecurityKeyData {
  provider_id: string
  provider_name: string
  provider_key: string
  provider_logo_src?: string // Only included in list endpoint
  object_value: {
    provider_id: string
  }
}

export interface GitHubTokenData extends SecurityKeyData {
  object_value: {
    token_type: string
  }
}

// ============================================================================
// Common Response Types
// ============================================================================

export interface SuccessResponse<T> {
  status: 'success'
  data: T
}

export interface ErrorResponse {
  detail: string
}

// ============================================================================
// Provider API Key Types
// ============================================================================

export interface CreateProviderAPIKeyRequest {
  provider_key: string
  api_key: string
}

export interface CreateProviderAPIKeyResponse extends SuccessResponse<ProviderAPIKeyData> {}

export interface GetProviderAPIKeyResponse extends SuccessResponse<ProviderAPIKeyData> {}

export interface ListProviderAPIKeysResponse extends SuccessResponse<ProviderAPIKeyData[]> {}

// ============================================================================
// GitHub Token Types
// ============================================================================

export interface CreateGitHubTokenRequest {
  github_token: string
}

export interface CreateGitHubTokenResponse extends SuccessResponse<GitHubTokenData> {}

export interface GetGitHubTokenResponse extends SuccessResponse<GitHubTokenData> {}

// ============================================================================
// Error Response Types
// ============================================================================

export interface ProviderNotFoundError extends ErrorResponse {
  detail: string // "Provider 'invalid_provider' not found. Please choose a valid provider."
}

export interface DuplicateKeyError extends ErrorResponse {
  detail: string // "API key for provider 'openai' already exists. Use update endpoint to change it."
}

export interface KeyNotFoundError extends ErrorResponse {
  detail: string // "No API key found for provider 'anthropic'"
}

export interface InvalidGitHubTokenFormatError extends ErrorResponse {
  detail: string // "Invalid GitHub token format. Expected format: ghp_*, gho_*, ghu_*, ghs_*, or ghr_* followed by 36 characters"
}

export interface GitHubTokenValidationError extends ErrorResponse {
  detail: string // "GitHub token validation failed. Please check that the token is valid and has the necessary permissions."
}

export interface DuplicateGitHubTokenError extends ErrorResponse {
  detail: string // "GitHub token already exists. Use update endpoint to change it."
}

export interface GitHubTokenNotFoundError extends ErrorResponse {
  detail: string // "No GitHub token found"
}

export interface AuthenticationError extends ErrorResponse {
  detail: string // "Authentication required. Provide either Bearer token (JWT or sk_...) or X-API-Key with X-User-ID headers"
}

export interface InternalServerError extends ErrorResponse {
  detail: string // "Failed to save provider API key"
}

// ============================================================================
// Request/Response Type Unions
// ============================================================================

export type ProviderAPIKeyResponse =
  | CreateProviderAPIKeyResponse
  | GetProviderAPIKeyResponse
  | ListProviderAPIKeysResponse
  | RevokeProviderAPIKeyResponse
  | SecurityKeysError

// ============================================================================
// DELETE Response Types
// ============================================================================

export interface RevokeProviderAPIKeyResponse {
  status: string
  message: string
  revoked_provider_id: string
}

export interface RevokeGitHubTokenResponse {
  status: string
  message: string
  revoked_at: string
}

// ============================================================================
// DELETE Error Types
// ============================================================================

export interface ProviderAPIKeyNotFoundError extends ErrorResponse {
  detail: string // "No API key found for provider 'openai'"
}

export interface ProviderAPIKeyDeletionError extends ErrorResponse {
  detail: string // "Failed to delete provider API key"
}

export interface GitHubTokenDeletionError extends ErrorResponse {
  detail: string // "Failed to delete GitHub token"
}

// ============================================================================
// Union Types for Error Handling
// ============================================================================

export type SecurityKeysError =
  | ProviderNotFoundError
  | DuplicateKeyError
  | KeyNotFoundError
  | InvalidGitHubTokenFormatError
  | GitHubTokenValidationError
  | DuplicateGitHubTokenError
  | GitHubTokenNotFoundError
  | ProviderAPIKeyNotFoundError
  | ProviderAPIKeyDeletionError
  | GitHubTokenDeletionError
  | AuthenticationError
  | InternalServerError
  | ErrorResponse

export type GitHubTokenResponse =
  | CreateGitHubTokenResponse
  | GetGitHubTokenResponse
  | RevokeGitHubTokenResponse
  | SecurityKeysError