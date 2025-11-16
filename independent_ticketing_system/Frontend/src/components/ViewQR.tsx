import { Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
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
    url: getFullnodeUrl("testnet"),
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
      <Flex justify={"center"} mt={"5"}>
        <LoadingBar />
      </Flex>
    );
  }

  if (!ticketData) {
    return (
      <Flex justify={"center"} mt={"5"}>
        <Heading>Ticket not found</Heading>
      </Flex>
    );
  }

  const ticketFields = ticketData.content?.fields;
  const isRedeemed = ticketFields?.is_redeemed || false;

  // Create QR code data with ticket information
  const qrData = JSON.stringify({
    ticketId: nft,
    eventId: ticketFields?.event_id,
    seatNumber: ticketFields?.seat_number,
    packageId: packageId,
  });

  return (
    <Flex direction={"column"} justify={"center"} align={"center"} mt={"5"}>
      <Heading mb={"5"}>Ticket QR Code</Heading>
      <Card size="4" style={{ background: "#1e1e1e", padding: "2rem" }}>
        <Flex direction={"column"} align={"center"} gap={"4"}>
          <Box style={{ background: "white", padding: "1rem", borderRadius: "8px" }}>
            <QRCodeSVG
              value={qrData}
              size={300}
              level="H"
              includeMargin={true}
            />
          </Box>

          <Flex direction={"column"} gap={"2"} width={"100%"}>
            <Text size={"4"} weight={"bold"} align={"center"}>
              {ticketFields?.name}
            </Text>
            <Text size={"3"}>
              <span style={{ fontWeight: "700" }}>Event ID:</span> {ticketFields?.event_id}
            </Text>
            <Text size={"3"}>
              <span style={{ fontWeight: "700" }}>Seat Number:</span> {ticketFields?.seat_number}
            </Text>
            <Text size={"3"}>
              <span style={{ fontWeight: "700" }}>Event Date:</span> {ticketFields?.event_date}
            </Text>
            <Text size={"3"}>
              <span style={{ fontWeight: "700" }}>Price:</span> {ticketFields?.price}
            </Text>
            {isRedeemed && (
              <Box
                style={{
                  background: "#ff4444",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  marginTop: "0.5rem",
                }}
              >
                <Text size={"3"} weight={"bold"} align={"center"} style={{ color: "white" }}>
                  ⚠️ TICKET ALREADY REDEEMED
                </Text>
              </Box>
            )}
          </Flex>
        </Flex>
      </Card>
      <Text size={"2"} mt={"3"} style={{ color: "#888" }}>
        Scan this QR code at the event entrance to redeem your ticket
      </Text>
    </Flex>
  );
}
