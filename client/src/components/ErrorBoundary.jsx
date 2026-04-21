import { Component } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Component error boundary caught:', error, info);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const title = this.props.title || 'Something went wrong';
    const message = this.state.error?.message || 'This panel could not be loaded.';

    return (
      <div className={`learning-card bg-surface p-5 sm:p-6 ${this.props.className || ''}`}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-500">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-on-surface">{title}</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-on-surface-variant">{message}</p>
            <button
              type="button"
              onClick={this.reset}
              className="mt-4 btn-secondary px-4 py-2 text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
}
