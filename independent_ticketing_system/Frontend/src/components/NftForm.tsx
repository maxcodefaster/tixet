import * as Form from "@radix-ui/react-form";
import styles from "../style";
import Button from "./molecules/Button";
import { OpenFormState } from "../type";
import { Box, TextField } from "@radix-ui/themes";
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
  } = useCreateForm();
  const [loading,setLoading] = useState<boolean>(false);
  useEffect(() => updateNftFormData("nft",nft),[]);
  const navigate = useNavigate();
  return (
    <div style={styles.formContainer}>
      <h1 style={{ textAlign: "center" }}>{openForm}</h1>
      <Form.Root style={styles.formRoot}>
        <Form.Field name="" style={styles.formField}>
          <Form.Label style={styles.formLabel}>NFT ID</Form.Label>
          <Form.Control asChild>
            <TextField.Root
              disabled={true}
              value={nft}
              size="2"
              placeholder="NFT Id"
            />
          </Form.Control>
        </Form.Field>

        {openForm === "Resell" && (
          <>
            <Form.Field name="" style={styles.formField}>
              <Form.Label style={styles.formLabel}>Price (max 200% of original)</Form.Label>
              <Form.Control asChild>
                <TextField.Root
                  value={nftFormData.price}
                  onChange={(e) => updateNftFormData("price", e.target.value)}
                  size="2"
                  placeholder="Enter resale price in IOTA"
                />
              </Form.Control>
            </Form.Field>
            <p style={{ fontSize: "0.875rem", color: "#aaa", marginTop: "-0.5rem", marginBottom: "1rem" }}>
              Note: Resale price cannot exceed 200% of the original ticket price. Transaction will fail if price cap is exceeded.
            </p>
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
            disabled={loading}
            onClick={(e) =>{
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

export default NftForm;
