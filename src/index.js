import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[PWA ErrorBoundary] Error capturado:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '30px',
          backgroundColor: '#0A0E17',
          color: '#F87171',
          fontFamily: 'monospace',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.4rem', color: '#EF4444', marginBottom: '16px' }}>
            ⚠️ Error de Carga en la Terminal de Cabina PWA
          </h2>
          <p style={{ color: '#94A3B8', marginBottom: '20px', maxWidth: '600px' }}>
            {this.state.error?.toString()}
          </p>
          <button
            onClick={() => {
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                  for (let r of registrations) r.unregister();
                });
              }
              window.location.reload(true);
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 Limpiar Caché y Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error('[Index] Contenedor #root no encontrado en el DOM.');
}
