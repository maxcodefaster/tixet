import { getFullnodeUrl } from "@iota/iota-sdk/client";
import { createNetworkConfig } from "@iota/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        packageId:
          "0x6f71ccdee36fe4f3ee59af20c9635feba8bac5df85ca5f0dde7eda2883ec4ef0",
        redemptionRegistry:
          "0xad8cabd9579e64fa79cf3d47d04745c3673374cde26e55b35c318c1abb6a485e",
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
