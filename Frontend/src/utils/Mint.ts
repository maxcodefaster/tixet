import { Transaction } from "@iota/iota-sdk/transactions";
import { formDataType } from "../type";
import { IotaClient } from "@iota/iota-sdk/client";
import { NavigateFunction } from "react-router-dom";
import { showTransactionSuccess } from "./explorerUtils";

export const mintTicket = (
  formData: formDataType,
  setFormData: React.Dispatch<React.SetStateAction<formDataType>>,
  packageId: any,
  signAndExecuteTransaction: any,
  client: IotaClient,
  navigate: NavigateFunction,
  setLoading: any,
) => {
  const tx = () => {
    const tx = new Transaction();
    tx.setGasBudget(50000000);

    tx.moveCall({
      target: `${packageId}::independent_ticketing_system_nft::create_event`,
      arguments: [
        tx.pure.string(formData.eventName as string),
        tx.pure.string(formData.eventId as string),
        tx.pure.u64(formData.eventdate as string),
        tx.pure.string(formData.venue as string),
        tx.pure.u64(formData.ticketCount as string),
        tx.pure.u64(formData.price as string),
        tx.pure.u64(formData.royaltyPercentage as string),
      ],
    });

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
              eventName: "",
              venue: "",
              ticketCount: "",
              eventdate: "",
              royaltyPercentage: "",
              packageCreator: "",
              totalSeat: "",
              price: "",
              nft: "",
              recipient: "",
              initiatedResell: "",
            });
            showTransactionSuccess(digest, "Event created successfully with all tickets!");
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
