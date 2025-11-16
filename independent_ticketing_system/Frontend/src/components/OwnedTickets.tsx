import { Box, Button, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useNetworkVariable } from "../networkConfig";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import { useCreateForm } from "../hooks/useCreateForm";
import { Link } from "react-router-dom";
import { nftOperations } from "../constants";
import LoadingBar from "./molecules/LoadingBar";
import ParseAddress from "../utils/ParseAddress";
import CopyToClipboard from "./molecules/CopyToClipboard";

export default function OwnedObjects() {
  const [tickets, setTickets] = useState<null | any[]>(null);
  const packageId = useNetworkVariable("packageId" as never);
  const [loading, setLoading] = useState<boolean>(true);
  const client = new IotaClient({
    url: getFullnodeUrl("testnet"),
  });
  const { address } = useCreateForm();
  const fetch = () => {
    if (address && !tickets) {
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
    <Flex mt={"5"} direction={"column"} justify={"center"}>
      {tickets && tickets.length > 0 ? (
        <>
          <Flex direction={"row"} ml={"9"} mb={"5"}>
            <Heading size={"3"}>Note: </Heading>
            <Text size={"3"}>
              Ensure that the recipient user is whitelisted before allowing the
              resale of the ticket.
            </Text>
          </Flex>
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
    </Flex>
  );
}
