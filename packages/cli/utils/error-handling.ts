/**
 * Error handling utilities for the CLI
 */

export interface ApiError {
  message?: string
  code?: string
  status?: number
  response?: {
    data?: any
    status?: number
    statusText?: string
  }
  request?: {
    url?: string
    method?: string
  }
}

/**
 * Format and display error messages in a user-friendly way
 */
export function handleError(error: unknown, context: string = ''): void {
  console.error('❌ Error:')

  if (context) {
    console.error(`   Context: ${context}`)
  }

  if (error instanceof Error) {
    // Handle standard Error objects
    console.error(`   Message: ${error.message}`)

    // Check if it's an API error with additional details
    if (isApiError(error)) {
      handleApiError(error as ApiError & Error)
    } else {
      // Handle generic errors
      console.error(`   Type: ${error.constructor.name}`)

      // Show stack trace in verbose mode or for debugging
      if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
        console.error(`   Stack: ${error.stack}`)
      }
    }
  } else if (typeof error === 'string') {
    console.error(`   Message: ${error}`)
  } else if (error && typeof error === 'object') {
    // Handle object errors (like API responses)
    handleObjectError(error as Record<string, unknown>)
  } else {
    console.error('   An unknown error occurred')
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.error(`   Raw error: ${JSON.stringify(error, null, 2)}`)
    }
  }

  // Show helpful suggestions
  showErrorSuggestions(error)
}

/**
 * Check if an error is an API error
 */
function isApiError(error: Error): error is ApiError & Error {
  return 'response' in error || 'code' in error || 'status' in error
}

/**
 * Handle API-specific errors
 */
function handleApiError(error: ApiError & Error): void {
  if (error.response?.status) {
    console.error(`   HTTP Status: ${error.response.status} ${error.response.statusText || ''}`)

    switch (error.response.status) {
      case 400:
        console.error('   Issue: Bad request - please check your input')
        break
      case 401:
        console.error('   Issue: Authentication failed - please check your API key')
        break
      case 403:
        console.error('   Issue: Access denied - your API key may not have permission')
        break
      case 404:
        console.error('   Issue: Resource not found - the requested endpoint may not exist')
        break
      case 429:
        console.error('   Issue: Rate limit exceeded - please wait before trying again')
        break
      case 500:
        console.error('   Issue: Server error - please try again later')
        break
      case 502:
      case 503:
      case 504:
        console.error('   Issue: Service unavailable - the API is temporarily down')
        break
      default:
        console.error('   Issue: API request failed')
    }
  }

  if (error.response?.data) {
    const data = error.response.data
    if (typeof data === 'string') {
      console.error(`   Details: ${data}`)
    } else if (data.message) {
      console.error(`   Details: ${data.message}`)
    } else if (data.error) {
      console.error(`   Details: ${data.error}`)
    } else {
      console.error(`   Details: ${JSON.stringify(data, null, 2)}`)
    }
  }

  if (error.code) {
    console.error(`   Error Code: ${error.code}`)
  }

  if (error.request?.url) {
    console.error(`   Request URL: ${error.request.method || 'GET'} ${error.request.url}`)
  }
}

/**
 * Handle object-type errors
 */
function handleObjectError(error: Record<string, unknown>): void {
  if (error.message) {
    console.error(`   Message: ${error.message}`)
  } else if (error.error) {
    console.error(`   Error: ${error.error}`)
  } else {
    console.error(`   Details: ${JSON.stringify(error, null, 2)}`)
  }
}

/**
 * Show helpful suggestions based on error type
 */
function showErrorSuggestions(error: unknown): void {
  console.error('\n💡 Troubleshooting suggestions:')

  if (error instanceof Error) {
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('   • Check your internet connection')
      console.error('   • Verify the API URL is correct')
      console.error('   • The API service might be down')
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('   • Verify your API key is correct')
      console.error('   • Run "codeguide login" to update your API key')
      console.error('   • Check if your API key has expired')
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      console.error('   • Your API key may not have the required permissions')
      console.error('   • Contact support if you believe this is an error')
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      console.error('   • Wait a few minutes before trying again')
      console.error('   • Consider upgrading your API plan for higher limits')
    } else if (error.message.includes('timeout')) {
      console.error('   • The request took too long to complete')
      console.error('   • Check your internet connection')
      console.error('   • Try again later')
    }
  }

  // General suggestions
  console.error('   • Run "codeguide health" to check API status')
  console.error('   • Use --verbose flag for more detailed error information')
  console.error('   • Set DEBUG=true environment variable for debugging')

  // Show environment variables suggestion for API key issues
  if (
    error instanceof Error &&
    (error.message.includes('API key') ||
      error.message.includes('401') ||
      error.message.includes('Unauthorized'))
  ) {
    console.error('   • You can also use CODEGUIDE_API_KEY environment variable')
    console.error('   • Run "codeguide login" to save your API key securely')
  }

  console.error('') // Add blank line for readability
}

/**
 * Create a CLI error with context
 */
export class CliError extends Error {
  constructor(
    message: string,
    public readonly context: string,
    public readonly suggestions: string[] = [],
    public readonly exitCode: number = 1
  ) {
    super(message)
    this.name = 'CliError'
  }
}

/**
 * Create an API error with enhanced information
 */
export class ApiCliError extends CliError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly apiMessage?: string,
    public readonly details?: Record<string, unknown>
  ) {
    const suggestions = getApiErrorSuggestions(statusCode, message)
    super(message, 'API Request', suggestions, statusCode)
    this.name = 'ApiCliError'
  }
}

/**
 * Get suggestions based on API status code
 */
function getApiErrorSuggestions(statusCode: number, message: string): string[] {
  const suggestions: string[] = []

  switch (statusCode) {
    case 400:
      suggestions.push('Check your input parameters')
      suggestions.push('Verify the request format')
      break
    case 401:
      suggestions.push('Verify your API key is correct')
      suggestions.push('Run "codeguide login" to update your API key')
      suggestions.push('Check if your API key has expired')
      break
    case 403:
      suggestions.push('Your API key may not have the required permissions')
      suggestions.push('Contact support if you believe this is an error')
      break
    case 404:
      suggestions.push('The requested resource may not exist')
      suggestions.push('Check the API endpoint')
      break
    case 429:
      suggestions.push('Wait a few minutes before trying again')
      suggestions.push('Consider upgrading your API plan for higher limits')
      break
    case 500:
      suggestions.push('The API server encountered an error')
      suggestions.push('Try again later')
      break
    case 502:
    case 503:
    case 504:
      suggestions.push('The API service is temporarily unavailable')
      suggestions.push('Try again in a few minutes')
      break
    default:
      suggestions.push('Check the API documentation')
      suggestions.push('Contact support if the issue persists')
  }

  if (message.includes('timeout')) {
    suggestions.push('Check your internet connection')
    suggestions.push('The request took too long to complete')
  }

  return suggestions
}
