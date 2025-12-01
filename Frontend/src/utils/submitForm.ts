import { IotaClient } from "@iota/iota-sdk/client";
import { formDataType, OpenFormState } from "../type";
import { burnTicket } from "./Burn";
import { buyResellTicket } from "./buyResell";
import { mintTicket } from "./Mint";
import { resellTicket } from "./resell";
import { tranferTicket } from "./Transfer";
import { buyTicket } from "./buyTicket";
import { NavigateFunction } from "react-router-dom";

export default (
  e: any,
  openForm: OpenFormState["openForm"],
  formData: formDataType,
  resetFormData: () => void,
  packageId: any,
  eventObject: any,
  signAndExecuteTransaction: any,
  client: IotaClient,
  navigate: NavigateFunction,
  setLoading: any,
) => {
  e.preventDefault();
  switch (openForm) {
    case "Mint":
      mintTicket(
        formData,
        resetFormData,
        packageId,
        signAndExecuteTransaction,
        client,
        navigate,
        setLoading,
      );
      break;
    case "Burn":
      burnTicket(
        formData,
        resetFormData,
        packageId,
        signAndExecuteTransaction,
        client,
        navigate,
        setLoading,
      );
      break;
    case "BuyResell":
      buyResellTicket(
        formData,
        resetFormData,
        packageId,
        signAndExecuteTransaction,
        client,
        navigate,
        setLoading,
      );
      break;
    case "Resell":
      resellTicket(
        formData,
        resetFormData,
        packageId,
        signAndExecuteTransaction,
        client,
        navigate,
        setLoading,
      );
      break;
    case "Transfer":
      tranferTicket(
        formData,
        resetFormData,
        packageId,
        signAndExecuteTransaction,
        client,
        navigate,
        setLoading,
      );
      break;
    case "BuyTicket":
      buyTicket(
        formData,
        resetFormData,
        packageId,
        eventObject,
        signAndExecuteTransaction,
        client,
        navigate,
        setLoading,
      );
      break;
    default:
      break;
  }
};
