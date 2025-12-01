import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        packageId:
          "0x8ecd3babf33a67eadebeea15f429b732f44e0ed895eb9d07a8e6467ea1037743",
        redemptionRegistry:
          "0x061e4c7f161fc6f79514d8cb37735f503835027fd1a3ff4f075d092217959d2a",
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId: "<YOUR_PACKAGE_ID>",
        redemptionRegistry: "<YOUR_REDEMPTION_REGISTRY_ADDRESS>",
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
