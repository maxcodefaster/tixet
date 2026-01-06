import { useCreateForm } from "../hooks/useCreateForm";
import OwnedObjects from "./OwnedTickets";
import AvailableTickets from "./AvailableTickets";
import { Link } from "react-router-dom";

// The Wave - Purely Visual Delight
function WaveDivider() {
  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      lineHeight: 0,
      margin: '0 0 2rem 0',
      opacity: 1
    }}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '50px' }}
      >
        <path
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
          fill="var(--ink-black)"
          opacity="0.05"
        />
      </svg>
    </div>
  );
}

export default function Home() {
  const { address } = useCreateForm();

  // 1. LANDING PAGE STATE (Not Connected) - Show Marketplace
  if (!address) {
    return (
      <div className="fade-in-up">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '30vh',
          textAlign: 'center',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              color: 'var(--ink-black)',
              margin: 0,
              letterSpacing: '-0.03em',
              fontWeight: 900,
              lineHeight: 0.9,
              textShadow: '4px 4px 0px var(--soft-gray)'
            }}>
              KlarPass
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.5rem',
              color: 'var(--stamp-blue)',
              fontWeight: 700,
              marginTop: '1rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              The Future of Event Ticketing
            </p>
          </div>

          <div style={{
            padding: '1.5rem 2.5rem',
            background: 'var(--paper-white)',
            border: '3px solid var(--ink-black)',
            borderRadius: '16px',
            boxShadow: 'var(--paper-shadow)',
            transform: 'rotate(-1deg)',
            maxWidth: '500px',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--ink-black)',
              fontSize: '1rem',
              margin: 0,
              lineHeight: 1.6,
            }}>
              Connect your wallet to buy tickets, manage your collection, or create new events.
            </p>
          </div>
        </div>

        {/* User Onboarding Section */}
        <div style={{
          padding: '2rem',
          background: 'var(--paper-white)',
          border: '3px solid var(--ink-black)',
          borderRadius: '16px',
          maxWidth: '600px',
          margin: '2rem auto',
          boxShadow: 'var(--paper-shadow)',
          position: 'relative'
        }}>
          {/* Decorative tape */}
          <div style={{
            position: "absolute",
            top: "-10px",
            left: "50%",
            transform: "translateX(-50%) rotate(-2deg)",
            width: "100px",
            height: "24px",
            background: "var(--sticker-yellow)",
            opacity: 0.7,
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }} />

          <h2 style={{
            fontFamily: 'var(--font-display)',
            marginBottom: '1rem',
            color: 'var(--ink-black)',
            fontSize: '1.8rem'
          }}>
            First Time Here? 🎟️
          </h2>

          <ol style={{
            lineHeight: 2,
            fontFamily: 'var(--font-body)',
            paddingLeft: '1.5rem',
            color: 'var(--ink-black)'
          }}>
            <li>
              <strong>Connect Wallet:</strong> Click "Connect Wallet" button above to create your digital identity
            </li>
            <li>
              <strong>Get Test Tokens:</strong> Visit{' '}
              <a
                href="https://faucet.iota.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--stamp-blue)',
                  fontWeight: 700,
                  textDecoration: 'none',
                  borderBottom: '2px solid var(--stamp-blue)'
                }}
              >
                IOTA Faucet
              </a>
              {' '}to receive free testnet tokens
            </li>
            <li>
              <strong>Browse Events:</strong> Buy tickets with blockchain-verified authenticity
            </li>
          </ol>

          <p style={{
            color: 'gray',
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-body)',
            padding: '1rem',
            background: 'var(--soft-gray)',
            borderRadius: '8px',
            border: '1px solid var(--ink-black)'
          }}>
            💡 <strong>Production Note:</strong> In the real app, you'd use credit card payments.
            The blockchain runs invisibly in the background—no crypto knowledge needed!
          </p>
        </div>

        <WaveDivider />

        {/* Show Marketplace Tickets */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            color: 'var(--ink-black)',
            margin: '0 0 1rem 0',
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}>
            MARKETPLACE
          </h2>
          <AvailableTickets />
        </div>
      </div>
    );
  }

  // 2. DASHBOARD STATE (Connected)
  return (
    <div className="fade-in-up">
      {/* Header */}
      <div style={{ 
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3.5rem',
          color: 'var(--ink-black)',
          margin: 0,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          MY TICKETS
        </h1>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--stamp-blue)',
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: 0,
          }}>
            Wallet: {address.address.slice(0, 6)}...{address.address.slice(-4)}
          </p>
          
          <Link to="/AvailableTickets" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderBottom: '2px solid var(--stamp-blue)',
              color: 'var(--ink-black)',
              paddingBottom: '2px'
            }}>
              Looking for events? Go to Marketplace →
            </span>
          </Link>
        </div>
      </div>

      <WaveDivider />

      {/* Unified Ticket Grid */}
      <OwnedObjects />
    </div>
  );
}