import { ConnectButton } from "@iota/dapp-kit";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useCreateForm } from "./hooks/useCreateForm";

function App() {
  const { address } = useCreateForm();
  const location = useLocation();

  const navItems = [
    { path: '/AvailableTickets', label: 'Browse', icon: '🎫' },
    { path: '/mint', label: 'Create', icon: '✨' },
    { path: '/scanQR', label: 'Scan', icon: '📱' },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.98) 0%, rgba(26, 31, 58, 0.98) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 240, 255, 0.1)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flex: '0 0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--gradient-accent)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 4px 16px rgba(0, 240, 255, 0.3)',
              }}>
                🎭
              </div>
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  background: 'var(--gradient-accent)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.1em',
                  margin: 0,
                  lineHeight: 1,
                }}>
                  TIXΞT
                </h1>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  color: 'rgba(0, 240, 255, 0.7)',
                  margin: '0.2rem 0 0 0',
                  letterSpacing: '0.15em',
                }}>
                  WEB3 EVENTS
                </p>
              </div>
            </div>
          </Link>

          {/* Unified Navigation Tabs */}
          {address && (
            <div style={{
              flex: '1 1 auto',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '0.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(0, 240, 255, 0.1)',
              maxWidth: '600px',
            }}>
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      textDecoration: 'none',
                      flex: '1 1 0',
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <button style={{
                      width: '100%',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? '700' : '500',
                      padding: '0.75rem 1.25rem',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(123, 44, 191, 0.2))'
                        : 'transparent',
                      color: isActive ? 'var(--electric-cyan)' : 'rgba(240, 244, 248, 0.7)',
                      border: isActive
                        ? '1px solid rgba(0, 240, 255, 0.4)'
                        : '1px solid transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isActive
                        ? '0 0 20px rgba(0, 240, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(0, 240, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.2)';
                        e.currentTarget.style.color = 'var(--white-glow)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(240, 244, 248, 0.7)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                      <span>{item.label}</span>
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '60%',
                          height: '2px',
                          background: 'var(--gradient-accent)',
                          borderRadius: '2px 2px 0 0',
                          boxShadow: '0 0 10px var(--electric-cyan)',
                        }} />
                      )}
                    </button>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Connect Wallet */}
          <div style={{ flex: '0 0 auto' }}>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
      }}>
        <Outlet />
      </main>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          nav > div {
            flex-direction: column !important;
            gap: 1rem !important;
            padding: 1rem !important;
          }
          nav > div > div:nth-child(2) {
            width: 100%;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
