import { Box, Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@iota/dapp-kit";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import { Transaction } from "@iota/iota-sdk/transactions";
import { useNetworkVariable } from "../networkConfig";
import LoadingBar from "./molecules/LoadingBar";
import { showTransactionSuccess } from "../utils/explorerUtils";

export default function ScanQR() {
  const [scannedData, setScannedData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [scannerActive, setScannerActive] = useState<boolean>(true);

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const packageId = useNetworkVariable("packageId" as never);
  const redemptionRegistry = useNetworkVariable("redemptionRegistry" as never);

  const client = new IotaClient({
    url: getFullnodeUrl("devnet"),
  });

  const handleScan = async (result: any) => {
    if (result && result[0]?.rawValue) {
      setScannerActive(false);
      try {
        const data = JSON.parse(result[0].rawValue);
        setScannedData(data);
        setError("");

        // Fetch ticket details
        const ticketData = await client.getObject({
          id: data.ticketId,
          options: {
            showContent: true,
          },
        });

        setTicketDetails(ticketData.data);
      } catch (e: any) {
        setError("Invalid QR code format");
        console.error("Error parsing QR code:", e);
        setScannerActive(true);
      }
    }
  };

  const handleRedeem = () => {
    if (!currentAccount) {
      alert("Please connect your wallet first");
      return;
    }

    if (!scannedData?.ticketId) {
      alert("No ticket scanned");
      return;
    }

    setLoading(true);

    const tx = new Transaction();
    tx.setGasBudget(50000000);
    tx.moveCall({
      target: `${packageId}::independent_ticketing_system_nft::redeem_ticket`,
      arguments: [
        tx.object(scannedData.ticketId),
        tx.object(redemptionRegistry as string)
      ],
    });

    signAndExecuteTransaction(
      {
        transaction: tx,
      },
      {
        onSuccess: ({ digest }: { digest: any }) => {
          client
            .waitForTransaction({ digest, options: { showEffects: true } })
            .then(() => {
              showTransactionSuccess(digest, "Ticket redeemed successfully!");
              setLoading(false);
              setScannedData(null);
              setTicketDetails(null);
              setScannerActive(true);
            })
            .catch((err) => {
              console.error("Transaction wait error:", err);
              setLoading(false);
              alert("Error waiting for transaction");
            });
        },
        onError: (error: any) => {
          console.error("Failed to redeem ticket", error);
          setLoading(false);
          alert(`Error: ${error.message}`);
        },
      }
    );
  };

  const handleReset = () => {
    setScannedData(null);
    setTicketDetails(null);
    setError("");
    setScannerActive(true);
  };

  return (
    <Flex direction={"column"} justify={"center"} align={"center"} mt={"5"}>
      <Heading mb={"5"}>Scan Ticket QR Code</Heading>

      {!currentAccount && (
        <Card size="3" style={{ background: "#ff9800", marginBottom: "1rem" }}>
          <Text size={"3"} weight={"bold"}>
            Please connect your wallet to redeem tickets
          </Text>
        </Card>
      )}

      {loading ? (
        <LoadingBar />
      ) : (
        <>
          {scannerActive && !scannedData && (
            <Box style={{ width: "100%", maxWidth: "500px" }}>
              <Scanner
                onScan={handleScan}
                styles={{
                  container: {
                    width: "100%",
                  },
                }}
              />
              {error && (
                <Text size={"3"} style={{ color: "red", marginTop: "1rem" }}>
                  {error}
                </Text>
              )}
            </Box>
          )}

          {scannedData && ticketDetails && (
            <Card size="4" style={{ background: "#1e1e1e", padding: "2rem" }}>
              <Flex direction={"column"} gap={"3"}>
                <Heading size={"4"}>Scanned Ticket Details</Heading>

                {ticketDetails.content?.fields && (
                  <>
                    <Text size={"3"}>
                      <span style={{ fontWeight: "700" }}>Event ID:</span>{" "}
                      {ticketDetails.content.fields.event_id}
                    </Text>
                    <Text size={"3"}>
                      <span style={{ fontWeight: "700" }}>Seat Number:</span>{" "}
                      {ticketDetails.content.fields.seat_number}
                    </Text>
                    <Text size={"3"}>
                      <span style={{ fontWeight: "700" }}>Event Date:</span>{" "}
                      {ticketDetails.content.fields.event_date}
                    </Text>
                    <Text size={"3"}>
                      <span style={{ fontWeight: "700" }}>Owner:</span>{" "}
                      {ticketDetails.content.fields.owner}
                    </Text>

                    <Box
                      style={{
                        background: "#44ff44",
                        padding: "1rem",
                        borderRadius: "4px",
                        marginTop: "1rem",
                      }}
                    >
                      <Text
                        size={"4"}
                        weight={"bold"}
                        align={"center"}
                        style={{ color: "#000" }}
                      >
                        ✓ TICKET SCANNED - Click to Redeem
                      </Text>
                      <Text size={"2"} align={"center"} style={{ color: "#000", marginTop: "0.5rem" }}>
                        (Smart contract will prevent double redemption)
                      </Text>
                    </Box>

                    <Flex gap={"3"} mt={"3"}>
                      <Button
                        onClick={handleRedeem}
                        disabled={!currentAccount}
                        style={{ background: "#0101ff" }}
                      >
                        Redeem Ticket
                      </Button>
                      <Button onClick={handleReset} variant="outline">
                        Scan Another
                      </Button>
                    </Flex>
                  </>
                )}
              </Flex>
            </Card>
          )}
        </>
      )}
    </Flex>
  );
}
