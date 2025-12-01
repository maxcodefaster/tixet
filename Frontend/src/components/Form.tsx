import * as Form from "@radix-ui/react-form";
import { OpenFormState } from "../type";
import { Box, TextField } from "@radix-ui/themes";
import { useCreateForm } from "../hooks/useCreateForm";
import submitForm from "../utils/submitForm";
import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const navigate = useNavigate();

  const formTitles: Record<string, { title: string; subtitle: string; icon: string }> = {
    Mint: {
      title: 'Create Event',
      subtitle: 'Launch your event on the blockchain',
      icon: ''
    },
    Transfer: {
      title: 'Transfer Ticket',
      subtitle: 'Send your ticket to another address',
      icon: '🔄'
    },
    Resell: {
      title: 'Resell Ticket',
      subtitle: 'List your ticket on the marketplace',
      icon: '💰'
    },
    Burn: {
      title: 'Burn Ticket',
      subtitle: 'Permanently destroy this ticket',
      icon: '🔥'
    },
  };

  const currentForm = formTitles[openForm] || { title: openForm, subtitle: '', icon: '📝' };

  // Auto-generate Event ID from Event Name
  useEffect(() => {
    if (openForm === "Mint" && formData.eventName && !formData.eventId) {
      const autoId = formData.eventName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      updateFormData("eventId", autoId);
    }
  }, [formData.eventName, openForm]);

  const steps = [
    { number: 1, title: "Event Info", icon: "📋" },
    { number: 2, title: "Details", icon: "📍" },
    { number: 3, title: "Tickets", icon: "🎟️" },
  ];

  const totalSteps = openForm === "Mint" ? 3 : 1;

  const isStepComplete = (step: number): boolean => {
    if (step === 1) return !!(formData.eventName && formData.eventdate);
    if (step === 2) return !!(formData.eventId); // Venue is optional
    if (step === 3) return !!(formData.ticketCount && formData.price);
    return false;
  };

  const canProceed = isStepComplete(currentStep);

  return (
    <div style={{
      marginTop: "2rem",
      width: "100%",
      maxWidth: "700px",
      animation: 'fadeInUp 0.4s ease-out',
    }}>
      {/* Header */}
      <div className="paper-lift" style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '2rem',
        background: 'var(--paper-white)',
        border: '2px solid var(--ink-black)',
        borderRadius: '12px',
        boxShadow: 'var(--paper-shadow)',
        position: 'relative',
      }}>
        {/* Decorative tape */}
        <div style={{
          position: "absolute",
          top: "-8px",
          left: "50%",
          transform: "translateX(-50%) rotate(-1deg)",
          width: "80px",
          height: "20px",
          background: "var(--sticker-yellow)",
          opacity: 0.7,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }} />

        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
          {currentForm.icon}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          color: 'var(--ink-black)',
          margin: '0 0 0.5rem 0',
          fontWeight: 900,
          letterSpacing: '-0.02em',
        }}>
          {currentForm.title}
        </h1>
        {currentForm.subtitle && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            color: 'var(--stamp-blue)',
            margin: 0,
            fontWeight: 600,
          }}>
            {currentForm.subtitle}
          </p>
        )}
      </div>

      {/* Stepper for Mint form */}
      {openForm === "Mint" && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '2.5rem',
          position: 'relative',
        }}>
          {/* Progress line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '15%',
            right: '15%',
            height: '3px',
            background: 'var(--soft-gray)',
            zIndex: 0,
          }}>
            <div style={{
              height: '100%',
              background: 'var(--stamp-blue)',
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>

          {steps.map((step) => (
            <div key={step.number} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: currentStep >= step.number ? 'var(--stamp-blue)' : 'var(--paper-white)',
                border: `2px solid ${currentStep >= step.number ? 'var(--stamp-blue)' : 'var(--ink-black)'}`,                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: currentStep >= step.number ? 'white' : 'var(--ink-black)',
                boxShadow: currentStep >= step.number ? '3px 3px 0px rgba(0, 0, 0, 0.15)' : '2px 2px 0px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease',
                cursor: isStepComplete(step.number - 1) || step.number === 1 ? 'pointer' : 'not-allowed',
              }}
              onClick={() => {
                if (step.number === 1 || isStepComplete(step.number - 1)) {
                  setCurrentStep(step.number);
                }
              }}
              >
                {step.icon}
              </div>
              <p style={{
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-body)',
                fontWeight: currentStep === step.number ? 700 : 600,
                color: currentStep >= step.number ? 'var(--stamp-blue)' : 'var(--ink-black)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}>
                {step.title}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Form Container */}
      <div style={{
        padding: "2.5rem",
        background: "var(--paper-white)",
        borderRadius: "12px",
        border: "2px solid var(--ink-black)",
        boxShadow: "var(--paper-shadow)",
        position: "relative",
      }}>
        <Form.Root style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "1.75rem",
        }}>
          {/* Step 1: Event Basics */}
          {openForm === "Mint" && currentStep === 1 && (
            <>
              <Form.Field name="eventName" style={{ display: "flex", flexDirection: "column" }}>
                <Form.Label style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "var(--ink-black)",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  Event Name <span style={{ color: 'var(--ticket-pink)' }}>*</span>
                </Form.Label>
                <Form.Control asChild>
                  <TextField.Root
                    value={formData?.eventName}
                    onChange={(e) => updateFormData("eventName", e.target.value)}
                    size="3"
                    placeholder="e.g., Summer Music Festival 2025"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                    }}
                  />
                </Form.Control>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--ink-black)',
                  opacity: 0.7,
                  marginTop: '0.5rem',
                  fontFamily: 'var(--font-body)',
                }}>
                  The name your attendees will see
                </p>
              </Form.Field>

              <Form.Field name="eventdate" style={{ display: "flex", flexDirection: "column" }}>
                <Form.Label style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "var(--ink-black)",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  Event Date <span style={{ color: 'var(--ticket-pink)' }}>*</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="date"
                    value={
                      formData.eventdate && formData.eventdate.length === 8
? `${formData.eventdate.slice(4, 8)}-${formData.eventdate.slice(2, 4)}-${formData.eventdate.slice(0, 2)}`
                        : ""
                    }
                    onChange={(e) => {
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
                      background: 'var(--paper-white)',
                      border: '2px solid var(--ink-black)',
                      borderRadius: '4px',
                      color: 'var(--ink-black)',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </Form.Control>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--ink-black)',
                  opacity: 0.7,
                  marginTop: '0.5rem',
                  fontFamily: 'var(--font-body)',
                }}>
                  When will your event take place?
                </p>
              </Form.Field>
            </>
          )}

          {/* Step 2: Details */}
          {openForm === "Mint" && currentStep === 2 && (
            <>
              <Form.Field name="eventId" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <Form.Label style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "var(--ink-black)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    Event ID <span style={{ color: 'var(--ticket-pink)' }}>*</span>
                  </Form.Label>
                  <span style={{
                    fontSize: '0.7rem',
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                    background: 'var(--stamp-blue)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                    boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.15)',
                  }}>
                    AUTO-FILLED
                  </span>
                </div>
                <Form.Control asChild>
                  <TextField.Root
                    value={formData?.eventId}
                    onChange={(e) => updateFormData("eventId", e.target.value)}
                    size="3"
                    placeholder="auto-generated-from-name"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.9rem',
                    }}
                  />
                </Form.Control>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--ink-black)',
                  opacity: 0.7,
                  marginTop: '0.5rem',
                  fontFamily: 'var(--font-body)',
                }}>
                  ✨ Auto-generated unique ID (editable)
                </p>
              </Form.Field>

              <Form.Field name="venue" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <Form.Label style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "var(--ink-black)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    Venue
                  </Form.Label>
                  <span style={{
                    fontSize: '0.7rem',
                    color: 'var(--ink-black)',
                    fontFamily: 'var(--font-body)',
                    background: 'var(--sticker-yellow)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                    boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.15)',
                  }}>
                    OPTIONAL
                  </span>
                </div>
                <Form.Control asChild>
                  <TextField.Root
                    value={formData?.venue}
                    onChange={(e) => updateFormData("venue", e.target.value)}
                    size="3"
                    placeholder="e.g., Madison Square Garden"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                    }}
                  />
                </Form.Control>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--ink-black)',
                  opacity: 0.7,
                  marginTop: '0.5rem',
                  fontFamily: 'var(--font-body)',
                }}>
                  Where will it happen? (leave blank if online/TBD)
                </p>
              </Form.Field>
            </>
          )}

          {/* Step 3: Tickets */}
          {openForm === "Mint" && currentStep === 3 && (
            <>
              <Form.Field name="ticketCount" style={{ display: "flex", flexDirection: "column" }}>
                <Form.Label style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "var(--ink-black)",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  Number of Tickets <span style={{ color: 'var(--ticket-pink)' }}>*</span>
                </Form.Label>
                <Form.Control asChild>
                  <TextField.Root
                    value={formData?.ticketCount}
                    onChange={(e) => updateFormData("ticketCount", e.target.value)}
                    size="3"
                    placeholder="e.g., 100"
                    type="number"
                    min="1"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                    }}
                  />
                </Form.Control>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--ink-black)',
                  opacity: 0.7,
                  marginTop: '0.5rem',
                  fontFamily: 'var(--font-body)',
                }}>
                  🎟️ Total capacity for your event
                </p>
              </Form.Field>

              <Form.Field name="price" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <Form.Label style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "var(--ink-black)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    Ticket Price <span style={{ color: 'var(--ticket-pink)' }}>*</span>
                  </Form.Label>
                  <span style={{
                    fontSize: '0.7rem',
                    color: 'white',
                    fontFamily: 'var(--font-body)',
                    background: 'var(--ticket-pink)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                    boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.15)',
                  }}>
                    IOTA
                  </span>
                </div>
                <Form.Control asChild>
                  <TextField.Root
                    value={formData.price}
                    onChange={(e) => updateFormData("price", e.target.value)}
                    size="3"
                    placeholder="10.00"
                    type="number"
                    min="0"
                    step="0.01"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                    }}
                  />
                </Form.Control>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--ink-black)',
                  opacity: 0.7,
                  marginTop: '0.5rem',
                  fontFamily: 'var(--font-body)',
                }}>
                  Price per ticket in IOTA tokens
                </p>
              </Form.Field>

              <Form.Field name="royaltyPercentage" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <Form.Label style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "var(--ink-black)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    Royalty %
                  </Form.Label>
                  <span style={{
                    fontSize: '0.7rem',
                    color: 'var(--ink-black)',
                    fontFamily: 'var(--font-body)',
                    background: 'var(--sticker-yellow)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                    boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.15)',
                  }}>
                    DEFAULT: 2%
                  </span>
                </div>
                <Form.Control asChild>
                  <TextField.Root
                    value={formData.royaltyPercentage || "2"}
                    onChange={(e) => updateFormData("royaltyPercentage", e.target.value)}
                    size="3"
                    placeholder="2"
                    type="number"
                    min="0"
                    max="100"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                    }}
                  />
                </Form.Control>
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--ink-black)',
                  opacity: 0.7,
                  marginTop: '0.5rem',
                  fontFamily: 'var(--font-body)',
                }}>
                  💰 Earn % from every resale transaction
                </p>
              </Form.Field>
            </>
          )}

          {/* Non-Mint Forms */}
          {openForm !== "Mint" && (
            <>
              {(openForm === "Transfer" || openForm === "Resell" || openForm === "Burn") && (
                <Form.Field name="nft" style={{ display: "flex", flexDirection: "column" }}>
                  <Form.Label style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "var(--ink-black)",
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    NFT ID
                  </Form.Label>
                  <Form.Control asChild>
                    <TextField.Root
                      value={formData.nft}
                      onChange={(e) => updateFormData("nft", e.target.value)}
                      size="3"
                      placeholder="NFT ID"
                    />
                  </Form.Control>
                </Form.Field>
              )}

              {openForm === "Transfer" && (
                <Form.Field name="recipient" style={{ display: "flex", flexDirection: "column" }}>
                  <Form.Label style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "var(--ink-black)",
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    Recipient Address
                  </Form.Label>
                  <Form.Control asChild>
                    <TextField.Root
                      value={formData.recipient}
                      onChange={(e) => updateFormData("recipient", e.target.value)}
                      size="3"
                      placeholder="0x..."
                    />
                  </Form.Control>
                </Form.Field>
              )}
            </>
          )}

          {/* Navigation Buttons */}
          <Box style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            marginTop: "1rem",
          }}>
            {openForm === "Mint" && currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                style={{
                  flex: 1,
                  padding: "0.875rem 1.5rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  background: "var(--paper-white)",
                  color: "var(--ink-black)",
                  border: "2px solid var(--ink-black)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  boxShadow: "var(--paper-shadow)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translate(-2px, -2px)";
                  e.currentTarget.style.boxShadow = "var(--paper-shadow-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translate(0, 0)";
                  e.currentTarget.style.boxShadow = "var(--paper-shadow)";
                }}
              >
                ← Back
              </button>
            )}

            {openForm === "Mint" && currentStep < totalSteps ? (
              <button
                type="button"
                disabled={!canProceed}
                onClick={() => setCurrentStep(currentStep + 1)}
                style={{
                  flex: 1,
                  padding: "0.875rem 1.5rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  background: canProceed ? "var(--stamp-blue)" : "var(--soft-gray)",
                  color: canProceed ? "white" : "var(--ink-black)",
                  border: `2px solid ${canProceed ? "var(--stamp-blue)" : "var(--ink-black)"}`,
                  borderRadius: "8px",
                  cursor: canProceed ? "pointer" : "not-allowed",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  boxShadow: "var(--paper-shadow)",
                  transition: "all 0.2s ease",
                  opacity: canProceed ? 1 : 0.6,
                }}
                onMouseEnter={(e) => {
                  if (canProceed) {
                    e.currentTarget.style.transform = "translate(-2px, -2px)";
                    e.currentTarget.style.boxShadow = "var(--paper-shadow-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (canProceed) {
                    e.currentTarget.style.transform = "translate(0, 0)";
                    e.currentTarget.style.boxShadow = "var(--paper-shadow)";
                  }
                }}
              >
                Next →
              </button>
            ) : (
              <button
                disabled={loading || (openForm === "Mint" && !canProceed)}
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
                  );
                }}
                style={{
                  flex: 1,
                  padding: "0.875rem 1.5rem",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  background: loading || (openForm === "Mint" && !canProceed) ? "var(--soft-gray)" : "var(--ticket-pink)",
                  color: loading || (openForm === "Mint" && !canProceed) ? "var(--ink-black)" : "white",
                  border: `2px solid ${loading || (openForm === "Mint" && !canProceed) ? "var(--ink-black)" : "var(--ticket-pink)"}`,
                  borderRadius: "8px",
                  cursor: loading || (openForm === "Mint" && !canProceed) ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  boxShadow: "var(--paper-shadow)",
                  transition: "all 0.2s ease",
                  opacity: loading || (openForm === "Mint" && !canProceed) ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading && !(openForm === "Mint" && !canProceed)) {
                    e.currentTarget.style.transform = "translate(-2px, -2px)";
                    e.currentTarget.style.boxShadow = "var(--paper-shadow-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translate(0, 0)";
                    e.currentTarget.style.boxShadow = "var(--paper-shadow)";
                  }
                }}
              >
                {loading ? "Submitting..." : openForm === "Mint" ? "Create Event 🚀" : "Submit"}
              </button>
            )}
          </Box>
        </Form.Root>
      </div>
    </div>
  );
};

export default InputForm;
