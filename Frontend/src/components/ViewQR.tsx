import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useNetworkVariable } from "../networkConfig";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import LoadingBar from "./molecules/LoadingBar";
import { getExplorerObjectUrl } from "../utils/explorerUtils";

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
        color: 'var(--ticket-pink)',
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
      gap: '2.5rem',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '3rem',
          color: 'var(--ink-black)',
          margin: '0 0 0.5rem 0',
          letterSpacing: '0.02em',
          fontWeight: 900,
        }}>
          YOUR TICKET
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--stamp-blue)',
          fontSize: '0.95rem',
          margin: 0,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}>
          Show this QR code at entrance
        </p>
      </div>

      {/* Ticket Card */}
      <div className="fade-in-up-delay-1 ticket-card-edge" style={{
        position: 'relative',
        maxWidth: '550px',
        width: '100%',
        background: 'var(--paper-white)',
        border: '3px solid var(--ink-black)',
        borderRadius: '12px',
        overflow: 'visible',
        boxShadow: 'var(--paper-shadow)',
      }}>
        <div style={{ padding: '3rem 2.5rem 2.5rem' }}>
          {/* QR Code with stamp effect */}
          <div className="qr-container" style={{
            margin: '0 auto 2.5rem auto',
            width: 'fit-content',
            position: 'relative',
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
            fontFamily: 'var(--font-body)',
          }}>
            <div>
              <div style={{
                color: 'var(--stamp-blue)',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '0.25rem',
                fontWeight: 700,
              }}>
                Event ID
              </div>
              <div style={{
                color: 'var(--ink-black)',
                fontSize: '1.1rem',
                fontWeight: 'bold',
              }}>
                {ticketFields?.event_id}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
            }}>
              <div>
                <div style={{
                  color: 'var(--stamp-blue)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginBottom: '0.25rem',
                  fontWeight: 700,
                }}>
                  Seat #
                </div>
                <div style={{
                  color: 'var(--ticket-pink)',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  lineHeight: 1,
                  fontFamily: 'var(--font-display)',
                }}>
                  {ticketFields?.seat_number}
                </div>
              </div>

              <div>
                <div style={{
                  color: 'var(--stamp-blue)',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginBottom: '0.25rem',
                  fontWeight: 700,
                }}>
                  Date
                </div>
                <div style={{
                  color: 'var(--ink-black)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                }}>
                  {ticketFields?.event_date}
                </div>
              </div>
            </div>

            <div>
              <div style={{
                color: 'var(--stamp-blue)',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '0.25rem',
                fontWeight: 700,
              }}>
                Price
              </div>
              <div style={{
                color: 'var(--sticker-yellow)',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                textShadow: '1px 1px 0px rgba(0, 0, 0, 0.1)',
              }}>
                {ticketFields?.price} IOTA
              </div>
            </div>

            <div>
              <a
                href={getExplorerObjectUrl(nft as string)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--stamp-blue)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  borderBottom: '2px solid transparent',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderBottomColor = 'var(--stamp-blue)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }}
              >
                🔍 View Ticket on IOTA Explorer
              </a>
            </div>
          </div>
        </div>

        {/* Decorative corner holes (like real ticket perforation) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '-8px',
          width: '16px',
          height: '16px',
          background: 'var(--paper-cream)',
          borderRadius: '50%',
          border: '2px solid var(--ink-black)',
          transform: 'translateY(-50%)',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '-8px',
          width: '16px',
          height: '16px',
          background: 'var(--paper-cream)',
          borderRadius: '50%',
          border: '2px solid var(--ink-black)',
          transform: 'translateY(-50%)',
        }} />
      </div>

    </div>
  );
}
