// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@iota/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { darkTheme, IotaClientProvider, WalletProvider } from "@iota/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import App from "./App.tsx";
import { networkConfig } from "./networkConfig.ts";
import AvailableTickets from "./components/AvailableTickets.tsx";
import Home from "./components/Home.tsx";
import Mint from "./components/Mint.tsx";
import ResellTickets from "./components/ResellTickets.tsx";
import TransferTickets from "./components/TransferTickets.tsx";
import BurnTickets from "./components/BurnTickets.tsx";
import ViewQR from "./components/ViewQR.tsx";
import ScanQR from "./components/ScanQR.tsx";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/AvailableTickets",
        element: <AvailableTickets />,
      },
      {
        path: "",
        element: <Home />,
      },
      {
        path: "/mint",
        element: <Mint />,
      },
      {
        path: "/ownedTickets/resellTicket/:nft",
        element: <ResellTickets />,
      },
      {
        path: "/ownedTickets/transferTicket/:nft",
        element: <TransferTickets />,
      },
      {
        path: "/ownedTickets/burnTicket/:nft",
        element: <BurnTickets />,
      },
      {
        path: "/ownedTickets/viewQR/:nft",
        element: <ViewQR />,
      },
      {
        path: "/scanQR",
        element: <ScanQR />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme appearance="dark">
      <QueryClientProvider client={queryClient}>
        <IotaClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider autoConnect theme={darkTheme}>
            <RouterProvider router={router} />
          </WalletProvider>
        </IotaClientProvider>
      </QueryClientProvider>
    </Theme>
  </React.StrictMode>,
);
