import InputForm from "./Form";
import { Flex } from "@radix-ui/themes";
export default function Mint() {
  return (
    <Flex justify={"center"}>
      <InputForm openForm={"Mint"} />
    </Flex>
  );
}
