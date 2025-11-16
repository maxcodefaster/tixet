import { useCreateForm } from "../hooks/useCreateForm";
import OwnedObjects from "./OwnedTickets";
import AvailableTickets from "./AvailableTickets";

export default function Home() {
  const { address } = useCreateForm();

  if (!address) {
    return (
      <div className="fade-in-up" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: '2rem',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '4rem',
            background: 'var(--gradient-accent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 1rem 0',
            letterSpacing: '0.05em',
          }}>
            LIVE ON CHAIN
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.3rem',
            color: 'var(--white-glow)',
            maxWidth: '600px',
            lineHeight: 1.6,
          }}>
            Decentralized ticketing powered by blockchain. Own your tickets as NFTs. Trade freely. Verify instantly.
          </p>
        </div>

        <div style={{
          padding: '2rem',
          background: 'rgba(0, 240, 255, 0.05)',
          border: '2px solid var(--electric-cyan)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-neon-cyan)',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--electric-cyan)',
            fontSize: '1rem',
            margin: 0,
          }}>
            ⚡ Connect your wallet to get started
          </p>
        </div>

        {/* Feature highlights */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          maxWidth: '900px',
          marginTop: '3rem',
        }}>
          <FeatureCard
            icon="🎫"
            title="NFT Tickets"
            description="Each ticket is a unique blockchain asset you truly own"
          />
          <FeatureCard
            icon="🔐"
            title="Secure QR"
            description="QR codes verified on-chain, impossible to counterfeit"
          />
          <FeatureCard
            icon="💸"
            title="Free Market"
            description="Resell tickets directly without platform restrictions"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero section for connected users */}
      <div className="fade-in-up" style={{
        marginBottom: '3rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3rem',
          background: 'var(--gradient-accent)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.5rem 0',
          letterSpacing: '0.05em',
        }}>
          MY TICKETS
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--electric-cyan)',
          fontSize: '0.9rem',
          letterSpacing: '0.15em',
        }}>
          YOUR BLOCKCHAIN TICKET COLLECTION
        </p>
      </div>

      {/* Owned tickets gallery */}
      <OwnedObjects />

      {/* Marketplace section */}
      <div className="fade-in-up-delay-1" style={{
        marginTop: '4rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          background: 'var(--gradient-accent)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.5rem 0',
          letterSpacing: '0.05em',
          textAlign: 'center',
        }}>
          MARKETPLACE
        </h2>
        <p style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--electric-cyan)',
          fontSize: '0.9rem',
          letterSpacing: '0.15em',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          AVAILABLE TICKETS FOR PURCHASE
        </p>
        <AvailableTickets />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="fade-in-up-delay-1" style={{
      padding: '1.5rem',
      background: 'var(--gradient-card)',
      border: '1px solid rgba(0, 240, 255, 0.2)',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
    }} onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.borderColor = 'var(--electric-cyan)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 240, 255, 0.3)';
    }} onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.2)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{icon}</div>
      <h4 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1rem',
        color: 'var(--electric-cyan)',
        marginBottom: '0.5rem',
      }}>
        {title}
      </h4>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.85rem',
        color: 'var(--white-glow)',
        opacity: 0.8,
        lineHeight: 1.4,
        margin: 0,
      }}>
        {description}
      </p>
    </div>
  );
}
