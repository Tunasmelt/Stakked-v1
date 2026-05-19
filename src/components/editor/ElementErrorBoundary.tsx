'use client';

import React from 'react';

interface Props {
  elementId: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ElementErrorBoundary: Catches render errors from individual canvas elements
 * so a single malformed element never crashes the entire canvas.
 *
 * Shows a subtle red outline placeholder in the editor; renders nothing in
 * public/preview mode (caller passes isPublic to suppress the fallback UI).
 */
export class ElementErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ElementErrorBoundary] element ${this.props.elementId} crashed:`, error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '1px dashed rgba(255, 92, 92, 0.6)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 92, 92, 0.06)',
            pointerEvents: 'none',
          }}
          title={this.state.error?.message}
        >
          <span style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            color: 'rgba(255, 92, 92, 0.7)',
            letterSpacing: '0.06em',
          }}>
            render error
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}
