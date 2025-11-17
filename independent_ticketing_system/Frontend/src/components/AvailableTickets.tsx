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
  const eventObject = useNetworkVariable(
    "eventObject" as never
  );
  const packageId = useNetworkVariable("packageId" as never);
  const client = new IotaClient({
    url: getFullnodeUrl("testnet"),
  });
  const { address } = useCreateForm();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  useEffect(() => {
    // Check if eventObject is properly configured
    if (!eventObject || eventObject === "<YOUR_EVENTOBJECT_ADDRESS>") {
      console.warn("Event object not configured in networkConfig.ts");
      setTickets([]);
      return;
    }

    // Fetch event tickets using JSON-RPC
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "iota_getObject",
      params: [eventObject, { showContent: true }],
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
  }, [eventObject, packageId, address?.address]);

  const handleBuyTicket = async (seatNumber: number, price: string) => {
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
          tx.object(eventObject),
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

          return (
            <Box width="500px" key={index}>
              <Card size="3" style={{ background: "#1e1e1e" }}>
                <Flex direction={"column"} gap="3">
                  {isResale && (
                    <Text size={"2"} weight="bold" style={{ color: "#ff006e" }}>
                      🔄 RESALE TICKET
                    </Text>
                  )}
                  <Text size={"5"}>{fields.name}</Text>
                  <Text size={"3"}>Seat: {fields.seat_number}</Text>
                  <Text size={"2"}>Owner: {fields.owner}</Text>
                  <Text size={"2"}>Event ID: {fields.event_id}</Text>
                  <Text size={"2"}>Date: {fields.event_date}</Text>
                  <Text size={"2"} weight="bold" style={{ color: "#0ff" }}>
                    Price: {resalePrice} IOTA
                  </Text>
                  <Button
                    onClick={() => isResale
                      ? handleBuyResale(resaleObjectId!, fields.seat_number)
                      : handleBuyTicket(fields.seat_number, fields.price)
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
