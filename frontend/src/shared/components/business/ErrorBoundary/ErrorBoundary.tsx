'use client'

import React, { type ComponentType, type ReactNode } from 'react'
import { Box, Flex, Text, Button } from '@radix-ui/themes'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <Box p="6" style={{ maxWidth: 500 }}>
          <Flex direction="column" gap="4">
            <Text size="4" weight="bold" color="red">
              Произошла ошибка
            </Text>
            <Text size="2" style={{ color: 'var(--gray-11)', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {this.state.error.message}
            </Text>
            <Button
              variant="soft"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Попробовать снова
            </Button>
          </Flex>
        </Box>
      )
    }
    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(Component: ComponentType<P>, fallback?: ReactNode) {
  return function WrappedWithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
