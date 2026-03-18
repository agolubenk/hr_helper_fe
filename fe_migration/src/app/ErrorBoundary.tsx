import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary для отлова ошибок рендера и отображения fallback вместо белого экрана.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div
          style={{
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            maxWidth: 600,
            margin: '40px auto',
            background: '#fff1f2',
            border: '1px solid #f43f5e',
            borderRadius: 8,
          }}
        >
          <h2 style={{ margin: '0 0 12px', color: '#9f1239' }}>Ошибка приложения</h2>
          <pre
            style={{
              margin: 0,
              fontSize: 12,
              overflow: 'auto',
              color: '#881337',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error.message}
          </pre>
          {this.state.error.stack && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', color: '#be123c' }}>Стек вызовов</summary>
              <pre
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  overflow: 'auto',
                  color: '#666',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
