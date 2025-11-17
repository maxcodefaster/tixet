import { Box, Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useNetworkVariable } from "../networkConfig";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import { useCreateForm } from "../hooks/useCreateForm";
import { Transaction } from "@iota/iota-sdk/transactions";
import { useSignAndExecuteTransaction } from "@iota/dapp-kit";

export default function AvailableTickets() {
  const [tickets, setTickets] = useState<null | any[]>(null);
  const [buying, setBuying] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [eventObjects, setEventObjects] = useState<string[]>([]);
  const [eventMetadataMap, setEventMetadataMap] = useState<Map<string, any>>(new Map());
  const packageId = useNetworkVariable("packageId" as never);
  const client = new IotaClient({
    url: getFullnodeUrl("devnet"),
  });
  const { address } = useCreateForm();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Function to refetch all tickets
  const refetchTickets = () => {
    setLoading(true);
    setTickets([]);
    // Trigger re-fetch by updating eventObjects
    const currentEvents = [...eventObjects];
    setEventObjects([]);
    setTimeout(() => setEventObjects(currentEvents), 0);
  };

  // Effect to discover all EventObject instances
  useEffect(() => {
    if (!packageId || packageId === "<YOUR_PACKAGE_ID>") {
      console.warn("Package ID not configured in networkConfig.ts");
      setTickets([]);
      return;
    }

    console.log("Discovering all EventObject instances using events...");

    // Use queryEvents to discover EventObject instances
    // Look for events emitted when EventObjects are created
    const eventType = `${packageId}::independent_ticketing_system_nft::EventCreated`;

    client.queryEvents({
      query: { MoveEventType: eventType },
      limit: 50
    })
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          // Extract event object IDs from EventCreated events
          const eventIds = res.data
            .map((event: any) => event.parsedJson?.event_object_id)
            .filter((id: any) => id);
          console.log(`✅ Found ${eventIds.length} events from creation events:`, eventIds);
          setEventObjects(eventIds);
        } else {
          console.warn("⚠️ No events found, marketplace will be empty");
          setEventObjects([]);
        }
      })
      .catch((err) => {
        console.error("❌ Error querying events:", err);
        console.log("ℹ️  Tip: Make sure your Move contract emits an EventCreated event");
        setEventObjects([]);
      });
  }, [packageId]);

  // Effect to fetch tickets from all discovered events
  useEffect(() => {
    if (eventObjects.length === 0) {
      setTickets([]);
      return;
    }

    console.log(`Fetching tickets from ${eventObjects.length} events...`);

    // Fetch tickets from all events
    const fetchPromises = eventObjects.map((eventId) => {
      return client.getObject({
        id: eventId,
        options: { showContent: true }
      })
        .then((res) => {
          if (res.data?.content?.dataType === 'moveObject' && res.data.content.fields?.available_tickets_to_buy) {
            const tickets = res.data.content.fields.available_tickets_to_buy;
            const eventInfo = {
              eventName: res.data.content.fields.event_name,
              eventId: res.data.content.fields.event_id,
              venue: res.data.content.fields.venue,
              eventDate: res.data.content.fields.event_date,
              eventObjectId: eventId
            };
            // Attach event info to each ticket
            return tickets.map((ticket: any) => ({
              ...ticket,
              eventInfo
            }));
          }
          return [];
        })
        .catch((error) => {
          console.error(`Error fetching tickets from event ${eventId}:`, error);
          return [];
        });
    });

    Promise.all(fetchPromises)
      .then((results) => {
        // Flatten all tickets from all events
        const allTickets = results.flat();
        console.log(`Found ${allTickets.length} total tickets across all events`);
        setTickets(allTickets);

        // Build event metadata map for resale ticket enrichment
        const metadataMap = new Map();
        results.forEach(ticketsFromEvent => {
          if (ticketsFromEvent.length > 0 && ticketsFromEvent[0].eventInfo) {
            const eventInfo = ticketsFromEvent[0].eventInfo;
            metadataMap.set(eventInfo.eventId, eventInfo);
          }
        });
        setEventMetadataMap(metadataMap);
        setLoading(false);
      });
  }, [eventObjects, packageId]);

  // Effect to fetch resale tickets after event metadata is available
  useEffect(() => {
    if (eventMetadataMap.size === 0 && eventObjects.length > 0) {
      // Wait for metadata to be populated
      return;
    }

    // Use queryEvents to discover resale listings
    const resaleEventType = `${packageId}::independent_ticketing_system_nft::ResaleInitiated`;

    client.queryEvents({
      query: { MoveEventType: resaleEventType },
      limit: 50
    })
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          console.log(`✅ Found ${res.data.length} resale listings from events`);

          // Fetch full resale object data for each resale listing
          const resalePromises = res.data.map((event: any) => {
            const resaleObjectId = event.parsedJson?.resale_object_id;
            if (!resaleObjectId) return Promise.resolve(null);

            return client.getObject({
              id: resaleObjectId,
              options: { showContent: true }
            })
              .then((resaleObj) => {
                if (resaleObj.data?.content?.dataType === 'moveObject') {
                  const fields = resaleObj.data.content.fields;
                  const nftFields = fields?.nft?.fields;
                  const eventId = nftFields?.event_id;

                  if (eventId && eventMetadataMap.has(eventId)) {
                    return {
                      data: resaleObj.data,
                      eventInfo: eventMetadataMap.get(eventId)
                    };
                  }
                  return { data: resaleObj.data };
                }
                return null;
              })
              .catch((err) => {
                console.error(`Error fetching resale object ${resaleObjectId}:`, err);
                return null;
              });
          });

          Promise.all(resalePromises).then((resaleTickets) => {
            const validResaleTickets = resaleTickets.filter((ticket) => ticket !== null);
            setTickets((prevTickets) =>
              prevTickets ? [...prevTickets, ...validResaleTickets] : [...validResaleTickets],
            );
          });
        } else {
          console.log("No resale listings found");
        }
      })
      .catch((error) => {
        console.error("Error fetching resale tickets:", error);
      });
  }, [eventMetadataMap, packageId]);

  const handleBuyTicket = async (seatNumber: number, eventObjectId: string) => {
    if (!address?.address) {
      alert("Please connect your wallet first!");
      return;
    }

    setBuying(seatNumber);

    try {
      // Fetch user's coin objects
      const coins = await client.getCoins({
        owner: address.address,
        coinType: "0x2::iota::IOTA",
      });

      if (!coins.data || coins.data.length === 0) {
        alert("No IOTA coins found in your wallet!");
        setBuying(null);
        return;
      }

      // Use the first coin with sufficient balance
      const coin = coins.data[0];

      const tx = new Transaction();
      tx.setGasBudget(50000000);
      tx.moveCall({
        target: `${packageId}::independent_ticketing_system_nft::buy_ticket`,
        arguments: [
          tx.object(coin.coinObjectId),
          tx.pure.u64(seatNumber),
          tx.object(eventObjectId),
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
                alert(`Ticket ${seatNumber} purchased successfully!`);
                setBuying(null);
                // Refresh the ticket list
                refetchTickets();
              });
          },
          onError: (error: any) => {
            console.error("Failed to buy ticket", error);
            setBuying(null);
            alert(`Error: ${error.message}`);
          },
        }
      );
    } catch (error: any) {
      console.error("Error fetching coins:", error);
      alert(`Error: ${error.message}`);
      setBuying(null);
    }
  };

  const handleBuyResale = async (resaleObjectId: string, seatNumber: number) => {
    if (!address?.address) {
      alert("Please connect your wallet first!");
      return;
    }

    setBuying(seatNumber);

    try {
      // Fetch user's coin objects
      const coins = await client.getCoins({
        owner: address.address,
        coinType: "0x2::iota::IOTA",
      });

      if (!coins.data || coins.data.length === 0) {
        alert("No IOTA coins found in your wallet!");
        setBuying(null);
        return;
      }

      // Use the first coin with sufficient balance
      const coin = coins.data[0];

      const tx = new Transaction();
      tx.setGasBudget(50000000);
      tx.moveCall({
        target: `${packageId}::independent_ticketing_system_nft::buy_resale`,
        arguments: [
          tx.object(coin.coinObjectId),
          tx.object(resaleObjectId),
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
                alert(`Resale ticket purchased successfully!`);
                setBuying(null);
                // Refresh the ticket list
                refetchTickets();
              });
          },
          onError: (error: any) => {
            console.error("Failed to buy resale ticket", error);
            setBuying(null);
            alert(`Error: ${error.message}`);
          },
        }
      );
    } catch (error: any) {
      console.error("Error fetching coins:", error);
      alert(`Error: ${error.message}`);
      setBuying(null);
    }
  };

  return (
    <Flex mt={"5"} justify={"center"}>
      {loading ? (
        <Flex justify={"center"} mt={"5"}>
          <Heading align={"center"}>Loading marketplace...</Heading>
        </Flex>
      ) : tickets && tickets.length > 0 ? (
        tickets.map((ticket, index) => {
          // Detect if this is a resale ticket (has data.content structure from getOwnedObjects)
          const isResale = ticket.data?.content?.fields?.nft;
          const fields = isResale ? ticket.data.content.fields.nft.fields : (ticket.fields || ticket);
          const resalePrice = isResale ? ticket.data.content.fields.price : fields.price;
          const resaleObjectId = isResale ? ticket.data.objectId : null;
          const eventInfo = ticket.eventInfo; // Event info attached to regular tickets

          return (
            <Box width="500px" key={index}>
              <Card size="3" style={{ background: "#1e1e1e" }}>
                <Flex direction={"column"} gap="3">
                  {isResale && (
                    <Text size={"2"} weight="bold" style={{ color: "#ff006e" }}>
                      🔄 RESALE TICKET
                    </Text>
                  )}
                  {eventInfo && (
                    <Text size={"4"} weight="bold" style={{ color: "#ccff00" }}>
                      🎪 {eventInfo.eventName}
                    </Text>
                  )}
                  <Text size={"5"}>{fields.name}</Text>
                  {eventInfo && (
                    <>
                      <Text size={"2"} style={{ color: "#aaa" }}>
                        📍 {eventInfo.venue}
                      </Text>
                      <Text size={"2"} style={{ color: "#aaa" }}>
                        📅 Event Date: {eventInfo.eventDate}
                      </Text>
                    </>
                  )}
                  <Text size={"3"}>Seat: {fields.seat_number}</Text>
                  <Text size={"2"}>Owner: {fields.owner}</Text>
                  <Text size={"2"}>Event ID: {fields.event_id}</Text>
                  <Text size={"2"} weight="bold" style={{ color: "#0ff" }}>
                    Price: {resalePrice} IOTA
                  </Text>
                  <Button
                    onClick={() => isResale
                      ? handleBuyResale(resaleObjectId!, fields.seat_number)
                      : handleBuyTicket(fields.seat_number, eventInfo?.eventObjectId)
                    }
                    disabled={buying === fields.seat_number}
                    style={{
                      background: buying === fields.seat_number ? "#666" : isResale ? "#ff006e" : "#0101ff",
                      cursor: buying === fields.seat_number ? "wait" : "pointer",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    {buying === fields.seat_number
                      ? "Buying..."
                      : `Buy ${isResale ? 'Resale ' : ''}Ticket - ${resalePrice} IOTA`
                    }
                  </Button>
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
