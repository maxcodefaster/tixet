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
  const [eventObjects, setEventObjects] = useState<string[]>([]);
  const packageId = useNetworkVariable("packageId" as never);
  const client = new IotaClient({
    url: getFullnodeUrl("testnet"),
  });
  const { address } = useCreateForm();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Effect to discover all EventObject instances
  useEffect(() => {
    if (!packageId || packageId === "<YOUR_PACKAGE_ID>") {
      console.warn("Package ID not configured in networkConfig.ts");
      setTickets([]);
      return;
    }

    console.log("Discovering all EventObject instances...");

    // Use queryObjects from the SDK to find all EventObject instances
    const structType = `${packageId}::independent_ticketing_system_nft::EventObject`;

    client.queryObjects({
      filter: {
        StructType: structType
      },
      options: {
        showContent: true,
        showType: true
      }
    })
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          const eventIds = response.data
            .map((obj: any) => obj.data?.objectId)
            .filter((id: any) => id);
          console.log(`✅ Found ${eventIds.length} events:`, eventIds);
          setEventObjects(eventIds);
        } else {
          console.warn("⚠️ No events found in queryObjects response");
          setEventObjects([]);
        }
      })
      .catch((error) => {
        console.error("❌ Error discovering events with SDK:", error);
        console.log("Trying JSON-RPC fallback...");

        // Fallback to JSON-RPC if SDK method fails
        const queryBody = {
          jsonrpc: "2.0",
          id: 1,
          method: "iotax_queryObjects",
          params: [{
            filter: {
              StructType: structType
            },
            options: {
              showContent: true,
              showType: true
            }
          }]
        };

        fetch("https://indexer.devnet.iota.cafe/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(queryBody),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.result?.data && Array.isArray(res.result.data)) {
              const eventIds = res.result.data
                .map((obj: any) => obj.data?.objectId)
                .filter((id: any) => id);
              console.log(`✅ Found ${eventIds.length} events via RPC:`, eventIds);
              setEventObjects(eventIds);
            } else {
              console.warn("⚠️ No events found, marketplace will be empty");
              setEventObjects([]);
            }
          })
          .catch((err) => {
            console.error("❌ Both SDK and RPC failed:", err);
            setEventObjects([]);
          });
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
      const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "iota_getObject",
        params: [eventId, { showContent: true }],
      };

      return fetch("https://indexer.devnet.iota.cafe/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.result?.data?.content?.fields?.available_tickets_to_buy) {
            const tickets = res.result.data.content.fields.available_tickets_to_buy;
            const eventInfo = {
              eventName: res.result.data.content.fields.event_name,
              eventId: res.result.data.content.fields.event_id,
              venue: res.result.data.content.fields.venue,
              eventDate: res.result.data.content.fields.event_date,
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
  }, [eventObjects, packageId, address?.address]);

  const handleBuyTicket = async (seatNumber: number, price: string, eventObjectId: string) => {
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
                window.location.reload();
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
                window.location.reload();
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
      {tickets && tickets.length > 0 ? (
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
                      : handleBuyTicket(fields.seat_number, fields.price, eventInfo?.eventObjectId)
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
