import { ConnectButton } from "@iota/dapp-kit";
import { Link, Outlet } from "react-router-dom";
import { useNetworkVariable } from "./networkConfig";
import { useEffect, useState } from "react";
import { useCreateForm } from "./hooks/useCreateForm";

function App() {
  const creatorCap = useNetworkVariable("creatorCap" as never);
  const [_isCreator, setIsCreator] = useState<boolean>(false);
  const { address } = useCreateForm();

  useEffect(() => {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "iota_getObject",
      params: [creatorCap, { showContent: true }],
    };
    fetch("https://indexer.testnet.iota.cafe/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((res) => {
        setIsCreator(address.address === res.result.data.content.fields.address);
      });
  }, [address]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 31, 58, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid var(--electric-cyan)',
        boxShadow: '0 4px 20px rgba(0, 240, 255, 0.2)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              background: 'var(--gradient-accent)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.1em',
              margin: 0,
              textShadow: '0 0 30px rgba(0, 240, 255, 0.5)',
            }}>
              TIXΞT
            </h1>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--electric-cyan)',
              margin: '0.25rem 0 0 0',
              letterSpacing: '0.2em',
            }}>
              DECENTRALIZED EVENTS
            </p>
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {address && (
              <Link to="/AvailableTickets">
                <button style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  padding: '0.85rem 2rem',
                  background: 'linear-gradient(135deg, var(--electric-cyan), var(--purple-haze))',
                  color: 'var(--void-black)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)',
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 240, 255, 0.4)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 240, 255, 0.3)';
                }}>
                  Browse Tickets
                </button>
              </Link>
            )}
            {address && (
              <Link to="/mint">
                <button style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(123, 44, 191, 0.15)',
                  color: 'var(--white-glow)',
                  border: '1px solid rgba(123, 44, 191, 0.4)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease',
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(123, 44, 191, 0.25)';
                  e.currentTarget.style.borderColor = 'var(--purple-haze)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(123, 44, 191, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(123, 44, 191, 0.4)';
                }}>
                  Create Event
                </button>
              </Link>
            )}
            {address && (
              <Link to="/scanQR">
                <button style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: 'var(--white-glow)',
                  border: '1px solid rgba(240, 244, 248, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease',
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(240, 244, 248, 0.05)';
                  e.currentTarget.style.borderColor = 'var(--white-glow)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(240, 244, 248, 0.3)';
                }}>
                  Scan QR
                </button>
              </Link>
            )}
            <div style={{ marginLeft: '0.5rem' }}>
              <ConnectButton />
            </div>
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
    </div>
  );
}

export default App;
