import { Component, type ErrorInfo, type ReactNode } from 'react';
import Error500 from '@/pages/error/Error500';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Excepción no capturada en React ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Error500
          title="Error Inesperado en la Interfaz"
          message="Ocurrió una falla inesperada en el renderizado de la aplicación web. El error ha sido registrado."
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
