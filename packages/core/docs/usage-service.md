# Usage Service Documentation

## Overview

The Usage Service provides methods to track usage, check credits, retrieve authorization information, and access comprehensive dashboard analytics for users.

## Methods

### `getAuthorization()`

Retrieves the authorization status and plan limits for the authenticated user. This endpoint returns different information based on whether the user has an active subscription or is on a free plan.

**Returns:** `Promise<AuthorizationResponse>`

**Response Structure:**

```typescript
interface AuthorizationResponse {
  success: boolean
  data: AuthorizationData
  message: string
}

interface AuthorizationData {
  user_id: string
  subscription: AuthorizationSubscription | null
  credit_balance: CreditBalance
  has_active_subscription: boolean
  has_previous_subscriptions: boolean
  is_within_credit_limit: boolean
  authorization_level: string
  restrictions: string[]
  can_create_tasks: boolean
  can_analyze_repos: boolean
  can_access_previous_projects: boolean
  plan_limits: PlanLimits
  codespace_task_limit: LimitInfo | null
}
```

## Free vs. Subscribed Users

The `/usage/authorization` endpoint returns different data structures depending on whether the user has an active subscription.

### Free Users

For users without an active subscription:

- **`subscription`**: `null`
- **`has_active_subscription`**: `false`
- **`authorization_level`**: `"free"`
- **`codespace_task_limit`**: Contains limit information (e.g., `limit: 2`, `remaining: 2`)
- **`plan_limits.plan_type`**: `"free"`
- **`plan_limits.limits.codespace_tasks`**: Has specific limits (e.g., 2 lifetime tasks)
- **`can_access_previous_projects`**: `false`

**Example Free User Response:**

```json
{
  "success": true,
  "data": {
    "user_id": "user_32CKVjVlcRfh4HAqpVckgILey0Z",
    "subscription": null,
    "credit_balance": {
      "total_allotted": 500,
      "total_consumed": 0,
      "remaining_credits": 500,
      "is_over_limit": false,
      "utilization_percentage": 0.0,
      "billing_cycle_start": "2025-11-03",
      "billing_cycle_end": "2025-11-10"
    },
    "has_active_subscription": false,
    "has_previous_subscriptions": false,
    "is_within_credit_limit": true,
    "authorization_level": "free",
    "restrictions": [],
    "can_create_tasks": true,
    "can_analyze_repos": true,
    "can_access_previous_projects": false,
    "plan_limits": {
      "plan_type": "free",
      "limits": {
        "codespace_tasks": {
          "allowed": true,
          "current_usage": 0,
          "limit": 2,
          "remaining": 2,
          "period_type": "lifetime",
          "period_start": null,
          "period_end": null,
          "message": "Can create 2 more codespace tasks. 2 codespace tasks (lifetime limit)",
          "is_unlimited": false
        },
        "api_calls": {
          "limit": 500,
          "period": "7_days",
          "description": "500 API credits (valid for 7 days)",
          "is_unlimited": false
        },
        "storage_gb": {
          "limit": 1,
          "period": "lifetime",
          "description": "1 GB storage",
          "is_unlimited": false
        },
        "projects": {
          "limit": 3,
          "period": "lifetime",
          "description": "3 projects maximum",
          "is_unlimited": false
        },
        "collaborators": {
          "limit": 0,
          "period": "lifetime",
          "description": "No team collaboration",
          "is_unlimited": false
        }
      }
    },
    "codespace_task_limit": {
      "allowed": true,
      "current_usage": 0,
      "limit": 2,
      "remaining": 2,
      "period_type": "lifetime",
      "period_start": null,
      "period_end": null,
      "message": "Can create 2 more codespace tasks. 2 codespace tasks (lifetime limit)",
      "is_unlimited": false
    }
  },
  "message": "Authorization status retrieved successfully"
}
```

### Subscribed Users

For users with an active subscription:

- **`subscription`**: Contains detailed subscription information:
  - `id`: Subscription ID
  - `status`: Subscription status (e.g., `"active"`)
  - `interval`: Billing interval (e.g., `"month"`, `"year"`)
  - `current_period_start`: ISO 8601 timestamp
  - `current_period_end`: ISO 8601 timestamp
  - `price_id`: Stripe price ID
  - `product_name`: Product name (can be `null`)
  - `plan_name`: Plan name (e.g., `"Monthly Plan"`)
