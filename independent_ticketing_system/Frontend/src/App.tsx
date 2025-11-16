import { ConnectButton } from "@iota/dapp-kit";
import { Box, Flex, Heading } from "@radix-ui/themes";
import { Button as RadixButton } from "@radix-ui/themes";
import { Link, Outlet } from "react-router-dom";
import { useNetworkVariable } from "./networkConfig";
import { useEffect, useState } from "react";
import { useCreateForm } from "./hooks/useCreateForm";

function App() {
  const creatorCap = useNetworkVariable("creatorCap" as never);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const { address } = useCreateForm();
  useEffect(() => {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "iota_getObject",
      params: [creatorCap, { showContent: true }],
    };
    fetch("https://indexer.testnet.iota.cafe/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((res) => {
        setIsCreator(address.address == res.result.data.content.fields.address);
      });
  }, [address]);
  return (
    <Box>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        align={"center"}
        style={{
          borderBottom: "1px solid var(--gray-a2)",
          background: "#000000",
        }}
      >
        <Box>
          <Link to={"/"} style={{ textDecoration: "none", color: "inherit" }}>
            <Heading>Independent Ticketing System</Heading>
          </Link>
        </Box>

        <Flex align={"center"}>
          {isCreator && address && (
            <Link to={"/mint"}>
              <RadixButton
                mr={"5"}
                radius="none"
                style={{ background: "#0101ff" }}
              >
                Mint Tickets
              </RadixButton>
            </Link>
          )}
          {!isCreator && address && (
            <Link to={"/AvailableTickets"}>
              <RadixButton
                mr={"5"}
                radius="none"
                style={{ background: "#0101ff" }}
              >
                Buy Available Tickets
              </RadixButton>
            </Link>
          )}
          {address && (
            <Link to={"/scanQR"}>
              <RadixButton
                mr={"5"}
                radius="none"
                style={{ background: "#ff6b00" }}
              >
                Scan QR Code
              </RadixButton>
            </Link>
          )}

          <ConnectButton />
        </Flex>
      </Flex>
      <Box style={{ background: "#111111" }} mx={"5"}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default App;
