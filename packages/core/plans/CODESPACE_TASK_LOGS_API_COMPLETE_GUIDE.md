# Codespace Task Logs API - Complete Implementation Guide

## Overview
This guide provides complete documentation for the codespace task logs API implementation, including response types, usage examples, and integration details.

## 📊 Database Schema

```sql
CREATE TABLE public.codespace_task_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codespace_task_id uuid NOT NULL,
  step_name text NOT NULL,
  log_type text NOT NULL DEFAULT 'info'::text,
  message text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  progress_percentage integer NULL,
  metadata jsonb NULL,
  CONSTRAINT codespace_task_logs_pkey PRIMARY KEY (id),
  CONSTRAINT codespace_task_logs_codespace_task_id_fkey
    FOREIGN KEY (codespace_task_id) REFERENCES codespace_tasks (id) ON DELETE CASCADE,
  CONSTRAINT codespace_task_logs_progress_percentage_check
    CHECK ((progress_percentage >= 0 AND progress_percentage <= 100)),
  CONSTRAINT codespace_task_logs_type_check
    CHECK ((log_type = ANY (ARRAY['thinking'::text, 'coding'::text, 'info'::text, 'error'::text, 'success'::text])))
);

-- Indexes for performance
CREATE INDEX idx_codespace_task_logs_task_id ON public.codespace_task_logs USING btree (codespace_task_id);
CREATE INDEX idx_codespace_task_logs_task_id_created ON public.codespace_task_logs USING btree (codespace_task_id, created_at);
CREATE INDEX idx_codespace_task_logs_log_type ON public.codespace_task_logs USING btree (log_type);
```

## 🏗️ Data Models

### 1. Database Model
```python
class CodespaceTaskLogInDB(BaseModel):
    """Codespace task log database model."""

    id: str
    codespace_task_id: str
    step_name: str
    log_type: Literal["thinking", "coding", "info", "error", "success"]
    message: str
    created_at: datetime
    progress_percentage: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}
```

### 2. Response Model
```python
class CodespaceTaskLogResponse(BaseModel):
    """Response model for a single codespace task log."""

    id: str
    step_name: str
    log_type: str
    message: str
    created_at: datetime
    progress_percentage: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None
```

### 3. Paginated List Response
```python
class CodespaceTaskLogsListResponse(BaseModel):
    """Response model for getting a list of codespace task logs."""

    status: str = "success"
    data: List[CodespaceTaskLogResponse]
    total_count: int = Field(..., description="Total number of logs matching the criteria")
    has_more: bool = Field(..., description="Whether there are more logs available")
    next_offset: Optional[int] = Field(None, description="Next offset to use for pagination")
    message: str = "Codespace task logs retrieved successfully"
```

## 🚀 API Endpoints

### 1. Standard REST API Endpoint

**GET `/codespace/task/{codespace_task_id}/logs`**

#### Query Parameters
| Parameter | Type | Default | Constraints | Description |
|-----------|------|---------|-------------|-------------|
| `limit` | int | 50 | 1-500 | Number of logs to return (custom rows) |
| `offset` | int | 0 | ≥0 | Number of logs to skip for pagination |
| `log_type` | string | optional | thinking,coding,info,error,success | Filter by log type |
| `step_name` | string | optional | text | Filter by step name (partial match) |
| `search` | string | optional | text | Search in message content |
| `sort_by` | string | created_at | created_at,step_name,log_type | Sort field |
| `sort_order` | string | desc | asc,desc | Sort order |
| `since` | string | optional | ISO timestamp | Get logs after timestamp |

#### Response Example
```json
{
  "status": "success",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "step_name": "task_creation",
      "log_type": "info",
      "message": "🚀 Your coding task is ready!",
      "created_at": "2024-01-15T10:30:00.000Z",
      "progress_percentage": 10,
      "metadata": null
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "step_name": "ai_summary",
      "log_type": "info",
      "message": "🔍 Preparing project foundation (description + outline)",
      "created_at": "2024-01-15T10:30:15.000Z",
      "progress_percentage": 25,
      "metadata": null
    }
  ],
  "total_count": 150,
  "has_more": true,
  "next_offset": 50,
  "message": "Retrieved 50 logs"
}
```

### 2. Real-time Streaming Endpoint (SSE)

**GET `/codespace/task/{codespace_task_id}/logs/stream`**

