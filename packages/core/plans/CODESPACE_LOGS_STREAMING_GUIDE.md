# Codespace Logs Streaming Guide

## Overview
The codespace logs API now supports real-time streaming using Server-Sent Events (SSE). This allows you to monitor logs from long-running codespace tasks in real-time.

## Endpoints

### 1. Standard REST API (Polling)
```
GET /codespace/task/{codespace_task_id}/logs
```

**Query Parameters:**
- `limit` (1-500, default: 50) - Number of logs to return
- `offset` (default: 0) - Pagination offset
- `log_type` - Filter by type (thinking, coding, info, error, success)
- `step_name` - Filter by step name (partial matching)
- `search` - Search in message content
- `sort_by` (created_at, step_name, log_type) - Sort field
- `sort_order` (asc, desc) - Sort order
- `since` - Get logs after timestamp (for incremental updates)

### 2. Real-time Streaming (SSE) ⭐
```
GET /codespace/task/{codespace_task_id}/logs/stream
```

**Query Parameters:**
- `since` (optional) - Start from timestamp (gets recent logs if not provided)
- `timeout` (30-1800 seconds, default: 300) - Stream timeout

## Client Implementation Examples

### JavaScript/TypeScript (Recommended)

```javascript
// Basic streaming setup
const taskLogsStream = (taskId) => {
  const eventSource = new EventSource(
    `/codespace/task/${taskId}/logs/stream`,
    {
      headers: {
        'Authorization': `Bearer ${yourAuthToken}`
      }
    }
  );

  // Listen for new logs
  eventSource.addEventListener('log', (event) => {
    const log = JSON.parse(event.data);
    console.log('New log:', log);

    // Update UI
    appendLogToTerminal(log);
  });

  // Listen for heartbeat (keep-alive)
  eventSource.addEventListener('heartbeat', (event) => {
    const data = JSON.parse(event.data);
    console.log('Heartbeat:', data.timestamp);
  });

  // Listen for completion
  eventSource.addEventListener('complete', (event) => {
    console.log('Task completed!');
    eventSource.close();
    showCompletionMessage();
  });

  // Handle errors
  eventSource.addEventListener('error', (event) => {
    console.error('Stream error:', event);
    eventSource.close();
    showErrorMessage();
  });

  // Handle timeout
  eventSource.addEventListener('timeout', (event) => {
    console.log('Stream timeout, reconnecting...');
    eventSource.close();
    // Optionally reconnect with the 'since' parameter
    reconnectWithTimestamp(taskId, lastTimestamp);
  });

  return eventSource;
};

// Usage
const stream = taskLogsStream('your-codespace-task-id');

// To stop streaming
stream.close();
```

### React Hook Example

```jsx
import { useEffect, useState } from 'react';

export const useCodespaceLogs = (taskId, authToken) => {
  const [logs, setLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!taskId) return;

    setIsStreaming(true);
    setError(null);

    const eventSource = new EventSource(
      `/codespace/task/${taskId}/logs/stream`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    eventSource.addEventListener('log', (event) => {
      const log = JSON.parse(event.data);
      setLogs(prev => [...prev, log]);
    });

    eventSource.addEventListener('complete', () => {
      setIsStreaming(false);
      eventSource.close();
    });

    eventSource.addEventListener('error', () => {
      setError('Failed to stream logs');
      setIsStreaming(false);
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [taskId, authToken]);

  return { logs, isStreaming, error };
};

// Usage in component
function LogsViewer({ taskId, authToken }) {
  const { logs, isStreaming, error } = useCodespaceLogs(taskId, authToken);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="logs-container">
      <div className="status">
        {isStreaming ? '🔄 Streaming...' : '✅ Complete'}
      </div>
      {logs.map(log => (
        <div key={log.id} className={`log log-${log.log_type}`}>
          <span className="timestamp">{log.created_at}</span>
          <span className="step">{log.step_name}</span>
          <span className="message">{log.message}</span>
        </div>
      ))}
    </div>
  );
}
```

### Python Example

```python
import requests
import json
from datetime import datetime

def stream_codespace_logs(task_id, auth_token):
    """Stream logs from a codespace task."""
    url = f"http://localhost:8000/codespace/task/{task_id}/logs/stream"
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Accept': 'text/event-stream'
    }

    try:
        response = requests.get(url, headers=headers, stream=True)
        response.raise_for_status()

        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')

                if line.startswith('data: '):
                    data = json.loads(line[6:])
                    print(f"[{datetime.now()}] {data}")
                elif line.startswith('event: '):
                    event_type = line[7:]
                    print(f"Event: {event_type}")

                    if event_type == 'complete':
                        print("Task completed!")
                        break
                    elif event_type == 'error':
                        print("Error occurred!")
                        break

    except requests.exceptions.RequestException as e:
        print(f"Error streaming logs: {e}")

# Usage
stream_codespace_logs('your-task-id', 'your-auth-token')
```

### curl Example (for testing)

```bash
# Basic stream
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/codespace/task/TASK_ID/logs/stream"

# With custom timeout
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/codespace/task/TASK_ID/logs/stream?timeout=600"

# Start from specific timestamp
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/codespace/task/TASK_ID/logs/stream?since=2024-01-01T00:00:00Z"
```

## SSE Event Types

### `log`
```json
{
  "id": "uuid",
  "step_name": "task_creation",
  "log_type": "info",
  "message": "🚀 Your coding task is ready!",
  "created_at": "2024-01-01T00:00:00Z",
  "progress_percentage": 25,
  "metadata": {}
}
```

### `heartbeat`
```json
{
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### `complete`
```json
{
  "message": "Task completed"
}
```

### `timeout`
```json
{
  "message": "Stream timeout reached"
}
```

### `error`
```json
{
  "error": "Error message"
}
```

## Reconnection Strategy

For production use, implement automatic reconnection:

```javascript
const connectWithRetry = (taskId, maxRetries = 5) => {
  let retryCount = 0;

  const connect = () => {
    const eventSource = new EventSource(`/codespace/task/${taskId}/logs/stream`);

    eventSource.addEventListener('log', (event) => {
      retryCount = 0; // Reset retry count on successful message
      const log = JSON.parse(event.data);
      handleLog(log);
    });

    eventSource.addEventListener('error', () => {
      eventSource.close();

      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Reconnecting... (${retryCount}/${maxRetries})`);
        setTimeout(connect, 2000 * retryCount); // Exponential backoff
      } else {
        console.error('Max retries reached');
        showErrorMessage();
      }
    });

    return eventSource;
  };

  return connect();
};
```

## Production Considerations

1. **Authentication**: Ensure proper auth tokens are sent with SSE requests
2. **Error Handling**: Implement robust error handling and reconnection logic
3. **Rate Limiting**: Be mindful of server resources and implement client-side throttling
4. **Browser Compatibility**: SSE is supported in all modern browsers
5. **Connection Limits**: Most browsers limit concurrent SSE connections per domain (typically 6)

## Troubleshooting

- **Connection closes immediately**: Check authentication token
- **No logs received**: Verify task ID and user permissions
- **Connection times out**: Check network stability and increase timeout parameter
- **Server errors**: Check server logs for authentication or database issues