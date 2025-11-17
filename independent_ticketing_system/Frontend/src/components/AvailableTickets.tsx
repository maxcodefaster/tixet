import { Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useNetworkVariable } from "../networkConfig";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import { useCreateForm } from "../hooks/useCreateForm";

export default function AvailableTickets() {
  const [tickets, setTickets] = useState<null | any[]>(null);
  const eventOjbect = useNetworkVariable(
    "eventObject" as never
  );
  const packageId = useNetworkVariable("packageId" as never);
  const client = new IotaClient({
    url: getFullnodeUrl("testnet"),
  });
  const { address } = useCreateForm();
  useEffect(() => {
    // Check if eventOjbect is properly configured
    if (!eventOjbect || eventOjbect === "<YOUR_EVENTOBJECT_ADDRESS>") {
      console.warn("Event object not configured in networkConfig.ts");
      setTickets([]);
      return;
    }

    // Fetch event tickets using JSON-RPC
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "iota_getObject",
      params: [eventOjbect, { showContent: true }],
    };
    fetch("https://indexer.devnet.iota.cafe/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.result?.data?.content?.fields?.available_tickets_to_buy) {
          setTickets(res.result.data.content.fields.available_tickets_to_buy);
        } else if (res.error) {
          console.error("Error fetching event tickets:", res.error);
          setTickets([]);
        } else {
          console.warn("No tickets found in event object");
          setTickets([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching event tickets:", error);
        setTickets([]);
      });

    // Fetch resale tickets owned by the user
    if (address?.address) {
      client
        .getOwnedObjects({
          owner: address.address,
          filter: {
            StructType: `${packageId}::independent_ticketing_system_nft::InitiateResale`,
          },
          options: {
            showContent: true,
          },
        })
        .then((res) => res.data)
        .then((res) =>
          setTickets((prevTickets) =>
            prevTickets ? [...prevTickets, ...res] : [...res],
          ),
        )
        .catch((error) => {
          console.error("Error fetching resale tickets:", error);
        });
    }
  }, [eventOjbect, packageId, address?.address]);
  return (
    <Flex mt={"5"} justify={"center"}>
      {tickets && tickets.length > 0 ? (
        tickets.map((ticket, index) => {
          const fields = ticket.fields || ticket;
          return (
            <Box width="500px" key={index}>
              <Card size="3" style={{ background: "#1e1e1e" }}>
                <Flex direction={"column"}>
                  <Text size={"5"}>{fields.name}</Text>
                  <Text size={"3"}>Seat: {fields.seat_number}</Text>
                  <Text size={"2"}>Owner: {fields.owner}</Text>
                  <Text size={"2"}>Event ID: {fields.event_id}</Text>
                  <Text size={"2"}>Date: {fields.event_date}</Text>
                  <Text size={"2"}>Price: {fields.price}</Text>
                </Flex>
              </Card>
            </Box>
          );
        })
      ) : (
        <Flex justify={"center"} mt={"5"}>
          <Heading align={"center"}>No Tickets Available Now!</Heading>
        </Flex>
      )}
    </Flex>
  );
}