#### Query Parameters
| Parameter | Type | Default | Constraints | Description |
|-----------|------|---------|-------------|-------------|
| `since` | string | optional | ISO timestamp | Start from this timestamp |
| `timeout` | int | 300 | 30-1800 | Stream timeout in seconds |

#### SSE Events

**`log` Event**
```
event: log
data: {
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "step_name": "task_creation",
  "log_type": "info",
  "message": "🚀 Your coding task is ready!",
  "created_at": "2024-01-15T10:30:00.000Z",
  "progress_percentage": 10,
  "metadata": {}
}
```

**`heartbeat` Event**
```
event: heartbeat
data: {
  "timestamp": "2024-01-15T10:30:30.000Z"
}
```

**`complete` Event**
```
event: complete
data: {
  "message": "Task completed"
}
```

**`timeout` Event**
```
event: timeout
data: {
  "message": "Stream timeout reached"
}
```

**`error` Event**
```
event: error
data: {
  "error": "Task not found or access denied"
}
```

## 💻 Implementation Guide

### Frontend Integration Examples

#### React Hook (Recommended)
```typescript
import { useEffect, useState, useCallback } from 'react';

interface CodespaceLog {
  id: string;
  step_name: string;
  log_type: 'thinking' | 'coding' | 'info' | 'error' | 'success';
  message: string;
  created_at: string;
  progress_percentage?: number;
  metadata?: any;
}

interface UseCodespaceLogsReturn {
  logs: CodespaceLog[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  hasMore: boolean;
  nextOffset: number | null;
  loadMore: () => void;
  startStreaming: () => void;
  stopStreaming: () => void;
}

export const useCodespaceLogs = (
  taskId: string,
  authToken: string,
  options: {
    pageSize?: number;
    enableStreaming?: boolean;
    filters?: {
      log_type?: string;
      step_name?: string;
      search?: string;
    };
  } = {}
): UseCodespaceLogsReturn => {
  const [logs, setLogs] = useState<CodespaceLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const { pageSize = 50, enableStreaming = true, filters = {} } = options;

  // Load initial logs
  const loadLogs = useCallback(async (offset = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: offset.toString(),
        ...filters
      });

      const response = await fetch(
        `/codespace/task/${taskId}/logs?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CodespaceTaskLogsListResponse = await response.json();

      if (offset === 0) {
        setLogs(data.data);
      } else {
        setLogs(prev => [...prev, ...data.data]);
      }

      setHasMore(data.has_more);
      setNextOffset(data.next_offset);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setIsLoading(false);
    }
  }, [taskId, authToken, pageSize, filters]);

  // Start streaming
  const startStreaming = useCallback(() => {
    if (!enableStreaming || eventSource) return;

    const url = `/codespace/task/${taskId}/logs/stream`;
    const source = new EventSource(url);

    source.addEventListener('log', (event) => {
      try {
        const log: CodespaceLog = JSON.parse(event.data);
        setLogs(prev => [...prev, log]);
      } catch (err) {
        console.error('Failed to parse log data:', err);
      }
    });

    source.addEventListener('complete', () => {
      setIsStreaming(false);
      source.close();
      setEventSource(null);
    });

    source.addEventListener('error', () => {
      setError('Stream error occurred');
      setIsStreaming(false);
      source.close();
      setEventSource(null);
    });

    source.addEventListener('timeout', () => {
      setError('Stream timeout');
      setIsStreaming(false);
      source.close();
      setEventSource(null);
    });

    setEventSource(source);
    setIsStreaming(true);
  }, [taskId, enableStreaming, eventSource]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsStreaming(false);
  }, [eventSource]);

  // Load more logs
  const loadMore = useCallback(() => {
    if (nextOffset !== null && !isLoading) {
      loadLogs(nextOffset);
    }
  }, [nextOffset, isLoading, loadLogs]);

  // Initial load
  useEffect(() => {
    if (taskId) {
      loadLogs(0);
    }
  }, [taskId, loadLogs]);

  // Auto-start streaming
  useEffect(() => {
    if (enableStreaming && taskId && !eventSource && !isStreaming) {
      startStreaming();
    }
  }, [enableStreaming, taskId, eventSource, isStreaming, startStreaming]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    logs,
    isLoading,
    isStreaming,
    error,
    hasMore,
    nextOffset,
    loadMore,
    startStreaming,
    stopStreaming
  };
};
```

#### React Component Example
```typescript
import React from 'react';
import { useCodespaceLogs } from './useCodespaceLogs';

