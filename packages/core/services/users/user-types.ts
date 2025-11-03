/**
 * Email address verification information
 */
export interface EmailVerification {
  status: 'verified' | 'unverified'
  strategy: string
}

/**
 * Email address information
 */
export interface EmailAddress {
  id: string
  email_address: string
  verification: EmailVerification
}

/**
 * Clerk user metadata
 */
export interface ClerkUserMetadata {
  [key: string]: any
}

/**
 * Clerk user data structure
 */
export interface ClerkUserData {
  user_id: string
  first_name: string | null
  last_name: string | null
  username: string | null
  email_addresses: EmailAddress[]
  phone_numbers: Array<{
    id: string
    phone_number: string
    verification: {
      status: 'verified' | 'unverified'
      strategy: string
    }
  }>
  primary_email_address: string | null
  primary_phone_number: string | null
  image_url: string | null
  created_at: number
  updated_at: number
  last_sign_in_at: number | null
  public_metadata: ClerkUserMetadata
  private_metadata: ClerkUserMetadata
  unsafe_metadata: ClerkUserMetadata
}

/**
 * Response for getting current Clerk user
 */
export interface GetCurrentClerkUserResponse {
  status: 'success' | 'error'
  data: ClerkUserData
}
