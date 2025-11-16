import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId: "<YOUR_PACKAGE_ID>",
        creatorCap: "<YOUR_CREATORCAP_ADDRESS>",
        eventObject: "<YOUR_EVENTOBJECT_ADDRESS>",
        redemptionRegistry: "<YOUR_REDEMPTION_REGISTRY_ADDRESS>",

      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
