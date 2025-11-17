import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useNetworkVariable } from "../networkConfig";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import LoadingBar from "./molecules/LoadingBar";

export default function ViewQR() {
  const { nft } = useParams();
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const packageId = useNetworkVariable("packageId" as never);
  const client = new IotaClient({
    url: getFullnodeUrl("devnet"),
  });

  useEffect(() => {
    if (nft) {
      client
        .getObject({
          id: nft,
          options: {
            showContent: true,
          },
        })
        .then((res) => {
          setTicketData(res.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching ticket data:", error);
          setLoading(false);
        });
    }
  }, [nft]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <LoadingBar />
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '4rem',
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
        color: 'var(--hot-magenta)',
      }}>
        TICKET NOT FOUND
      </div>
    );
  }

  const ticketFields = ticketData.content?.fields;

  // Create QR code data with ticket information
  const qrData = JSON.stringify({
    ticketId: nft,
    eventId: ticketFields?.event_id,
    seatNumber: ticketFields?.seat_number,
    packageId: packageId,
  });

  return (
    <div className="fade-in-up" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
      gap: '2rem',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
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
          YOUR TICKET
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--electric-cyan)',
          fontSize: '0.9rem',
          margin: 0,
          letterSpacing: '0.15em',
        }}>
          SHOW THIS QR CODE AT ENTRANCE
        </p>
      </div>

      {/* Ticket Card */}
      <div className="fade-in-up-delay-1" style={{
        position: 'relative',
        maxWidth: '500px',
        width: '100%',
        background: 'var(--gradient-card)',
        border: '2px solid var(--electric-cyan)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-neon-cyan), var(--shadow-card)',
      }}>
        {/* Decorative header strip */}
        <div style={{
          background: 'var(--gradient-accent)',
          height: '4px',
        }} />

        <div style={{ padding: '2.5rem' }}>
          {/* QR Code */}
          <div className="qr-container" style={{
            margin: '0 auto 2rem auto',
            width: 'fit-content',
          }}>
            <QRCodeSVG
              value={qrData}
              size={280}
              level="H"
              includeMargin={false}
            />
          </div>

          {/* Ticket Details */}
          <div style={{
            display: 'grid',
            gap: '1.5rem',
            fontFamily: 'var(--font-mono)',
          }}>
            <div>
              <div style={{
                color: 'var(--electric-cyan)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '0.25rem',
              }}>
                Event ID
              </div>
              <div style={{
                color: 'var(--white-glow)',
                fontSize: '1.1rem',
                fontWeight: 'bold',
              }}>
                {ticketFields?.event_id}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}>
              <div>
                <div style={{
                  color: 'var(--electric-cyan)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginBottom: '0.25rem',
                }}>
                  Seat #
                </div>
                <div style={{
                  color: 'var(--hot-magenta)',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  lineHeight: 1,
                }}>
                  {ticketFields?.seat_number}
                </div>
              </div>

              <div>
                <div style={{
                  color: 'var(--electric-cyan)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginBottom: '0.25rem',
                }}>
                  Date
                </div>
                <div style={{
                  color: 'var(--white-glow)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                }}>
                  {ticketFields?.event_date}
                </div>
              </div>
            </div>

            <div>
              <div style={{
                color: 'var(--electric-cyan)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '0.25rem',
              }}>
                Price
              </div>
              <div style={{
                color: 'var(--lime-flash)',
                fontSize: '1.1rem',
                fontWeight: 'bold',
              }}>
                {ticketFields?.price} IOTA
              </div>
            </div>
          </div>
        </div>

        {/* Decorative footer strip */}
        <div style={{
          background: 'var(--gradient-accent)',
          height: '4px',
        }} />

        {/* Perforated edge effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '-10px',
          width: '20px',
          height: '20px',
          background: 'var(--void-black)',
          borderRadius: '50%',
          border: '2px solid var(--electric-cyan)',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '-10px',
          width: '20px',
          height: '20px',
          background: 'var(--void-black)',
          borderRadius: '50%',
          border: '2px solid var(--electric-cyan)',
        }} />
      </div>

      {/* Instructions */}
      <div className="fade-in-up-delay-2" style={{
        textAlign: 'center',
        maxWidth: '400px',
        padding: '1.5rem',
        background: 'rgba(0, 240, 255, 0.05)',
        border: '1px solid rgba(0, 240, 255, 0.2)',
        borderRadius: '8px',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--white-glow)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          margin: 0,
        }}>
          <span style={{ color: 'var(--electric-cyan)', fontWeight: 'bold' }}>⚡ Present this QR code</span> at the event entrance for verification and entry. Your ticket will be marked as redeemed upon scanning.
        </p>
      </div>
    </div>
  );
}
