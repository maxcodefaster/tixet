import { useParams } from "react-router-dom";
import NftForm from "./NftForm";
import { Flex, Heading } from "@radix-ui/themes";

export default function ResellTickets() {
  const { nft } = useParams();
  return (
    <>
      <Heading m={"5"}>
        Resell NFT: <span style={{ color: "blue" }}>{nft}</span>
      </Heading>
      <Flex direction={"column"} justify={"center"} align={"center"}>
        <NftForm openForm="Resell" nft={nft as string} />
      </Flex>
    </>
  );
}
