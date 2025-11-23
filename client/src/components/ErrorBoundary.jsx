import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', margin: '20px' }}>
          <h2 style={{ color: '#c00' }}>⚠️ Đã xảy ra lỗi</h2>
          <p><strong>Lỗi:</strong> {this.state.error?.message}</p>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: '10px', padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

