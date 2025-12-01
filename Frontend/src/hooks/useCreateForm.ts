import { useEffect, useState } from "react";
import {
  useAccounts,
  useSignAndExecuteTransaction,
  useIotaClient,
} from "@iota/dapp-kit";

import { formDataType, NftFormDataType } from "../type";
import { useNetworkVariable } from "../networkConfig";

export const useCreateForm = () => {
  const packageId = useNetworkVariable("packageId" as never);
  const eventObject = useNetworkVariable("eventObject" as never);
  const [address] = useAccounts();
  useEffect(() => console.log("Address = ", address), [address]);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const client = useIotaClient();

  const [formData, setFormData] = useState<formDataType>({
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
    seatNumber: "",
    buyableTickets: "",
  });

  const [nftFormData, setNftFormData] = useState<NftFormDataType>({
    price: "",
    nft: "",
    recipient: "",
    initiatedResell: "",
  });

  const updateFormData = (key: keyof formDataType, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNftFormData = (key: keyof NftFormDataType, value: string) => {
    setNftFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFormData = () => {
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
      seatNumber: "",
      buyableTickets: "",
    });
  };

  const resetNftFormData = () => {
    setNftFormData({
      price: "",
      nft: "",
      recipient: "",
      initiatedResell: "",
    });
  };

  return {
    packageId,
    address,
    signAndExecuteTransaction,
    client,
    formData,
    updateFormData,
    resetFormData,
    eventObject,
    nftFormData,
    updateNftFormData,
    resetNftFormData,
  };
};
