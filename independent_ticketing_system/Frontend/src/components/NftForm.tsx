import * as Form from "@radix-ui/react-form";
import styles from "../style";
import Button from "./molecules/Button";
import { OpenFormState } from "../type";
import { Box, TextField, Text } from "@radix-ui/themes";
import { useCreateForm } from "../hooks/useCreateForm";
import submitNftForm from "../utils/submitNftForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NftForm = ({ openForm, nft }: { openForm: OpenFormState["openForm"],nft:string }) => {
  const {
    packageId,
    signAndExecuteTransaction,
    client,
    nftFormData,
    updateNftFormData,
    resetNftFormData,
    address,
  } = useCreateForm();
  const [loading,setLoading] = useState<boolean>(false);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [maxAllowedPrice, setMaxAllowedPrice] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string>("");

  useEffect(() => {
    if (openForm === "CancelResale") {
      updateNftFormData("initiatedResell", nft);
    } else {
      updateNftFormData("nft", nft);
    }

    // Fetch ticket details if in Resell mode
    if (openForm === "Resell") {
      client.getObject({
        id: nft,
        options: { showContent: true }
      }).then((response) => {
        if (response.data?.content && 'fields' in response.data.content) {
          const fields = response.data.content.fields as any;
          const price = parseInt(fields.price);
          setOriginalPrice(price);
          // MAX_RESALE_PERCENTAGE is 200 in the contract
          setMaxAllowedPrice((price * 200) / 100);
        }
      }).catch((error) => {
        console.error("Error fetching ticket details:", error);
      });
    }
  }, []);
  const navigate = useNavigate();
  return (
    <div style={styles.formContainer}>
      <h1 style={{ textAlign: "center" }}>{openForm}</h1>
      <Form.Root style={styles.formRoot}>
        <Form.Field name="" style={styles.formField}>
          <Form.Label style={styles.formLabel}>
            {openForm === "CancelResale" ? "Resale Listing ID" : "NFT ID"}
          </Form.Label>
          <Form.Control asChild>
            <TextField.Root
              disabled={true}
              value={nft}
              size="2"
              placeholder={openForm === "CancelResale" ? "Resale Listing ID" : "NFT Id"}
            />
          </Form.Control>
        </Form.Field>

        {openForm === "Resell" && (
          <>
            {originalPrice !== null && maxAllowedPrice !== null && (
              <Box style={{ marginBottom: "1rem", padding: "1rem", background: "rgba(0, 240, 255, 0.1)", borderRadius: "8px" }}>
                <Text size="2" style={{ display: "block", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: "700" }}>Original Price:</span>{" "}
                  <span style={{ color: "#00f0ff" }}>{originalPrice} IOTA</span>
                </Text>
                <Text size="2" style={{ display: "block" }}>
                  <span style={{ fontWeight: "700" }}>Max Allowed Price (200%):</span>{" "}
                  <span style={{ color: "#ff9500" }}>{maxAllowedPrice} IOTA</span>
                </Text>
              </Box>
            )}
            <Form.Field name="" style={styles.formField}>
              <Form.Label style={styles.formLabel}>Resale Price</Form.Label>
              <Form.Control asChild>
                <TextField.Root
                  value={nftFormData.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateNftFormData("price", value);

                    // Validate price
                    if (value && maxAllowedPrice !== null) {
                      const priceNum = parseFloat(value);
                      if (isNaN(priceNum)) {
                        setPriceError("Please enter a valid number");
                      } else if (priceNum <= 0) {
                        setPriceError("Price must be greater than 0");
                      } else if (priceNum > maxAllowedPrice) {
                        setPriceError(`Price cannot exceed ${maxAllowedPrice} IOTA (200% of original)`);
                      } else {
                        setPriceError("");
                      }
                    }
                  }}
                  size="2"
                  placeholder="Enter resale price in IOTA"
                />
              </Form.Control>
              {priceError && (
                <Text size="2" style={{ color: "#ff4444", marginTop: "0.25rem" }}>
                  {priceError}
                </Text>
              )}
            </Form.Field>
          </>
        )}

        {openForm === "Transfer" && <Form.Field name="" style={styles.formField}>
          <Form.Label style={styles.formLabel}>Recipient</Form.Label>
          <Form.Control asChild>
            <TextField.Root
              value={nftFormData.recipient}
              onChange={(e) => updateNftFormData("recipient", e.target.value)}
              size="2"
              placeholder="Recipient address"
            />
          </Form.Control>
        </Form.Field>}

        <Box style={{ display: "flex", justifyContent: "center" }}>
          <Button
            disabled={loading || (openForm === "Resell" && priceError !== "")}
            onClick={(e) =>{
              // Prevent submission if there's a validation error
              if (openForm === "Resell" && priceError !== "") {
                return;
              }
              setLoading(true)
              submitNftForm(
                e,
                openForm,
                nftFormData,
                resetNftFormData,
                packageId,
                signAndExecuteTransaction,
                client,
                navigate,
                setLoading,
                address?.address
              )
            }}
            title={"Submit"}
          />
        </Box>
      </Form.Root>
    </div>
  );
};

export default NftForm;
