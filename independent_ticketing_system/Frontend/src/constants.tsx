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
    description: "View QR",
    path:"viewQR",
  },
  {
    name: "Burn",
    description: "Burn",
    path:"burnTicket",
  },
  {
      name: "Resell",
      description: "Resell Ticket",
      path:"resellTicket",
    },
  {
      name: "Transfer",
      description: "Transfer Ticket",
      path:"transferTicket",
    },
]