import { Transaction } from "@iota/iota-sdk/transactions";
import { formDataType } from "../type";
import { IotaClient } from "@iota/iota-sdk/client";
import { NavigateFunction } from "react-router-dom";
import { showTransactionSuccess } from "./explorerUtils";

export const resellTicket = (
  formData: formDataType,
  setFormData: React.Dispatch<React.SetStateAction<formDataType>>,
  packageId: any,
  signAndExecuteTransaction: any,
  client: IotaClient,
  navigate: NavigateFunction,
  setLoading: any,
  senderAddress?: string,
) => {
  const tx = () => {
    const tx = new Transaction();
    tx.setGasBudget(50000000);
    // Call resale function which returns InitiateResale object
    const [resaleObject] = tx.moveCall({
      target: `${packageId}::independent_ticketing_system_nft::resale`,
      arguments: [
        tx.object(formData.nft as string),
        tx.pure.u64(formData.price as string),
      ],
    });
    // Transfer the returned InitiateResale object to the sender
    // This makes it discoverable and allows the seller to cancel it later
    if (senderAddress) {
      tx.transferObjects([resaleObject], senderAddress);
    }
    return tx;
  };
  signAndExecuteTransaction(
    {
      transaction: tx(),
    },
    {
      onSuccess: ({ digest }: { digest: any }) => {
        client
          .waitForTransaction({ digest, options: { showEffects: true } })
          .then(() => {
            setFormData({
              coin: "",
              eventId: "",
              eventdate: "",
              royaltyPercentage: "",
              packageCreator: "",
              totalSeat: "",
              price: "",
              nft: "",
              recipient: "",
              initiatedResell: "",
            });
            showTransactionSuccess(digest, "Ticket listed for resale successfully!");
            setLoading(false);
            navigate("/");
          });
      },
      onError: (error: any) => {
        console.error("Failed to execute transaction", tx, error);
        setLoading(false);
        alert(`Error Occured: ${error.message}`);
      },
    },
  );
};
