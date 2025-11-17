import * as Form from "@radix-ui/react-form";
import styles from "../style";
import Button from "./molecules/Button";
import { OpenFormState } from "../type";
import { Box, TextField } from "@radix-ui/themes";
import { useCreateForm } from "../hooks/useCreateForm";
import submitForm from "../utils/submitForm";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const InputForm = ({ openForm }: { openForm: OpenFormState["openForm"] }) => {
  const {
    packageId,
    eventObject,
    signAndExecuteTransaction,
    client,
    formData,
    updateFormData,
    resetFormData,
  } = useCreateForm();
  const [loading,setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const formTitles: Record<string, { title: string; subtitle: string; icon: string }> = {
    Mint: {
      title: 'Create Event',
      subtitle: 'Create an event with multiple tickets and list them on the marketplace',
      icon: '🎫'
    },
    Transfer: {
      title: 'Transfer Ticket',
      subtitle: 'Send your ticket to another address',
      icon: '🔄'
    },
    Resell: {
      title: 'Resell Ticket',
      subtitle: 'List your ticket on the open marketplace (max 200% of original price)',
      icon: '💰'
    },
    Burn: {
      title: 'Burn Ticket',
      subtitle: 'Permanently destroy this ticket',
      icon: '🔥'
    },
  };

  const currentForm = formTitles[openForm] || { title: openForm, subtitle: '', icon: '📝' };

  return (
    <div style={{
      ...styles.formContainer,
      animation: 'fadeInUp 0.6s ease-out',
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '0.5rem',
          filter: 'drop-shadow(0 0 20px rgba(0, 240, 255, 0.4))',
        }}>
          {currentForm.icon}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          background: 'var(--gradient-accent)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 0.5rem 0',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {currentForm.title}
        </h1>
        {currentForm.subtitle && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            color: 'rgba(240, 244, 248, 0.6)',
            margin: 0,
          }}>
            {currentForm.subtitle}
          </p>
        )}
      </div>
      <Form.Root style={styles.formRoot}>
        {(openForm === "BuyResell" || openForm === "BuyTicket") && (
          <Form.Field name="" style={styles.formField}>
            <Form.Label style={styles.formLabel}>IOTA Coin ID</Form.Label>
            <Form.Control asChild>
              <TextField.Root
                size="2"
                placeholder="0X2::coin::IOTA"
                value={formData.coin}
                onChange={(e) => updateFormData("coin", e.target.value)}
              />
            </Form.Control>
          </Form.Field>
        )}

        {openForm === "Mint" && (
          <Form.Field name="" style={styles.formField}>
            <Form.Label style={styles.formLabel}>Event Name</Form.Label>
            <Form.Control asChild>
              <TextField.Root
                value={formData?.eventName}
                onChange={(e) => updateFormData("eventName", e.target.value)}
                size="2"
                placeholder="e.g., Summer Music Festival 2025"
              />
            </Form.Control>
            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(240, 244, 248, 0.6)',
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
            }}>
              Display name for your event
            </p>
          </Form.Field>
        )}

        {openForm === "Mint" && (
          <Form.Field name="" style={styles.formField}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <Form.Label style={styles.formLabel}>Event ID</Form.Label>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--electric-cyan)',
                fontFamily: 'var(--font-mono)',
                background: 'rgba(0, 240, 255, 0.1)',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid rgba(0, 240, 255, 0.2)',
              }}>
                UNIQUE ID
              </span>
            </div>
            <Form.Control asChild>
              <TextField.Root
                value={formData?.eventId}
                onChange={(e) => updateFormData("eventId", e.target.value)}
                size="2"
                placeholder="e.g., summer-music-fest-2025"
              />
            </Form.Control>
            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              borderRadius: '6px',
            }}>
              <p style={{
                fontSize: '0.8rem',
                color: 'rgba(240, 244, 248, 0.8)',
                fontFamily: 'var(--font-mono)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                💡 <strong style={{ color: 'var(--electric-cyan)' }}>Pro tip:</strong> Use a unique, memorable identifier for your event. This becomes the permanent blockchain identifier.
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(240, 244, 248, 0.5)',
                fontFamily: 'var(--font-mono)',
                margin: '0.5rem 0 0 0',
              }}>
                Examples: "coachella-2025", "eth-denver", "local-concert-oct"
              </p>
            </div>
          </Form.Field>
        )}

        {openForm === "Mint" && (
          <Form.Field name="" style={styles.formField}>
            <Form.Label style={styles.formLabel}>Venue</Form.Label>
            <Form.Control asChild>
              <TextField.Root
                value={formData?.venue}
                onChange={(e) => updateFormData("venue", e.target.value)}
                size="2"
                placeholder="e.g., Madison Square Garden, New York"
              />
            </Form.Control>
            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(240, 244, 248, 0.6)',
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
            }}>
              Location where the event will take place
            </p>
          </Form.Field>
        )}

        {openForm === "Mint" && (
          <Form.Field name="" style={styles.formField}>
            <Form.Label style={styles.formLabel}>Event Date</Form.Label>
            <Form.Control asChild>
              <input
                type="date"
                value={
                  // Convert from DDMMYYYY to YYYY-MM-DD for display
                  formData.eventdate && formData.eventdate.length === 8
                    ? `${formData.eventdate.slice(4, 8)}-${formData.eventdate.slice(2, 4)}-${formData.eventdate.slice(0, 2)}`
                    : ""
                }
                onChange={(e) => {
                  // Convert date format from YYYY-MM-DD to DDMMYYYY
                  const dateValue = e.target.value;
                  if (dateValue) {
                    const [year, month, day] = dateValue.split('-');
                    const formattedDate = `${day}${month}${year}`;
                    updateFormData("eventdate", formattedDate);
                  } else {
                    updateFormData("eventdate", "");
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-body)',
                  background: 'rgba(26, 31, 58, 0.6)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '6px',
                  color: 'var(--white-glow)',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--electric-cyan)';
                  e.target.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 240, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </Form.Control>
            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(240, 244, 248, 0.6)',
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
            }}>
              Select the date when your event will take place
            </p>
          </Form.Field>
        )}

        {openForm === "Mint" && (
          <Form.Field name="" style={styles.formField}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <Form.Label style={styles.formLabel}>Number of Tickets</Form.Label>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--lime-flash)',
                fontFamily: 'var(--font-mono)',
                background: 'rgba(204, 255, 0, 0.1)',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid rgba(204, 255, 0, 0.2)',
              }}>
                CAPACITY
              </span>
            </div>
            <Form.Control asChild>
              <TextField.Root
                value={formData?.ticketCount}
                onChange={(e) => updateFormData("ticketCount", e.target.value)}
                size="2"
                placeholder="e.g., 100"
                type="number"
                min="1"
              />
            </Form.Control>
            <p style={{
              fontSize: '0.8rem',
              color: 'rgba(240, 244, 248, 0.6)',
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
            }}>
              🎟️ Total number of tickets to create for this event
            </p>
          </Form.Field>
        )}

        {openForm === "Mint" && (
          <Form.Field name="" style={styles.formField}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <Form.Label style={styles.formLabel}>Royalty Percentage</Form.Label>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--lime-flash)',
                fontFamily: 'var(--font-mono)',
                background: 'rgba(204, 255, 0, 0.1)',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid rgba(204, 255, 0, 0.2)',
              }}>
                EARNINGS
              </span>
            </div>
            <Form.Control asChild>
              <div style={{ position: 'relative' }}>
                <TextField.Root
                  value={formData.royaltyPercentage}
                  onChange={(e) =>
                    updateFormData("royaltyPercentage", e.target.value)
                  }
                  size="2"
                  placeholder="2"
                  type="number"
                  min="0"
                  max="100"
                />
                <span style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1rem',
                  color: 'rgba(240, 244, 248, 0.4)',
                  fontFamily: 'var(--font-mono)',
                  pointerEvents: 'none',
                }}>
                  %
                </span>
              </div>
            </Form.Control>
            <p style={{
              fontSize: '0.8rem',
              color: 'rgba(240, 244, 248, 0.6)',
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
            }}>
              💰 Earn this % from every resale on the secondary market
            </p>
          </Form.Field>
        )}

        {openForm === "Mint" && (
          <Form.Field name="" style={styles.formField}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <Form.Label style={styles.formLabel}>Ticket Price</Form.Label>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--hot-magenta)',
                fontFamily: 'var(--font-mono)',
                background: 'rgba(255, 0, 110, 0.1)',
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                border: '1px solid rgba(255, 0, 110, 0.2)',
              }}>
                IOTA
              </span>
            </div>
            <Form.Control asChild>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1rem',
                  color: 'rgba(240, 244, 248, 0.4)',
                  fontFamily: 'var(--font-mono)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}>
                  ⟠
                </span>
                <TextField.Root
                  value={formData.price}
                  onChange={(e) => updateFormData("price", e.target.value)}
                  size="2"
                  placeholder="10.00"
                  type="number"
                  min="0"
                  step="0.01"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </Form.Control>
            <p style={{
              fontSize: '0.8rem',
              color: 'rgba(240, 244, 248, 0.6)',
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
            }}>
              🎟️ Initial price per ticket in IOTA tokens
            </p>
          </Form.Field>
        )}

        {(openForm === "Transfer" ||
          openForm === "Resell" ||
          openForm === "Burn") && (
          <Form.Field name="" style={styles.formField}>
            <Form.Label style={styles.formLabel}>NFT ID</Form.Label>
            <Form.Control asChild>
              <TextField.Root
                value={formData.nft}
                onChange={(e) => updateFormData("nft", e.target.value)}
                size="2"
                placeholder="NFT Id"
              />
            </Form.Control>
          </Form.Field>
        )}

        {openForm === "Transfer" && (
          <Form.Field name="" style={styles.formField}>
            <Form.Label style={styles.formLabel}>Recipient</Form.Label>
            <Form.Control asChild>
              <TextField.Root
                value={formData.recipient}
                onChange={(e) => updateFormData("recipient", e.target.value)}
                size="2"
                placeholder="Recipient address"
              />
            </Form.Control>
          </Form.Field>
        )}

        {openForm === "BuyResell" && (
          <Form.Field name="" style={styles.formField}>
            <Form.Label style={styles.formLabel}>
              Initiated Resell ID
            </Form.Label>
            <Form.Control asChild>
              <TextField.Root
                value={formData.initiatedResell}
                onChange={(e) =>
                  updateFormData("initiatedResell", e.target.value)
                }
                size="2"
                placeholder="Initialed Resell"
              />
            </Form.Control>
          </Form.Field>
        )}
        {openForm === "BuyTicket" && (
          <Form.Field name="" style={styles.formField}>
            <Form.Label style={styles.formLabel}>
              Seat Number
            </Form.Label>
            <Form.Control asChild>
              <TextField.Root
                value={formData.seatNumber}
                onChange={(e) =>
                  updateFormData("seatNumber", e.target.value)
                }
                size="2"
                placeholder="Seat Number"
              />
            </Form.Control>
          </Form.Field>
        )}
        <Box style={{ display: "flex", justifyContent: "center" }}>
          <Button
            disabled={loading}
            onClick={(e) => {
              setLoading(true);
              submitForm(
                e,
                openForm,
                formData,
                resetFormData,
                packageId,
                eventObject,
                signAndExecuteTransaction,
                client,
                navigate,
                setLoading
              )
            }}
            title={"Submit"}
          />
        </Box>
      </Form.Root>

      {/* Responsive styles for form */}
      <style>{`
        @media (max-width: 768px) {
          [style*="maxWidth: 700px"] {
            padding: 1.5rem !important;
            margin-top: 1rem !important;
          }
        }

        @media (max-width: 480px) {
          [style*="maxWidth: 700px"] {
            padding: 1rem !important;
            border-radius: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InputForm;
