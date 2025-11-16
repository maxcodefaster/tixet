import { ConnectButton } from "@iota/dapp-kit";
import { Link, Outlet } from "react-router-dom";
import { useNetworkVariable } from "./networkConfig";
import { useEffect, useState } from "react";
import { useCreateForm } from "./hooks/useCreateForm";

function App() {
  const creatorCap = useNetworkVariable("creatorCap" as never);
  const [isCreator, setIsCreator] = useState<boolean>(false);
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
        setIsCreator(address.address == res.result.data.content.fields.address);
      });
  }, [address]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Scanline effect */}
      <div className="scanline" />

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
            {isCreator && address && (
              <Link to="/mint">
                <button style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, var(--hot-magenta), var(--purple-haze))',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 15px rgba(255, 0, 110, 0.4)',
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 0, 110, 0.6)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 110, 0.4)';
                }}>
                  ⚡ Mint Tickets
                </button>
              </Link>
            )}
            {!isCreator && address && (
              <Link to="/AvailableTickets">
                <button style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, var(--electric-cyan), var(--purple-haze))',
                  color: 'var(--void-black)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.6)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.4)';
                }}>
                  🎫 Browse Tickets
                </button>
              </Link>
            )}
            {address && (
              <Link to="/scanQR">
                <button style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, var(--orange-burst), var(--hot-magenta))',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 15px rgba(255, 107, 0, 0.4)',
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 107, 0, 0.6)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 107, 0, 0.4)';
                }}>
                  📷 Scan QR
                </button>
              </Link>
            )}
            <div style={{ marginLeft: '1rem' }}>
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
