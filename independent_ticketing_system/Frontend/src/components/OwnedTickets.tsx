import { Box, Button, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useNetworkVariable } from "../networkConfig";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import { useCreateForm } from "../hooks/useCreateForm";
import { Link } from "react-router-dom";
import { nftOperations, resaleOperations } from "../constants";
import LoadingBar from "./molecules/LoadingBar";
import ParseAddress from "../utils/ParseAddress";
import CopyToClipboard from "./molecules/CopyToClipboard";

export default function OwnedObjects() {
  const [tickets, setTickets] = useState<null | any[]>(null);
  const [resaleListings, setResaleListings] = useState<null | any[]>(null);
  const packageId = useNetworkVariable("packageId" as never);
  const [loading, setLoading] = useState<boolean>(true);
  const client = new IotaClient({
    url: getFullnodeUrl("devnet"),
  });
  const { address } = useCreateForm();
  const fetch = () => {
    if (address && !tickets) {
      // Fetch TicketNFTs
      client
        .getOwnedObjects({
          owner: address.address,
          filter: {
            StructType: `${packageId}::independent_ticketing_system_nft::TicketNFT`,
          },
          options: {
            showContent: true,
          },
        })
        .then((res) => res.data)
        .then((res) => {
          setTickets(res);

          // Also fetch InitiateResale objects (active resale listings)
          return client.getOwnedObjects({
            owner: address.address,
            filter: {
              StructType: `${packageId}::independent_ticketing_system_nft::InitiateResale`,
            },
            options: {
              showContent: true,
            },
          });
        })
        .then((res) => res.data)
        .then((res) => {
          setResaleListings(res);
          setLoading(false);
        });
    }
  };
  useEffect(() => {
    fetch();
  }, []);
  useEffect(() => {
    if (address === undefined) {
      setTickets(null);
      setResaleListings(null);
      setLoading(false);
    } else {
      fetch();
    }
  }, [address]);
  if (loading)
    return (
      <Flex justify={"center"}>
        <LoadingBar />
      </Flex>
    );

  return (
    <Flex mt={"5"} direction={"column"} justify={"center"} gap={"5"}>
      {/* Display regular tickets */}
      {tickets && tickets.length > 0 ? (
        <>
          <Heading align={"center"} size={"6"} style={{ color: "#00f0ff" }}>Your Tickets</Heading>
          <Grid
            columns="3"
            gap="3"
            rows="repeat(2)"
            width="auto"
            overflowX={"hidden"}
            mx={"2"}
          >
            {tickets.map((ticket, index) => (
              <Box key={index}>
                <Card size="3" style={{ background: "#1e1e1e" }}>
                  <Flex direction={"column"}>
                    <Text size={"4"} weight={"bold"}>
                      {ticket.data.content.fields.name}
                    </Text>
                    <Text size={"3"}>
                      <span style={{ fontWeight: "700" }}>Seat:</span>{" "}
                      {ticket.data.content.fields.seat_number}
                    </Text>
                    <Flex>
                      <Text size={"3"}>
                        <span style={{ fontWeight: "700" }}>Object ID:</span>{" "}
                        {ParseAddress(ticket.data.content.fields.id.id)}
                      </Text>
                      <CopyToClipboard
                        text={ticket.data.content.fields.id.id}
                      />
                    </Flex>
                    <Text size={"2"}>
                      <span style={{ fontWeight: "700" }}>Owner:</span>
                      <a
                        target="blank"
                        href={`https://explorer.rebased.iota.org/address/${ticket.data.content.fields.owner}?network=testnet`}
                      >
                        {ParseAddress(ticket.data.content.fields.owner)}
                      </a>
                    </Text>
                    <Text size={"2"}>
                      <span style={{ fontWeight: "700" }}>Event Id:</span>{" "}
                      {ticket.data.content.fields.event_id}
                    </Text>
                    <Text size={"2"}>
                      <span style={{ fontWeight: "700" }}>Event Date:</span>{" "}
                      {ticket.data.content.fields.event_date}
                    </Text>
                    <Text size={"2"}>
                      <span style={{ fontWeight: "700" }}>Price:</span>{" "}
                      {ticket.data.content.fields.price}
                    </Text>
                    <Flex
                      direction={"row"}
                      justify={"center"}
                      gap={"5"}
                      mt={"3"}
                    >
                      {nftOperations.map((value, index) => (
                        <Link
                          to={`/ownedTickets/${value.path}/${ticket.data.content.fields.id.id}`}
                          key={index}
                        >
                          <Button
                            radius="none"
                            style={{ background: "#0101ff" }}
                          >
                            {value.description}
                          </Button>
                        </Link>
                      ))}
                    </Flex>
                  </Flex>
                </Card>
              </Box>
            ))}
          </Grid>
        </>
      ) : (
        <Flex justify={"center"} mt={"5"}>
          <Heading align={"center"}>No Tickets Available Now!</Heading>
        </Flex>
      )}

      {/* Display active resale listings */}
      {resaleListings && resaleListings.length > 0 && (
        <>
          <Heading align={"center"} size={"6"} style={{ color: "#ff9500", marginTop: "2rem" }}>
            Your Active Resale Listings
          </Heading>
          <Grid
            columns="3"
            gap="3"
            rows="repeat(2)"
            width="auto"
            overflowX={"hidden"}
            mx={"2"}
          >
            {resaleListings.map((listing, index) => {
              const nft = listing.data.content.fields.nft;
              return (
                <Box key={index}>
                  <Card size="3" style={{ background: "#2a1e1e", border: "2px solid #ff9500" }}>
                    <Flex direction={"column"}>
                      <Text size={"4"} weight={"bold"} style={{ color: "#ff9500" }}>
                        🏷️ Listed for Resale
                      </Text>
                      <Text size={"4"} weight={"bold"}>
                        {nft.name}
                      </Text>
                      <Text size={"3"}>
                        <span style={{ fontWeight: "700" }}>Seat:</span>{" "}
                        {nft.seat_number}
                      </Text>
                      <Text size={"2"}>
                        <span style={{ fontWeight: "700" }}>Event Id:</span>{" "}
                        {nft.event_id}
                      </Text>
                      <Text size={"2"}>
                        <span style={{ fontWeight: "700" }}>Event Date:</span>{" "}
                        {nft.event_date}
                      </Text>
                      <Text size={"2"}>
                        <span style={{ fontWeight: "700" }}>Original Price:</span>{" "}
                        {nft.price} IOTA
                      </Text>
                      <Text size={"3"} style={{ color: "#ff9500", fontWeight: "bold" }}>
                        <span style={{ fontWeight: "700" }}>Resale Price:</span>{" "}
                        {listing.data.content.fields.price} IOTA
                      </Text>
                      <Flex>
                        <Text size={"2"}>
                          <span style={{ fontWeight: "700" }}>Listing ID:</span>{" "}
                          {ParseAddress(listing.data.content.fields.id.id)}
                        </Text>
                        <CopyToClipboard
                          text={listing.data.content.fields.id.id}
                        />
                      </Flex>
                      <Flex
                        direction={"row"}
                        justify={"center"}
                        gap={"5"}
                        mt={"3"}
                      >
                        {resaleOperations.map((value, opIndex) => (
                          <Link
                            to={`/ownedTickets/${value.path}/${listing.data.content.fields.id.id}`}
                            key={opIndex}
                          >
                            <Button
                              radius="none"
                              style={{ background: "#ff4500" }}
                            >
                              {value.description}
                            </Button>
                          </Link>
                        ))}
                      </Flex>
                    </Flex>
                  </Card>
                </Box>
              );
            })}
          </Grid>
        </>
      )}
    </Flex>
  );
}
