module independent_ticketing_system::independent_ticketing_system_nft {
    use std::string;
    use iota::coin::{Coin};
    use iota::iota::IOTA; 
    use iota::event;

    public struct TicketNFT has key, store {
        id: UID,
        name: string::String,
        creator: address,
        owner: address,
        event_id: string::String,
        seat_number: u64,
        event_date: u64,
        royalty_percentage: u64,
        price: u64,
        whitelisted_addresses: vector<address>,
        is_redeemed: bool,
        redeemed_by: address,
        redeemed_at: u64
    }

    public struct CreatorCap has key {
        id: UID
    }

    public struct InitiateResale has key, store {
        id: UID,
        nft:TicketNFT,
        seller:address,
        buyer:address,
        price:u64,
    }

    public struct EventObject has key, store {
        id: UID,
        available_tickets_to_buy: vector<TicketNFT>,
        total_seat: u64
    }

    public struct TicketBoughtSuccessfully has copy, drop {
        name: string::String,
        seat_number:u64,
        owner:address,
        event_date:u64,
        message: string::String,
    }

    public struct TicketRedeemedSuccessfully has copy, drop {
        ticket_id: ID,
        seat_number: u64,
        event_id: string::String,
        redeemed_by: address,
        redeemed_at: u64,
        message: string::String,
    }

    // Error codes
    #[error]
    const NOT_ENOUGH_FUNDS: vector<u8> = b"Insufficient funds for gas and NFT transfer";
    #[error]
    const INVALID_ROYALTY: vector<u8> = b"Royalty percentage must be between 0 and 100";
    #[error]
    const ALL_TICKETS_SOLD: vector<u8> = b"All tickets has been sold out";
    #[error]
    const NOT_AUTHORISED_TO_BUY: vector<u8> = b"Recipient is not whitelisted";
    #[error]
    const INVALID_TICKET_TO_BUY: vector<u8> = b"Unable to buy ticket";
    #[error]
    const INVALID_TOTAL_SEAT: vector<u8> = b"Value should be greater than zero";
    #[error]
    const TICKET_ALREADY_REDEEMED: vector<u8> = b"This ticket has already been redeemed";

    fun init(ctx: &mut TxContext) {
        let sender = ctx.sender();
        transfer::transfer(CreatorCap{
            id: object::new(ctx)
        },sender);

        transfer::share_object(EventObject {
            id: object::new(ctx),
            available_tickets_to_buy: vector::empty<TicketNFT>(),
            total_seat: 300
        })
    }

    #[allow(lint(self_transfer))]
    public fun mint_ticket(
        _: &CreatorCap,
        event_id: string::String,
        event_date: u64,
        royalty_percentage :u64,
        event_object: &mut EventObject,
        price: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(event_object.total_seat>0,ALL_TICKETS_SOLD);
        assert!(royalty_percentage >= 0 && royalty_percentage <= 100, INVALID_ROYALTY);


        let name: string::String = string::utf8(b"Event Ticket NFT");

        let nft_count = event_object.total_seat;

        let mut whitelisted_addresses = vector::empty<address>();
        vector::push_back(&mut whitelisted_addresses, sender);

        let nft = TicketNFT {
            id: object::new(ctx),
            name,
            creator: sender,
            owner: sender,
            event_id,
            seat_number:event_object.total_seat,
            event_date,
            royalty_percentage,
            price,
            whitelisted_addresses,
            is_redeemed: false,
            redeemed_by: @0x0,
            redeemed_at: 0
        };

        set_total_seat(nft_count-1,event_object);

        transfer::public_transfer(nft,sender);
    }

    public fun enable_ticket_to_buy(
        _: &CreatorCap, 
        nft:TicketNFT,
        event_object: &mut EventObject
    ) {
        vector::push_back(&mut event_object.available_tickets_to_buy,nft);
    }

    public fun transfer_ticket(
        mut nft: TicketNFT,
        recipient: address
    ) {

        nft.owner = recipient;
        transfer::public_transfer(nft, recipient);
    }

    #[allow(unused_variable)]
    public fun resale(
        mut nft: TicketNFT,
        updated_price:u64,
        recipient:address,
        ctx: &mut TxContext
    ) {

        let sender = tx_context::sender(ctx);
        assert!(vector::contains(&nft.whitelisted_addresses, &recipient),NOT_AUTHORISED_TO_BUY);
        
        nft.price = updated_price;

        let initiate_resale = InitiateResale {
            id: object::new(ctx),
            seller:sender,
            buyer:recipient,
            price:updated_price,
            nft
        };
        transfer::public_transfer(initiate_resale,recipient);
    }

