import { ConnectButton } from "@iota/dapp-kit";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useCreateForm } from "./hooks/useCreateForm";
import { Box, Flex } from "@radix-ui/themes";

function App() {
  const { address } = useCreateForm();
  const location = useLocation();

  // Primary Navigation (Destinations)
  const mainNav = [
    { path: '/', label: 'My Tickets' },
    { path: '/AvailableTickets', label: 'Marketplace' },
  ];

  // Secondary Actions (Utilities)
  const actionNav = [
    { path: '/mint', label: 'Create', icon: '➕' },
    { path: '/scanQR', label: 'Scan', icon: '📷' },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      
      <nav className="navbar" style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'var(--paper-white)',
        borderBottom: '2px solid var(--ink-black)',
      }}>
        <div className="nav-container">
          
          {/* LEFT: Logo & Primary Nav */}
          <Flex align="center" gap="5" className="nav-left">
            <Link to="/" style={{ textDecoration: 'none', border: 'none' }}>
              <div style={{
                background: 'var(--ink-black)',
                color: 'var(--paper-white)',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.2rem',
                padding: '0.4rem 0.8rem',
                transform: 'rotate(-2deg)',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap'
              }}>
                KlarPass
              </div>
            </Link>

            {address && (
              <Flex gap="4" className="desktop-links">
                {mainNav.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      style={{
                        textDecoration: 'none',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.95rem',
                        fontWeight: isActive ? 800 : 600,
                        color: isActive ? 'var(--stamp-blue)' : 'var(--ink-black)',
                        borderBottom: isActive ? '2px solid var(--stamp-blue)' : '2px solid transparent',
                        paddingBottom: '2px',
                        transition: 'all 0.2s',
                        opacity: isActive ? 1 : 0.7
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </Flex>
            )}
          </Flex>

          {/* RIGHT: Actions & Wallet */}
          <Flex align="center" gap="3" className="nav-right">
            {address && (
              <Flex gap="2">
                {actionNav.map((item) => (
                  <Link key={item.path} to={item.path} style={{ textDecoration: 'none', border: 'none' }}>
                    <button style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '0.5rem 1rem',
                      background: 'transparent',
                      color: 'var(--ink-black)',
                      border: '1px solid var(--ink-black)', // Outline style (Secondary)
                      borderRadius: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease',
                      opacity: 0.8
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--soft-gray)';
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.opacity = '0.8';
                    }}
                    >
                      <span>{item.icon}</span>
                      <span className="action-label">{item.label}</span>
                    </button>
                  </Link>
                ))}
              </Flex>
            )}
            
            <Box style={{ transform: 'scale(0.9)' }}>
              <ConnectButton />
            </Box>
          </Flex>
        </div>
      </nav>

      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <Outlet />
      </main>

      {/* RESPONSIVE STYLES */}
      <style>{`
        .navbar {
          height: 72px;
          transition: height 0.3s ease;
        }
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        @media (max-width: 768px) {
          .navbar {
            height: auto;
            padding: 1rem 0;
          }
          .nav-container {
            flex-direction: column;
            gap: 1.5rem;
          }
          .nav-left {
            flex-direction: column;
            width: 100%;
            justify-content: center;
          }
          .desktop-links {
            width: 100%;
            justify-content: center;
            border-top: 1px solid var(--soft-gray);
            padding-top: 1rem;
          }
          .nav-right {
            width: 100%;
            justify-content: center;
            flex-direction: column-reverse; /* Wallet on bottom for mobile access */
            gap: 1rem;
          }
          .action-label {
            display: inline; /* Ensure labels are visible on mobile */
          }
        }
      `}</style>
    </div>
  );
}

export default App;