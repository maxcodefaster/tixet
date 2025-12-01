export interface ButtonProps {
    title:string,
    onClick: (e:any) => void,
    disabled: boolean
}

export interface ToggleFormProp {
    setOpenForm: React.Dispatch<React.SetStateAction<OpenFormState["openForm"]>>
}

export interface OpenFormState {
    openForm: "Mint" | "Burn" | "Transfer" | "Resell" | "BuyResell" | "BuyTicket" | "ViewQR" | "CancelResale" | "";
}

export interface formDataType {
    coin?:string,
    eventId?:string,
    eventName?:string,
    venue?:string,
    ticketCount?:string,
    eventdate?:string,
    royaltyPercentage?:string,
    packageCreator?:string,
    totalSeat?:string,
    price?:string,
    nft?:string,
    recipient?:string,
    initiatedResell?:string,
    seatNumber?:string,
    buyableTickets?:string
}

export interface OperationType{
    name: OpenFormState["openForm"],
    description: string,
    path?:string
}

export interface NftFormDataType {
    price:string,
    nft:string,
    recipient:string,
    initiatedResell?:string
}