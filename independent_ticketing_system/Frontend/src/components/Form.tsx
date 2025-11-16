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
    creatorCap,
    signAndExecuteTransaction,
    client,
    formData,
    updateFormData,
    resetFormData,
  } = useCreateForm();
  const [loading,setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  return (
    <div style={styles.formContainer}>
      <h1 style={{ textAlign: "center" }}>{openForm}</h1>
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
            <Form.Label style={styles.formLabel}>Event ID</Form.Label>
            <Form.Control asChild>
              <TextField.Root
                value={formData?.eventId}
                onChange={(e) => updateFormData("eventId", e.target.value)}
                size="2"
                placeholder="0x..."
              />
            </Form.Control>
            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(240, 244, 248, 0.6)',
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
            }}>
              The blockchain ID of your event object
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
            <Form.Label style={styles.formLabel}>Royalty Percentage</Form.Label>
            <Form.Control asChild>
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
            </Form.Control>
            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(240, 244, 248, 0.6)',
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
            }}>
              Percentage you'll earn from secondary sales (e.g., 2 for 2%)
            </p>
          </Form.Field>
        )}

        {openForm === "Mint" && (
          <Form.Field name="" style={styles.formField}>
            <Form.Label style={styles.formLabel}>Price (IOTA)</Form.Label>
            <Form.Control asChild>
              <TextField.Root
                value={formData.price}
                onChange={(e) => updateFormData("price", e.target.value)}
                size="2"
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
              />
            </Form.Control>
            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(240, 244, 248, 0.6)',
              marginTop: '0.5rem',
              fontFamily: 'var(--font-mono)',
            }}>
              Ticket price in IOTA tokens
            </p>
          </Form.Field>
        )}

        {(openForm === "Transfer" ||
          openForm === "Resell" ||
          openForm === "Burn" || openForm === "EnableTicketToBuy" || openForm === "WhiteListBuyer") && (
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

        {(openForm === "Transfer" || openForm === "Resell" || openForm === "WhiteListBuyer") && (
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
                creatorCap,
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
    </div>
  );
};

export default InputForm;
