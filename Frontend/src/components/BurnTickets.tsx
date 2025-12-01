import { Flex, Heading } from "@radix-ui/themes";
import NftForm from "./NftForm";
import { useParams } from "react-router-dom";

export default function BurnTickets() {
  const { nft } = useParams();
  return (
    <>
      <Heading m={"5"}>
        Burn NFT: <span style={{ color: "blue" }}>{nft}</span>
      </Heading>
      <Flex direction={"column"} justify={"center"} align={"center"}>
        <NftForm openForm="Burn" nft={nft as string} />
      </Flex>
    </>
  );
}
