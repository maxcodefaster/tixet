import { OperationType } from "./type";

export const operations: OperationType[] = [
  {
    name: "Burn",
    description: "Burn",
  },
  {
    name: "BuyResell",
    description: "Buy Resell ticket",
  },
  {
    name: "BuyTicket",
    description: "Buy Ticket",
  },
  {
    name: "Resell",
    description: "Resell Ticket",
  },
  {
    name: "Transfer",
    description: "Transfer Ticket",
  },
];

export const nftOperations: OperationType[] = [
  {
    name: "ViewQR",
    description: "QR",
    path:"viewQR",
  },
  {
      name: "Resell",
      description: "Resell",
      path:"resellTicket",
    },
  {
      name: "Transfer",
      description: "Transfer",
      path:"transferTicket",
  },
  {
    name: "Burn",
    description: "Burn",
    path:"burnTicket",
  }
]

export const resaleOperations: OperationType[] = [
  {
    name: "CancelResale",
    description: "Cancel Resale",
    path:"cancelResale",
  },
]