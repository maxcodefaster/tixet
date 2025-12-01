import { Box, Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useNetworkVariable } from "../networkConfig";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import { useCreateForm } from "../hooks/useCreateForm";
import { Transaction } from "@iota/iota-sdk/transactions";
import { useSignAndExecuteTransaction } from "@iota/dapp-kit";
import { showTransactionSuccess, getExplorerObjectUrl } from "../utils/explorerUtils";

export default function AvailableTickets() {
  const [tickets, setTickets] = useState<null | any[]>(null);
  const [buying, setBuying] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [eventObjects, setEventObjects] = useState<string[]>([]);
  const [, setEventMetadataMap] = useState<Map<string, any>>(new Map());
  const [, setResaleFetched] = useState<boolean>(false);
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
    setResaleFetched(false);
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

    const eventType = `${packageId}::independent_ticketing_system_nft::EventCreated`;

    client.queryEvents({
      query: { MoveEventType: eventType },
      limit: 50
    })
      .then((res) => {
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
        setEventObjects([]);
      });
  }, [packageId]);

  // Effect to fetch tickets from all events
  useEffect(() => {
    if (eventObjects.length === 0) {
      setTickets([]);
      return;
    }

    const fetchPromises = eventObjects.map((eventId) => {
      return client.getObject({
        id: eventId,
        options: { showContent: true }
      })
        .then((res) => {
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
        const allTickets = results.flat();
        setTickets(allTickets);

        const metadataMap = new Map();
        results.forEach((ticketsFromEvent: any) => {
          if (ticketsFromEvent.length > 0 && ticketsFromEvent[0].eventInfo) {
            const eventInfo = ticketsFromEvent[0].eventInfo;
            metadataMap.set(eventInfo.eventId, eventInfo);
          }
        });
        setEventMetadataMap(metadataMap);
        fetchResaleTickets(metadataMap);
      });
  }, [eventObjects, packageId]);

  const fetchResaleTickets = (metadataMap: Map<string, any>) => {
    setResaleFetched(true);
    const resaleEventType = `${packageId}::independent_ticketing_system_nft::ResaleInitiated`;

    client.queryEvents({
      query: { MoveEventType: resaleEventType },
      limit: 50
    })
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
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

                  if (eventId && metadataMap.has(eventId)) {
                    return {
                      data: resaleObj.data,
                      eventInfo: metadataMap.get(eventId)
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
            setTickets((prevTickets) => {
              const current = prevTickets || [];
              const newTickets = validResaleTickets.filter(newTicket => {
                const newId = newTicket.data?.objectId;
                if (!newId) return true; 
                return !current.some(existing => existing.data?.objectId === newId);
              });

              if (newTickets.length === 0) {
                return current;
              }
              return [...current, ...newTickets];
            });
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching resale tickets:", error);
        setLoading(false);
      });
  };

  const handleBuyTicket = async (seatNumber: number, eventObjectId: string) => {
    if (!address?.address) {
      alert("Please connect your wallet first!");
      return;
    }
    setBuying(seatNumber);
    try {
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
      const [paymentCoin] = tx.splitCoins(tx.gas, [price]);
      tx.moveCall({
        target: `${packageId}::independent_ticketing_system_nft::buy_ticket`,
        arguments: [
          paymentCoin,
          tx.pure.u64(seatNumber),
          tx.object(eventObjectId),
        ],
      });
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: ({ digest }: { digest: any }) => {
            client
              .waitForTransaction({ digest, options: { showEffects: true } })
              .then(() => {
                showTransactionSuccess(digest, `Ticket ${seatNumber} purchased successfully!`);
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
      const royaltyPercentage = nft.fields?.royalty_percentage || nft.royalty_percentage || 0;
      const royaltyFee = Math.floor((price * royaltyPercentage) / 100);
      const totalRequired = price + royaltyFee;
      const tx = new Transaction();
      tx.setGasBudget(50000000);
      const [paymentCoin] = tx.splitCoins(tx.gas, [totalRequired]);
      tx.moveCall({
        target: `${packageId}::independent_ticketing_system_nft::buy_resale`,
        arguments: [
          paymentCoin,
          tx.object(resaleObjectId),
        ],
      });
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: ({ digest }: { digest: any }) => {
            client
              .waitForTransaction({ digest, options: { showEffects: true } })
              .then(() => {
                showTransactionSuccess(digest, `Resale ticket purchased successfully!`);
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
          <Heading align={"center"} style={{ color: "var(--ink-black)", fontFamily: "var(--font-display)" }}>
            Loading marketplace...
          </Heading>
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
            const isResale = ticket.data?.content?.fields?.nft;
            const fields = isResale ? ticket.data.content.fields.nft.fields : (ticket.fields || ticket);
            const resalePrice = isResale ? ticket.data.content.fields.price : fields.price;
            const resaleObjectId = isResale ? ticket.data.objectId : null;
            const eventInfo = ticket.eventInfo;

            return (
              <Box width="400px" key={index} style={{ position: "relative" }}>
                {/* WRAPPER: Handles Hover & Layout */}
                <div
                  style={{
                    position: "relative",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    filter: "drop-shadow(4px 4px 0px rgba(0, 0, 0, 0.15))", 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translate(-2px, -2px)";
                    e.currentTarget.style.filter = "drop-shadow(6px 6px 0px rgba(0, 0, 0, 0.15))";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translate(0, 0)";
                    e.currentTarget.style.filter = "drop-shadow(4px 4px 0px rgba(0, 0, 0, 0.15))";
                  }}
                >
                  {/* TAPE / BADGE: Sits OUTSIDE the masked card */}
                  {!isResale && (
                    <div style={{
                      position: "absolute",
                      top: "-12px",
                      right: "20px",
                      width: "50px",
                      height: "22px",
                      background: "var(--sticker-yellow)",
                      opacity: 0.9,
                      transform: "rotate(-3deg)",
                      zIndex: 10,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                    }} />
                  )}

                  {isResale && (
                    <div style={{
                      position: "absolute",
                      top: "-10px",
                      right: "12px",
                      background: "var(--ticket-pink)",
                      color: "white",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      transform: "rotate(-5deg)",
                      zIndex: 10,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                      🔄 Resale
                    </div>
                  )}

                  {/* THE CARD: Contains the content and the jagged edge mask */}
                  <Card
                    size="3"
                    className="ticket-card-edge"
                  >
                    <Flex direction={"column"} gap="2">
                      {eventInfo && (
                        <Text
                          size={"4"}
                          weight="bold"
                          style={{
                            color: "var(--ink-black)",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          🎪 {eventInfo.eventName}
                        </Text>
                      )}
                      <Text size={"5"} weight="bold" style={{
                        color: "var(--ink-black)",
                        fontFamily: "var(--font-display)",
                      }}>
                        {fields.name}
                      </Text>
                      {eventInfo && (
                        <>
                          <Text size={"2"} style={{ color: "var(--ink-black)" }}>
                            📍 <span style={{ fontWeight: "600" }}>{eventInfo.venue}</span>
                          </Text>
                          <Text size={"2"} style={{ color: "var(--ink-black)" }}>
                            📅 <span style={{ fontWeight: "600" }}>{formatDate(eventInfo.eventDate)}</span>
                          </Text>
                        </>
                      )}
                      <Text size={"3"} style={{ color: "var(--ink-black)" }}>
                        <span style={{ fontWeight: "700" }}>Seat:</span> {fields.seat_number}
                      </Text>
                      <Text size={"2"} style={{ color: "var(--ink-black)", fontSize: "0.75rem" }}>
                        <span style={{ fontWeight: "700" }}>Event ID:</span> {fields.event_id}
                      </Text>
                      {isResale && resaleObjectId ? (
                        <Text size={"2"}>
                          <a
                            href={getExplorerObjectUrl(resaleObjectId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "var(--stamp-blue)",
                              textDecoration: "none",
                              fontWeight: "600",
                            }}
                          >
                            🔍 View Resale on Explorer
                          </a>
                        </Text>
                      ) : eventInfo?.eventObjectId ? (
                        <Text size={"2"}>
                          <a
                            href={getExplorerObjectUrl(eventInfo.eventObjectId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "var(--stamp-blue)",
                              textDecoration: "none",
                              fontWeight: "600",
                            }}
                          >
                            🔍 View Event on Explorer
                          </a>
                        </Text>
                      ) : null}
                      <Text
                        size={"3"}
                        weight="bold"
                        style={{
                          color: isResale ? "var(--ticket-pink)" : "var(--stamp-blue)",
                          fontSize: "1.2rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        {resalePrice} IOTA
                      </Text>
                      <Button
                        onClick={() => isResale
                          ? handleBuyResale(resaleObjectId!, fields.seat_number)
                          : handleBuyTicket(fields.seat_number, eventInfo?.eventObjectId)
                        }
                        disabled={buying === fields.seat_number}
                        radius="full"
                        style={{
                          background: buying === fields.seat_number
                            ? "var(--soft-gray)"
                            : isResale ? "var(--ticket-pink)" : "var(--stamp-blue)",
                          color: buying === fields.seat_number ? "var(--ink-black)" : "white",
                          cursor: buying === fields.seat_number ? "wait" : "pointer",
                          padding: "0.75rem 1.5rem",
                          border: `2px solid ${buying === fields.seat_number ? "var(--ink-black)" : (isResale ? "var(--ticket-pink)" : "var(--stamp-blue)")}`,
                          boxShadow: "2px 2px 0px rgba(0, 0, 0, 0.15)",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          fontSize: "0.8rem",
                          letterSpacing: "0.05em",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        onMouseEnter={(e) => {
                          if (buying !== fields.seat_number) {
                            e.currentTarget.style.transform = "translate(-1px, -1px)";
                            e.currentTarget.style.boxShadow = "3px 3px 0px rgba(0, 0, 0, 0.15)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (buying !== fields.seat_number) {
                            e.currentTarget.style.transform = "translate(0, 0)";
                            e.currentTarget.style.boxShadow = "2px 2px 0px rgba(0, 0, 0, 0.15)";
                          }
                        }}
                      >
                        {buying === fields.seat_number
                          ? "Buying..."
                          : `Buy ${isResale ? 'Resale ' : ''}Ticket`
                        }
                      </Button>
                    </Flex>
                  </Card>
                </div>
              </Box>
            );
          })}
        </Flex>
      ) : (
        <Flex justify={"center"} mt={"5"}>
          <Heading align={"center"} style={{ color: "var(--ink-black)", fontFamily: "var(--font-display)" }}>
            No Tickets Available Now!
          </Heading>
        </Flex>
      )}
    </Box>
  );
}