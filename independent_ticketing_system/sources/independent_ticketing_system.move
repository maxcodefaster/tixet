module independent_ticketing_system::independent_ticketing_system_nft {
    use std::string;
    use iota::coin::{Coin};
    use iota::iota::IOTA;
    use iota::event;
    use iota::table::{Self, Table};
    use iota::dynamic_field;

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
        available_seat_numbers: vector<u64>  // Stores only seat numbers; actual tickets stored as dynamic fields
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

    public struct EventCreated has copy, drop {
        event_object_id: ID,
        event_name: string::String,
        event_id: string::String,
        event_date: u64,
        venue: string::String,
        total_capacity: u64,
        creator: address,
    }

    public struct ResaleInitiated has copy, drop {
        resale_object_id: ID,
        ticket_id: ID,
        seller: address,
        price: u64,
        original_price: u64,
    }

    /// Maximum resale price as percentage of original price (200 = 200% = 2x markup)
    const MAX_RESALE_PERCENTAGE: u64 = 200;

    #[error]
    const NOT_ENOUGH_FUNDS: vector<u8> = b"Insufficient funds for gas and NFT transfer";
    #[error]
    const INVALID_ROYALTY: vector<u8> = b"Royalty percentage must be between 0 and 100";
    #[error]
    const INVALID_TICKET_TO_BUY: vector<u8> = b"Unable to buy ticket";
    #[error]
    const TICKET_ALREADY_REDEEMED: vector<u8> = b"This ticket has already been redeemed";
    #[error]
    const INVALID_TICKET_COUNT: vector<u8> = b"Ticket count must be greater than zero";
    #[error]
    const RESALE_PRICE_TOO_HIGH: vector<u8> = b"Resale price exceeds maximum allowed markup";
    #[error]
    const UNAUTHORIZED_CANCEL: vector<u8> = b"Only the seller can cancel this listing";

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

        let mut seat_numbers = vector::empty<u64>();
        let ticket_name = string::utf8(b"Event Ticket NFT");

        // Create the event object first
        let mut event_object = EventObject {
            id: object::new(ctx),
            event_name,
            event_id,
            event_date,
            venue,
            total_capacity: ticket_count,
            tickets_sold: 0,
            available_seat_numbers: seat_numbers
        };

        // Create all tickets and store them as dynamic fields
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

            // Store ticket as dynamic field keyed by seat number
            dynamic_field::add(&mut event_object.id, i, ticket);

            // Track available seat number
            vector::push_back(&mut event_object.available_seat_numbers, i);

            i = i + 1;
        };

        let event_object_id = object::id(&event_object);

        // Emit event for discoverability
        event::emit(EventCreated {
            event_object_id,
            event_name,
            event_id,
            event_date,
            venue,
            total_capacity: ticket_count,
            creator: sender,
        });

        transfer::share_object(event_object);
    }

    public fun transfer_ticket(
        mut nft: TicketNFT,
        recipient: address
    ) {

        nft.owner = recipient;
        transfer::public_transfer(nft, recipient);
    }

    /// List ticket for resale on open marketplace with price cap enforcement
    /// Price cannot exceed MAX_RESALE_PERCENTAGE (200%) of original ticket price
    public fun resale(
        nft: TicketNFT,
        updated_price:u64,
        ctx: &mut TxContext
    ): InitiateResale {
        let sender = tx_context::sender(ctx);
        let original_price = nft.price;

        // Enforce price cap: resale price cannot exceed MAX_RESALE_PERCENTAGE of original
        let max_allowed_price = (original_price * MAX_RESALE_PERCENTAGE) / 100;
        assert!(updated_price <= max_allowed_price, RESALE_PRICE_TOO_HIGH);

        // Create resale listing - returned to caller for composability
        // Caller can transfer or use in programmable transactions
        let initiate_resale = InitiateResale {
            id: object::new(ctx),
            seller:sender,
            buyer:sender,  // Set to seller, but buy_resale ignores this field
            price:updated_price,
            nft
        };

        let resale_object_id = object::id(&initiate_resale);
        let ticket_id = object::uid_to_inner(&initiate_resale.nft.id);

        // Emit event for discoverability
        event::emit(ResaleInitiated {
            resale_object_id,
            ticket_id,
            seller: sender,
            price: updated_price,
            original_price,
        });

        initiate_resale
    }

    /// Cancel a resale listing and return the ticket to the seller
    /// Can only be called by the original seller who listed the ticket
    public fun cancel_resale(
        initiated_resale: InitiateResale,
        ctx: &mut TxContext
    ): TicketNFT {
        let sender = tx_context::sender(ctx);
        let InitiateResale {id: id1, seller: seller1, buyer: _buyer1, price: _price1, nft: nft1} = initiated_resale;

        // Only the seller can cancel their listing
        assert!(seller1 == sender, UNAUTHORIZED_CANCEL);

        // Delete the InitiateResale object
        object::delete(id1);

        // Return the NFT to caller for composability
        nft1
    }

    /// Buy a ticket from the primary marketplace
    /// Accepts a Coin<IOTA> by value with the exact ticket price
    #[allow(lint(self_transfer))]
    public fun buy_ticket(
        payment_coin: Coin<IOTA>,
        seat_number: u64,
        event_object: &mut EventObject,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Find and remove seat number from available list (O(N) on u64, much cheaper than full NFT)
        let mut i = 0;
        let length = vector::length(&event_object.available_seat_numbers);
        let mut found = false;

        while (i < length) {
            let current_seat = vector::borrow(&event_object.available_seat_numbers, i);
            if (current_seat == &seat_number) {
                vector::remove(&mut event_object.available_seat_numbers, i);
                found = true;
                break
            };
            i = i + 1;
        };

        // If seat number not found, return payment and abort
        if (!found) {
            transfer::public_transfer(payment_coin, sender);
            abort INVALID_TICKET_TO_BUY
        };

        // Retrieve ticket from dynamic field (O(1) operation)
        let mut ticket = dynamic_field::remove<u64, TicketNFT>(&mut event_object.id, seat_number);

        // Verify payment amount matches ticket price
        assert!(coin::value(&payment_coin) == ticket.price, NOT_ENOUGH_FUNDS);

        // Transfer the payment coin directly to the creator
        transfer::public_transfer(payment_coin, ticket.creator);

        // Update ownership and transfer NFT
        ticket.owner = sender;

        // Update tickets_sold counter
        event_object.tickets_sold = event_object.tickets_sold + 1;

        event::emit(TicketBoughtSuccessfully {
            name: ticket.name,
            seat_number: ticket.seat_number,
            owner: ticket.owner,
            event_date: ticket.event_date,
            message: string::utf8(b"NFT bought successfully"),
        });

        transfer::public_transfer(ticket, sender);
    }

    /// Buy a resale ticket
    /// Accepts payment_coin that includes both resale price and royalty fee
    #[allow(lint(self_transfer))]
    public fun buy_resale(
        mut payment_coin: Coin<IOTA>, 
        initiated_resale: InitiateResale,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let InitiateResale {
            id: id1,
            seller: seller1,
            buyer: _buyer1,
            price: price1,
            nft: mut nft1
        } = initiated_resale;

        // Calculate royalty on the resale price
        let royalty_percentage = nft1.royalty_percentage;
        let royalty_amount = (price1 * royalty_percentage) / 100;
        let total_required = price1 + royalty_amount;

        // Verify payment amount matches resale price + royalty
        assert!(coin::value(&payment_coin) == total_required, NOT_ENOUGH_FUNDS);

        // Split the payment coin for royalty and seller payment
        let royalty_coin = payment_coin.split(royalty_amount, ctx);
        
        // Pay royalty to original creator
        transfer::public_transfer(royalty_coin, nft1.creator);

        // Pay seller (remaining amount in payment_coin is the resale price)
        transfer::public_transfer(payment_coin, seller1);

        // Transfer NFT to buyer
        nft1.owner = sender;
        transfer::public_transfer(nft1, sender);

        // Delete the resale listing object
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