interface LogsViewerProps {
  taskId: string;
  authToken: string;
}

export const LogsViewer: React.FC<LogsViewerProps> = ({ taskId, authToken }) => {
  const {
    logs,
    isLoading,
    isStreaming,
    error,
    hasMore,
    loadMore,
    stopStreaming
  } = useCodespaceLogs(taskId, authToken, {
    pageSize: 100,
    enableStreaming: true,
    filters: {
      // log_type: 'error', // Uncomment to filter errors only
    }
  });

  const getLogIcon = (logType: string) => {
    switch (logType) {
      case 'thinking': return '🤔';
      case 'coding': return '💻';
      case 'info': return 'ℹ️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return '📝';
    }
  };

  const getLogColor = (logType: string) => {
    switch (logType) {
      case 'thinking': return 'text-blue-600';
      case 'coding': return 'text-green-600';
      case 'info': return 'text-gray-600';
      case 'error': return 'text-red-600';
      case 'success': return 'text-green-500';
      default: return 'text-gray-600';
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Task Logs</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {logs.length} logs
          </span>
          <span className={`text-sm ${isStreaming ? 'text-green-600' : 'text-gray-500'}`}>
            {isStreaming ? '🔄 Streaming...' : '⏸️ Paused'}
          </span>
          {isStreaming && (
            <button
              onClick={stopStreaming}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading && logs.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Loading logs...
          </div>
        )}

        {logs.map((log, index) => (
          <div
            key={log.id || index}
            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-lg">{getLogIcon(log.log_type)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getLogColor(log.log_type)}`}>
                  {log.step_name}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
                {log.progress_percentage !== null && (
                  <span className="text-xs text-gray-500">
                    {log.progress_percentage}%
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-700 mt-1 break-words">
                {log.message}
              </div>
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="text-center py-4">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

#### Vue.js Example
```typescript
import { ref, onMounted, onUnmounted } from 'vue';

export function useCodespaceLogs(taskId: string, authToken: string) {
  const logs = ref<CodespaceLog[]>([]);
  const isStreaming = ref(false);
  const error = ref<string | null>(null);
  let eventSource: EventSource | null = null;

  const startStreaming = () => {
    if (eventSource) return;

    eventSource = new EventSource(`/codespace/task/${taskId}/logs/stream`);

    eventSource.addEventListener('log', (event) => {
      const log = JSON.parse(event.data);
      logs.value.push(log);
    });

    eventSource.addEventListener('complete', () => {
      isStreaming.value = false;
      eventSource?.close();
      eventSource = null;
    });

    eventSource.addEventListener('error', () => {
      error.value = 'Stream error occurred';
      isStreaming.value = false;
      eventSource?.close();
      eventSource = null;
    });

    isStreaming.value = true;
  };

  const stopStreaming = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    isStreaming.value = false;
  };

  onMounted(() => {
    startStreaming();
  });

  onUnmounted(() => {
    stopStreaming();
  });

  return {
    logs,
    isStreaming,
    error,
    startStreaming,
    stopStreaming
  };
}
```

### Backend Integration

#### Service Method Usage
```python
from app.services.codespace_service import CodespaceService

async def get_logs_example():
    """Example of using the logs service method."""
    service = CodespaceService()

    try:
        # Get paginated logs
        logs, total_count, has_more = await service.get_codespace_task_logs(
            codespace_task_id="task-uuid",
            user_id="user-uuid",
            limit=100,
            offset=0,
            log_type="error",
            search="failed",
            sort_by="created_at",
            sort_order="desc"
        )

        return {
            "logs": logs,
            "total_count": total_count,
            "has_more": has_more
        }

    except Exception as e:
        logger.error(f"Failed to get logs: {e}")
        raise
```

## 🔧 Configuration & Deployment

### Environment Variables
```bash
# Required for streaming
APP_BASE_URL=https://your-app.com
CLERK_SECRET_KEY=your-clerk-secret-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

### Nginx Configuration (for streaming)
```nginx
location /codespace/task/*/logs/stream {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    proxy_set_header X-Accel-Buffering no;
    proxy_cache off;
    proxy_set_header Proxy '';
}
```

### Database Indexes (Performance)
```sql
-- Create indexes for optimal performance
CREATE INDEX CONCURRENTLY idx_codespace_logs_composite
ON codespace_task_logs (codespace_task_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_codespace_logs_type_task
ON codespace_task_logs (log_type, codespace_task_id);

CREATE INDEX CONCURRENTLY idx_codespace_logs_step_task
ON codespace_task_logs (step_name, codespace_task_id);

-- For text search (if using PostgreSQL)
CREATE INDEX CONCURRENTLY idx_codespace_logs_message_gin
ON codespace_task_logs USING gin(to_tsvector('english', message));
```

## 🧪 Testing

### Unit Tests
```python
import pytest
from app.services.codespace_service import CodespaceService

@pytest.mark.asyncio
async def test_get_codespace_task_logs():
    """Test the logs retrieval method."""
    service = CodespaceService()

    logs, total_count, has_more = await service.get_codespace_task_logs(
        codespace_task_id="test-task-id",
        user_id="test-user-id",
        limit=10,
        offset=0
    )

    assert isinstance(logs, list)
    assert isinstance(total_count, int)
    assert isinstance(has_more, bool)
    assert len(logs) <= 10

@pytest.mark.asyncio
async def test_stream_codespace_task_logs():
    """Test the streaming method."""
    service = CodespaceService()

    log_stream = service.stream_codespace_task_logs(
        codespace_task_id="test-task-id",
        user_id="test-user-id",
        timeout_seconds=10
    )

    events = []
    async for event in log_stream:
        events.append(event)
        if event.startswith('event: complete'):
            break

    assert len(events) > 0
```

### Integration Tests
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_logs_endpoint():
    """Test the REST API endpoint."""
    response = client.get(
        "/codespace/task/test-task-id/logs",
        headers={"Authorization": "Bearer test-token"},
        params={"limit": 10, "log_type": "info"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total_count" in data
    assert "has_more" in data
    assert len(data["data"]) <= 10

def test_stream_logs_endpoint():
    """Test the streaming endpoint."""
    with client.stream(
        "GET",
        "/codespace/task/test-task-id/logs/stream",
        headers={"Authorization": "Bearer test-token"}
    ) as response:
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream; charset=utf-8"

        # Read first few events
        events = []
        for line in response.iter_lines():
            if line:
                events.append(line.decode('utf-8'))
                if len(events) >= 5:
                    break

        assert len(events) > 0
```

## 📈 Performance Considerations

### Pagination Strategy
- Use `limit` parameter to control memory usage
- Implement client-side caching for recent logs
- Consider virtual scrolling for large log lists

### Streaming Optimization
- Set appropriate timeout values (5-30 minutes)
- Implement client-side reconnection logic
- Monitor concurrent connection limits

### Database Optimization
- Use composite indexes for common query patterns
- Consider log archiving for old completed tasks
- Implement database connection pooling

### Caching Strategy
```python
# Redis caching example
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

async def get_cached_logs(task_id: str, user_id: str, limit: int):
    cache_key = f"logs:{task_id}:{user_id}:{limit}"
    cached = redis_client.get(cache_key)

    if cached:
        return json.loads(cached)

    # Fetch from database
    logs, total_count, has_more = await service.get_codespace_task_logs(...)

    # Cache for 30 seconds
    redis_client.setex(cache_key, 30, json.dumps({
        'logs': logs,
        'total_count': total_count,
        'has_more': has_more
    }))

    return logs, total_count, has_more
```

## 🔍 Troubleshooting

### Common Issues

1. **SSE Connection Closes Immediately**
   - Check authentication token
   - Verify user has permission to access the task
   - Check CORS headers

2. **No Logs Received**
   - Verify task ID exists
   - Check if task has generated any logs yet
   - Ensure database connection is working

3. **Performance Issues**
   - Add database indexes
   - Reduce `limit` parameter
   - Implement caching

4. **Memory Issues**
   - Implement log pagination on client
   - Use virtual scrolling for UI
   - Consider log archiving

### Debug Mode
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Add debug headers to streaming response
headers = {
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
    "X-Accel-Buffering": "no",
    "X-Debug-Mode": "true"  # Enable debug information
}
```

## 📚 Additional Resources

- [Server-Sent Events MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [FastAPI StreamingResponse](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse)
- [PostgreSQL Index Optimization](https://www.postgresql.org/docs/current/indexes.html)
- [Real-time Web Applications](https://ably.com/topic/realtime-web-applications)