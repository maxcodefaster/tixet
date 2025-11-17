module independent_ticketing_system::independent_ticketing_system_nft {
    use std::string;
    use iota::coin::{Coin};
    use iota::iota::IOTA;
    use iota::event;
    use iota::table::{Self, Table};

    public struct TicketNFT has key, store {
        id: UID,
        name: string::String,
        creator: address,
        owner: address,
        event_id: string::String,
        seat_number: u64,
        event_date: u64,
        royalty_percentage: u64,
        price: u64
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
        event_name: string::String,
        event_id: string::String,
        event_date: u64,
        venue: string::String,
        total_capacity: u64,
        tickets_sold: u64,
        available_tickets_to_buy: vector<TicketNFT>
    }

    public struct RedemptionRegistry has key {
        id: UID,
        redeemed_tickets: Table<ID, RedemptionInfo>
    }

    public struct RedemptionInfo has store, drop {
        redeemed_by: address,
        ticket_owner: address,
        redeemed_at: u64,
        event_id: string::String,
        seat_number: u64
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

    #[error]
    const NOT_ENOUGH_FUNDS: vector<u8> = b"Insufficient funds for gas and NFT transfer";
    #[error]
    const INVALID_ROYALTY: vector<u8> = b"Royalty percentage must be between 0 and 100";
    #[error]
    const ALL_TICKETS_SOLD: vector<u8> = b"All tickets has been sold out";
    #[error]
    const INVALID_TICKET_TO_BUY: vector<u8> = b"Unable to buy ticket";
    #[error]
    const TICKET_ALREADY_REDEEMED: vector<u8> = b"This ticket has already been redeemed";
    #[error]
    const INVALID_TICKET_COUNT: vector<u8> = b"Ticket count must be greater than zero";

    fun init(ctx: &mut TxContext) {
        transfer::share_object(RedemptionRegistry {
            id: object::new(ctx),
            redeemed_tickets: table::new<ID, RedemptionInfo>(ctx)
        });
    }

    /// Create a new event with multiple tickets and list them on the marketplace
    public fun create_event(
        event_name: string::String,
        event_id: string::String,
        event_date: u64,
        venue: string::String,
        ticket_count: u64,
        ticket_price: u64,
        royalty_percentage: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(ticket_count > 0, INVALID_TICKET_COUNT);
        assert!(royalty_percentage >= 0 && royalty_percentage <= 100, INVALID_ROYALTY);

        let mut tickets = vector::empty<TicketNFT>();
        let ticket_name = string::utf8(b"Event Ticket NFT");

        // Create all tickets for this event
        let mut i = 1;
        while (i <= ticket_count) {
            let ticket = TicketNFT {
                id: object::new(ctx),
                name: ticket_name,
                creator: sender,
                owner: sender,
                event_id,
                seat_number: i,
                event_date,
                royalty_percentage,
                price: ticket_price
            };
            vector::push_back(&mut tickets, ticket);
            i = i + 1;
        };

        // Create and share the event object with all tickets
        transfer::share_object(EventObject {
            id: object::new(ctx),
            event_name,
            event_id,
            event_date,
            venue,
            total_capacity: ticket_count,
            tickets_sold: 0,
            available_tickets_to_buy: tickets
        });
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

        let royalty_fee = (nft1.price * nft1.royalty_percentage) / 100;
        assert!(coin.balance().value() > royalty_fee, NOT_ENOUGH_FUNDS);

        let new_coin = coin.split(royalty_fee, ctx);
        transfer::public_transfer(new_coin,nft1.creator);
        
        nft1.owner = sender;
        transfer::public_transfer(nft1,sender);

        let new_coin = coin.split(price1,ctx);

        transfer::public_transfer(new_coin,seller1);
        object::delete(id1);
    }

    public fun redeem_ticket(
        ticket: &TicketNFT,
        registry: &mut RedemptionRegistry,
        ctx: &mut TxContext
    ) {
        let ticket_id = object::uid_to_inner(&ticket.id);

        // Check if ticket already redeemed
        assert!(!table::contains(&registry.redeemed_tickets, ticket_id), TICKET_ALREADY_REDEEMED);

        let redeemer = tx_context::sender(ctx);
        let current_time = tx_context::epoch(ctx);

        // Add to redemption registry
        table::add(
            &mut registry.redeemed_tickets,
            ticket_id,
            RedemptionInfo {
                redeemed_by: redeemer,
                ticket_owner: ticket.owner,
                redeemed_at: current_time,
                event_id: ticket.event_id,
                seat_number: ticket.seat_number
            }
        );

        event::emit(TicketRedeemedSuccessfully {
            ticket_id,
            seat_number: ticket.seat_number,
            event_id: ticket.event_id,
            redeemed_by: redeemer,
            redeemed_at: current_time,
            message: string::utf8(b"Ticket redeemed successfully"),
        });
    }

    #[allow(unused_variable)]
    public fun burn(nft: TicketNFT, ctx: &mut TxContext) {
        let TicketNFT {
            id,
            name,
            creator,
            owner,
            event_id,
            seat_number,
            event_date,
            royalty_percentage,
            price
        } = nft;
        object::delete(id);
    }


    public fun is_redeemed(ticket_id: ID, registry: &RedemptionRegistry): bool {
        table::contains(&registry.redeemed_tickets, ticket_id)
    }

    public fun get_redemption_info(ticket_id: ID, registry: &RedemptionRegistry): &RedemptionInfo {
        table::borrow(&registry.redeemed_tickets, ticket_id)
    }

    public fun get_ticket_id(nft: &TicketNFT): ID {
        object::uid_to_inner(&nft.id)
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(ctx);
    }
}