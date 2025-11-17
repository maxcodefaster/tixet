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

  // Function to format date from "DDMMYYYY" to readable format
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    const day = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = dateStr.substring(4, 8);
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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
        console.log(res)
        if (res.data && Array.isArray(res.data)) {
          const eventIds = res.data
            .map((obj: any) => obj.parsedJson?.event_object_id)
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
          console.log(res)
          const content = res.data?.content as any;
          if (content?.fields?.available_tickets_to_buy) {
            const tickets = content.fields.available_tickets_to_buy;
            const eventInfo = {
              eventName: content.fields.event_name,
              eventId: content.fields.event_id,
              venue: content.fields.venue,
              eventDate: content.fields.event_date,
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
        results.forEach((ticketsFromEvent: any) => {
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
        console.log(res)
        if (res.data && Array.isArray(res.data)) {
          console.log(`✅ Found ${res.data.length} resale listings`);

          // Fetch full resale object data for each resale listing
          const resalePromises = res.data.map((event: any) => {
            const resaleObjectId = event.parsedJson?.resale_object_id;
            if (!resaleObjectId) return Promise.resolve(null);

            return client.getObject({
              id: resaleObjectId,
              options: { showContent: true }
            })
              .then((resaleObj) => {
                const content = resaleObj.data?.content as any;
                if (content?.dataType === 'moveObject') {
                  const fields = content.fields;
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
    // Fetch the event object to get ticket price
    const eventData = await client.getObject({
      id: eventObjectId,
      options: { showContent: true }
    });

    const content = eventData.data?.content as any;
    const tickets = content?.fields?.available_tickets_to_buy || [];
    const ticket = tickets.find((t: any) => 
      t.fields?.seat_number === seatNumber || t.seat_number === seatNumber
    );

    if (!ticket) {
      alert("Ticket not found!");
      setBuying(null);
      return;
    }

    const price = ticket.fields?.price || ticket.price;

    const tx = new Transaction();
    tx.setGasBudget(50000000);
    
    // ✅ FIX: Split coins from gas for payment
    const [paymentCoin] = tx.splitCoins(tx.gas, [price]);
    
    tx.moveCall({
      target: `${packageId}::independent_ticketing_system_nft::buy_ticket`,
      arguments: [
        paymentCoin,  // ✅ Use the split coin
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
    console.error("Error buying ticket:", error);
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
    // Fetch resale object to get price and royalty info
    const resaleData = await client.getObject({
      id: resaleObjectId,
      options: { showContent: true }
    });

    const content = resaleData.data?.content as any;
    const price = content?.fields?.price;
    const nft = content?.fields?.nft;
    
    if (!price || !nft) {
      alert("Could not fetch resale details!");
      setBuying(null);
      return;
    }

    // Calculate total including royalty
    const royaltyPercentage = nft.fields?.royalty_percentage || nft.royalty_percentage || 0;
    const royaltyFee = Math.floor((price * royaltyPercentage) / 100);
    const totalRequired = price + royaltyFee;

    const tx = new Transaction();
    tx.setGasBudget(50000000);
    
    // ✅ FIX: Split coins from gas for payment
    const [paymentCoin] = tx.splitCoins(tx.gas, [totalRequired]);
    
    tx.moveCall({
      target: `${packageId}::independent_ticketing_system_nft::buy_resale`,
      arguments: [
        paymentCoin,  // ✅ Use the split coin
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
    console.error("Error buying resale ticket:", error);
    alert(`Error: ${error.message}`);
    setBuying(null);
  }
};

  return (
    <Box mt={"5"}>
      {loading ? (
        <Flex justify={"center"} mt={"5"}>
          <Heading align={"center"}>Loading marketplace...</Heading>
        </Flex>
      ) : tickets && tickets.length > 0 ? (
        <Flex 
          direction="row" 
          wrap="wrap" 
          gap="4" 
          justify="center"
          style={{ maxWidth: "1400px", margin: "0 auto" }}
        >
          {tickets.map((ticket, index) => {
            // Detect if this is a resale ticket (has data.content structure from getOwnedObjects)
            const isResale = ticket.data?.content?.fields?.nft;
            const fields = isResale ? ticket.data.content.fields.nft.fields : (ticket.fields || ticket);
            const resalePrice = isResale ? ticket.data.content.fields.price : fields.price;
            const resaleObjectId = isResale ? ticket.data.objectId : null;
            const eventInfo = ticket.eventInfo; // Event info attached to regular tickets

            return (
              <Box width="400px" key={index}>
                <Card size="3" style={{ background: "#1e1e1e", height: "100%" }}>
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
                          📅 {formatDate(eventInfo.eventDate)}
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
          })}
        </Flex>
      ) : (
        <Flex justify={"center"} mt={"5"}>
          <Heading align={"center"}>No Tickets Available Now!</Heading>
        </Flex>
      )}
    </Box>
  );
}