import { useParams } from "react-router-dom";
import NftForm from "./NftForm";
import { Flex, Heading } from "@radix-ui/themes";

export default function CancelResale() {
  const { initiatedResale } = useParams();
  return (
    <>
      <Heading m={"5"}>
        Cancel Resale Listing: <span style={{ color: "blue" }}>{initiatedResale}</span>
      </Heading>
      <Flex direction={"column"} justify={"center"} align={"center"}>
        <NftForm openForm="CancelResale" nft={initiatedResale as string} />
      </Flex>
    </>
  );
}
