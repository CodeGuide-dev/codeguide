import { BaseService } from '../base/base-service'
import { StreamTechSpecRequest, StreamChunk } from './streaming-types'

export class StreamingService extends BaseService {
  /**
   * Stream a tech-spec document for the given project.
   *
   * This method connects to the `/chat/tech-spec` endpoint and streams the response
   * using Server-Sent Events (SSE) format. Each chunk is passed to the `onChunk`
   * callback as it arrives, allowing for incremental UI updates.
   *
   * @param request - The request containing the project_id
   * @param onChunk - Callback function invoked with each content chunk as it arrives
   * @param onError - Optional callback function for handling errors
   * @returns Promise that resolves to the full accumulated content when streaming completes
   *
   * @example
   * ```typescript
   * const streamingService = new StreamingService(config);
   * let fullContent = '';
   *
   * fullContent = await streamingService.streamTechSpec(
   *   { project_id: 'project-123' },
   *   (chunk) => {
   *     setContent(prev => prev + chunk); // Update UI incrementally
   *   }
   * );
   * ```
   */
  async streamTechSpec(
    request: StreamTechSpecRequest,
    onChunk: (content: string) => void,
    onError?: (error: Error) => void
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      let fullContent = ''

      const fullUrl = `${this.client.defaults.baseURL}/chat/tech-spec`

      try {
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            ...Object.fromEntries(
              Object.entries(this.client.defaults.headers).filter(
                ([_, v]) => typeof v === 'string'
              ) as [string, string][]
            ),
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify(request),
        })

        if (!response.ok) {
          const errorText = await response.text()
          const error = new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
          onError?.(error)
          reject(error)
          return
        }

        const reader = response.body?.getReader()
        if (!reader) {
          const error = new Error('Response body is not readable')
          onError?.(error)
          reject(error)
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            resolve(fullContent)
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6) // Remove 'data: ' prefix
              if (jsonStr.trim()) {
                try {
                  const chunk: StreamChunk = JSON.parse(jsonStr)

                  if (chunk.error) {
                    const error = new Error(chunk.error)
                    onError?.(error)
                    reject(error)
                    return
                  }

                  if (chunk.done) {
                    resolve(fullContent)
                    return
                  }

                  if (chunk.content) {
                    fullContent += chunk.content
                    onChunk(chunk.content)
                  }
                } catch (parseError) {
                  console.warn('Failed to parse SSE data:', jsonStr, parseError)
                }
              }
            }
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        onError?.(err)
        reject(err)
      }
    })
  }
}
