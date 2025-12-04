import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';
import RushCoffeeLogo from '../layout/RushCoffeeLogo';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
                    <div className="mb-6 rounded-full bg-red-100 p-4 animate-bounce-soft">
                        <AlertTriangle className="h-12 w-12 text-red-600" />
                    </div>
                    <RushCoffeeLogo className="mb-6 h-16 w-16 text-gray-400 opacity-50" />
                    <h1 className="mb-2 font-display text-3xl font-bold text-gray-900">
                        Oops! Something went wrong.
                    </h1>
                    <p className="mb-8 max-w-md text-gray-600">
                        We encountered an unexpected error. Our team has been notified.
                        Please try refreshing the page.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            startIcon={<RefreshCw className="h-4 w-4" />}
                        >
                            Refresh Page
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.href = '/';
                            }}
                            startIcon={<Home className="h-4 w-4" />}
                        >
                            Go Home
                        </Button>
                    </div>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <div className="mt-8 w-full max-w-2xl overflow-auto rounded-lg bg-gray-900 p-4 text-left text-xs text-red-300 shadow-inner">
                            <p className="font-bold mb-2">Error Details:</p>
                            <pre className="whitespace-pre-wrap font-mono">{this.state.error.toString()}</pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
