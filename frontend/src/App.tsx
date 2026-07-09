import React from 'react'
import Home from './pages/Home'
import './App.css'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", height: "100vh", background: "#0a0a0a",
          color: "#fff", fontFamily: "monospace", gap: 16,
        }}>
          <p style={{ fontSize: 16, letterSpacing: 2 }}>Algo salió mal</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: "10px 20px", fontSize: 12, fontFamily: "monospace",
              letterSpacing: 2, background: "#fff", color: "#000",
              border: "none", borderRadius: 2, cursor: "pointer",
            }}
          >
            REINTENTAR
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <div>
      <ErrorBoundary>
        <Home />
      </ErrorBoundary>
    </div>
  )
}

export default App