    #[allow(lint(self_transfer))]
    public fun buy_ticket(
    coin: &mut Coin<IOTA>,
    seat_number: u64,
    event_object: &mut EventObject,
    ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let mut i = 0;
        let length = vector::length(&event_object.available_tickets_to_buy);

        while (i < length) {
            let current_nft = vector::borrow(&event_object.available_tickets_to_buy, i);
            if (&current_nft.seat_number == seat_number) {
                let mut deleted_nft = vector::remove(&mut event_object.available_tickets_to_buy, i);

                // Removed whitelist check - anyone can now buy tickets from the marketplace

                let payment = coin.split(deleted_nft.price, ctx);
                transfer::public_transfer(payment, deleted_nft.creator);

                deleted_nft.owner = sender;

                event::emit(TicketBoughtSuccessfully {
                    name: deleted_nft.name,
                    seat_number:deleted_nft.seat_number,
                    owner:deleted_nft.owner,
                    event_date:deleted_nft.event_date,
                    message: string::utf8(b"NFT bought successfully"),
                });

                transfer::public_transfer(deleted_nft, sender);
                break
            };
            i = i + 1;
        };
        assert!(i <length,INVALID_TICKET_TO_BUY);
    }

    #[allow(lint(self_transfer))]
    public fun buy_resale(coin: &mut Coin<IOTA>, initiated_resale: InitiateResale,ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let InitiateResale {id: id1,seller: seller1,buyer: _buyer1,price: price1,nft: mut nft1} = initiated_resale;

        let royalty_fee = (nft1.royalty_percentage/nft1.price)*100;
        assert!(coin.balance().value()>royalty_fee,NOT_ENOUGH_FUNDS);

        let new_coin = coin.split(royalty_fee, ctx);
        transfer::public_transfer(new_coin,nft1.creator);
        
        nft1.owner = sender;
        transfer::public_transfer(nft1,sender);

        let new_coin = coin.split(price1,ctx);

        transfer::public_transfer(new_coin,seller1);
        object::delete(id1);
    }

    public fun redeem_ticket(nft: &mut TicketNFT, ctx: &mut TxContext) {
        assert!(!nft.is_redeemed, TICKET_ALREADY_REDEEMED);

        let redeemer = tx_context::sender(ctx);
        let current_time = tx_context::epoch(ctx);

        nft.is_redeemed = true;
        nft.redeemed_by = redeemer;
        nft.redeemed_at = current_time;

        event::emit(TicketRedeemedSuccessfully {
            ticket_id: object::uid_to_inner(&nft.id),
            seat_number: nft.seat_number,
            event_id: nft.event_id,
            redeemed_by: redeemer,
            redeemed_at: current_time,
            message: string::utf8(b"Ticket redeemed successfully"),
        });
    }

    #[allow(unused_variable)]
    public fun burn(nft: TicketNFT, ctx: &mut TxContext) {

        let TicketNFT { id,
            name,
            creator,
            owner,
            event_id,
            seat_number,
            event_date,
            royalty_percentage,
            price,
            whitelisted_addresses,
            is_redeemed,
            redeemed_by,
            redeemed_at } = nft;
        object::delete(id);
    }

    fun set_total_seat(value:u64,event_object: &mut EventObject) {
        assert!(value>0,INVALID_TOTAL_SEAT);
        event_object.total_seat = value;
    }

    #[allow(unused_variable)]
    public fun whitelist_buyer(user:address,nft: &mut TicketNFT) {
        vector::push_back(&mut nft.whitelisted_addresses,user);
    }

    // Getter functions for redemption
    public fun is_redeemed(nft: &TicketNFT): bool {
        nft.is_redeemed
    }

    public fun get_redeemed_by(nft: &TicketNFT): address {
        nft.redeemed_by
    }

    public fun get_redeemed_at(nft: &TicketNFT): u64 {
        nft.redeemed_at
    }

    public fun get_ticket_id(nft: &TicketNFT): ID {
        object::uid_to_inner(&nft.id)
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(ctx);
    }
}