import { Flex, Heading } from "@radix-ui/themes";
import { useParams } from "react-router-dom";
import NftForm from "./NftForm";

export default function TransferTickets() {
  const { nft } = useParams();
  return (
    <>
      <Heading m={"5"}>
        Transfer NFT: <span style={{ color: "blue" }}>{nft}</span>
      </Heading>
      <Flex direction={"column"} justify={"center"} align={"center"}>
        <NftForm openForm="Transfer" nft={nft as string} />
      </Flex>
    </>
  );
}