- **`has_active_subscription`**: `true`
- **`authorization_level`**: Plan tier (e.g., `"basic"`, `"pro"`)
- **`codespace_task_limit`**: `null` (when unlimited) or limit information
- **`plan_limits.plan_type`**: Plan tier name
- **`plan_limits.limits.codespace_tasks`**: May have `limit: -1` and `is_unlimited: true` for unlimited plans
- **`can_access_previous_projects`**: `true`

**Example Subscribed User Response:**

```json
{
  "success": true,
  "data": {
    "user_id": "user_2qaB6nlVH3R9QXhQZpt1nmVDymN",
    "subscription": {
      "id": "sub_1RbggdFb0vIg7N8EFOPTEhDh",
      "status": "active",
      "interval": "month",
      "current_period_start": "2025-10-19T11:31:19+00:00",
      "current_period_end": "2025-11-19T11:31:19+00:00",
      "price_id": "price_1QYtmGFb0vIg7N8E71nw8g27",
      "product_name": null,
      "plan_name": "Monthly Plan"
    },
    "credit_balance": {
      "total_allotted": 5000,
      "total_consumed": 658,
      "remaining_credits": 4342,
      "is_over_limit": false,
      "utilization_percentage": 13.16,
      "billing_cycle_start": "2025-10-19",
      "billing_cycle_end": "2025-11-19"
    },
    "has_active_subscription": true,
    "has_previous_subscriptions": true,
    "is_within_credit_limit": true,
    "authorization_level": "basic",
    "restrictions": [],
    "can_create_tasks": true,
    "can_analyze_repos": true,
    "can_access_previous_projects": true,
    "plan_limits": {
      "plan_type": "basic",
      "limits": {
        "codespace_tasks": {
          "allowed": true,
          "current_usage": 0,
          "limit": -1,
          "remaining": -1,
          "period_type": "monthly",
          "period_start": null,
          "period_end": null,
          "message": "Unlimited codespace tasks",
          "is_unlimited": true
        },
        "api_calls": {
          "limit": 5000,
          "period": "monthly",
          "description": "5000 API credits per month",
          "is_unlimited": false
        },
        "storage_gb": {
          "limit": 10,
          "period": "lifetime",
          "description": "10 GB storage",
          "is_unlimited": false
        },
        "projects": {
          "limit": 20,
          "period": "lifetime",
          "description": "20 projects maximum",
          "is_unlimited": false
        },
        "collaborators": {
          "limit": 3,
          "period": "monthly",
          "description": "3 team collaborators",
          "is_unlimited": false
        }
      }
    },
    "codespace_task_limit": null
  },
  "message": "Authorization status retrieved successfully"
}
```

## Key Differences Summary

| Feature                                           | Free Users                  | Subscribed Users                       |
| ------------------------------------------------- | --------------------------- | -------------------------------------- |
| `subscription`                                    | `null`                      | `AuthorizationSubscription` object     |
| `has_active_subscription`                         | `false`                     | `true`                                 |
| `authorization_level`                             | `"free"`                    | Plan tier (e.g., `"basic"`, `"pro"`)   |
| `codespace_task_limit`                            | `LimitInfo` object          | `null` (when unlimited) or `LimitInfo` |
| `plan_limits.limits.codespace_tasks.limit`        | Positive number (e.g., `2`) | `-1` for unlimited                     |
| `plan_limits.limits.codespace_tasks.is_unlimited` | `false`                     | `true` for unlimited plans             |
| `can_access_previous_projects`                    | `false`                     | `true`                                 |
| Credit limits                                     | Lower (e.g., 500)           | Higher (e.g., 5000+)                   |
| Billing cycle                                     | 7 days                      | Monthly/Yearly                         |

## Usage Example

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.app',
  databaseApiKey: 'sk_your_key',
})

// Get authorization status
const auth = await codeguide.usage.getAuthorization()

if (auth.data.has_active_subscription) {
  console.log(`User has ${auth.data.plan_limits.plan_type} subscription`)
  console.log(`Subscription: ${auth.data.subscription?.plan_name}`)

  if (auth.data.codespace_task_limit === null) {
    console.log('Unlimited codespace tasks')
  }
} else {
  console.log('Free user')
  console.log(`Remaining codespace tasks: ${auth.data.codespace_task_limit?.remaining}`)
}
```

## Type Definitions

```typescript
interface AuthorizationSubscription {
  id: string
  status: string
  interval: string
  current_period_start: string
  current_period_end: string
  price_id: string
  product_name: string | null
  plan_name: string
}

interface CreditBalance {
  total_allotted: number
  total_consumed: number
  remaining_credits: number
  is_over_limit: boolean
  utilization_percentage: number
  billing_cycle_start: string
  billing_cycle_end: string
}

interface LimitInfo {
  allowed?: boolean
  current_usage?: number
  limit: number // -1 for unlimited
  remaining?: number // -1 for unlimited
  period_type?: string
  period_start?: string | null
  period_end?: string | null
  message?: string
  is_unlimited: boolean
  period?: string
  description?: string
}

interface PlanLimits {
  plan_type: string
  limits: {
    codespace_tasks: LimitInfo
    api_calls: LimitInfo
    storage_gb: LimitInfo
    projects: LimitInfo
    collaborators: LimitInfo
  }
}
```

# Dashboard Analytics

The Usage Service also provides comprehensive dashboard analytics endpoints for visualizing usage patterns, costs, and trends. All dashboard endpoints follow the `/usage/dashboard/*` pattern.

## `getDashboardAnalytics(params?)`

Retrieves comprehensive analytics data with daily breakdowns, trends, and top services for dashboard visualization.

**Endpoint:** `GET /usage/dashboard/analytics`

**Parameters:** `DashboardAnalyticsRequest` (optional)
```typescript
interface DashboardAnalyticsRequest {
  period?: "7d" | "1w" | "1m" | "3m"    // Time period
  start_date?: string                    // Custom start date (YYYY-MM-DD)
  end_date?: string                      // Custom end date (YYYY-MM-DD)
  service_type?: "docs" | "chat" | "codespace_task" | "api"
}
```

**Returns:** `Promise<DashboardAnalyticsResponse>`

**Response Structure:**
```typescript
interface DashboardAnalyticsResponse {
  status: string
  data: {
    period: {
      start: string
      end: string
      label: string
    }
    daily_usage: Array<{
      date: string
      credits_consumed: number
      cost_usd: number
      requests_count: number
      average_credits_per_request: number
    }>
    totals: {
      credits_consumed: number
      cost_usd: number
      requests_count: number
    }
    averages: {
      daily_credits: number
      daily_requests: number
    }
    trends: {
      credits_consumed: number      // Percentage change
      requests_count: number        // Percentage change
    }
    top_services: Array<{
      service_type: string
      credits_consumed: number
      requests_count: number
    }>
  }
}
```

**Example Usage:**
```typescript
// Get last 7 days analytics
const analytics = await codeguide.usage.getDashboardAnalytics({ period: '7d' })

// Get custom date range for docs service
const docsAnalytics = await codeguide.usage.getDashboardAnalytics({
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  service_type: 'docs'
})
```

## `getUsageDetails(params?)`

Retrieves paginated individual usage records with filtering and sorting capabilities for detailed analysis.

**Endpoint:** `GET /usage/dashboard/details`

**Parameters:** `UsageDetailsRequest` (optional)
```typescript
interface UsageDetailsRequest {
  period?: "7d" | "1w" | "1m" | "3m"
  start_date?: string
  end_date?: string
  service_type?: "docs" | "chat" | "codespace_task" | "api"
  page?: number                         // Default: 1
  page_size?: number                    // Default: 50, Max: 100
  sort_by?: "created_at" | "credits_consumed" | "cost_amount"  // Default: "created_at"
  sort_order?: "asc" | "desc"           // Default: "desc"
}
```

**Returns:** `Promise<UsageDetailsResponse>`

**Response Structure:**
```typescript
interface UsageDetailsResponse {
  status: string
  data: Array<{
    id: string
    created_at: string
    service_type: string
    model_name: string
    usage_type: string
    units_consumed: number
    credits_consumed: number
    cost_amount: number | null
  }>
  pagination: {
    page: number
    page_size: number
    total_count: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
  filters: {
    period: string | null
    start_date: string | null
    end_date: string | null
    service_type: string | null
  }
}
```

**Example Usage:**
```typescript
// Get first page of usage details for last 7 days
const details = await codeguide.usage.getUsageDetails({ period: '7d' })

// Get page 2 with custom sorting
const sortedDetails = await codeguide.usage.getUsageDetails({
  period: '1m',
  page: 2,
  page_size: 25,
  sort_by: 'credits_consumed',
  sort_order: 'desc'
})
```

## `getUsageSummary(params?)`

Retrieves quick overview statistics for dashboard widgets, including current vs previous period comparisons and billing cycle information.

**Endpoint:** `GET /usage/dashboard/summary`

**Parameters:** `UsageSummaryRequest` (optional)
```typescript
interface UsageSummaryRequest {
  period?: "7d" | "1w" | "1m" | "3m"
  start_date?: string
  end_date?: string
}
```

**Returns:** `Promise<UsageSummaryResponse>`

**Response Structure:**
```typescript
interface UsageSummaryResponse {
  status: string
  data: {
    current_period: {
      credits_consumed: number
      cost_usd: number
      requests_count: number
    }
    previous_period: {
      credits_consumed: number
      cost_usd: number
      requests_count: number
    }
    billing_cycle: {
      total_allotted: number
      total_consumed: number
      remaining_credits: number
    }
    utilization_percentage: number
    remaining_credits: number
    daily_average: number
    projected_monthly: number
  }
}
```

**Example Usage:**
```typescript
// Get summary for last 7 days
const summary = await codeguide.usage.getUsageSummary({ period: '7d' })

// Get monthly summary
const monthlySummary = await codeguide.usage.getUsageSummary({ period: '1m' })
```

## `getServiceBreakdown(params?)`

Retrieves usage breakdown by service type for pie charts and comparative analysis.

**Endpoint:** `GET /usage/dashboard/services`

**Parameters:** `ServiceBreakdownRequest` (optional)
```typescript
interface ServiceBreakdownRequest {
  period?: "7d" | "1w" | "1m" | "3m"
  start_date?: string
  end_date?: string
}
```

**Returns:** `Promise<ServiceBreakdownResponse>`

**Response Structure:**
```typescript
interface ServiceBreakdownResponse {
  status: string
  data: {
    period: {
      start: string
      end: string
      label: string
    }
    services: Array<{
      service_type: string
      credits_consumed: number
      percentage: number
      cost_usd: number
      requests_count: number
      trend: number           // Percentage change
    }>
    total_credits: number
    total_cost: number
  }
}
```

**Example Usage:**
```typescript
// Get service breakdown for last 7 days
const breakdown = await codeguide.usage.getServiceBreakdown({ period: '7d' })

// Get service breakdown for custom date range
const customBreakdown = await codeguide.usage.getServiceBreakdown({
  start_date: '2024-01-01',
  end_date: '2024-01-31'
})
```

## Complete Dashboard Example

```typescript
import { CodeGuide } from '@codeguide/core'

const codeguide = new CodeGuide({
  baseUrl: 'https://api.codeguide.app',
  databaseApiKey: 'sk_your_key',
})

// Get comprehensive dashboard data
async function loadDashboardData() {
  try {
    // Main analytics with trends
    const analytics = await codeguide.usage.getDashboardAnalytics({ period: '7d' })

    // Quick overview for widgets
    const summary = await codeguide.usage.getUsageSummary({ period: '7d' })

    // Service breakdown for pie charts
    const services = await codeguide.usage.getServiceBreakdown({ period: '7d' })

    // Detailed records for table
    const details = await codeguide.usage.getUsageDetails({
      period: '7d',
      page_size: 100,
      sort_by: 'credits_consumed',
      sort_order: 'desc'
    })

    console.log('Dashboard Analytics:', analytics.data)
    console.log('Summary Stats:', summary.data)
    console.log('Service Breakdown:', services.data)
    console.log('Usage Details:', details.data)

  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}
```
