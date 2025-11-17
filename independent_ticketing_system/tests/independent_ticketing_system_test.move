#[test_only]
module independent_ticketing_system::independent_ticketing_system_nft_test {
    use std::string;
    use iota::coin;
    use iota::iota::IOTA;
    use iota::test_scenario::{Self, Scenario};
    use independent_ticketing_system :: independent_ticketing_system_nft :: {
        EventObject,
        TicketNFT,
        InitiateResale,
        RedemptionRegistry,
        create_event,
        resale,
        burn,
        transfer_ticket,
        test_init,
        buy_ticket,
        buy_resale,
        redeem_ticket,
        is_redeemed,
        get_ticket_id
    };

    const CREATOR: address = @0xCCCC;
    const BUYER1: address = @0xBBBB;
    const BUYER2:address = @0xAAAA;

    #[test]
    fun test_create_single_ticket_event() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        create_event(
            string::utf8(b"Test Event"),
            string::utf8(b"testing@123"),
            3012025,
            string::utf8(b"Test Venue"),
            1,  // Single ticket
            200,
            5,
            test_scenario::ctx(test)
        );

        test_scenario::next_tx(test, CREATOR);
        let event_object = test_scenario::take_shared<EventObject>(test);

        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::end(scenario);
    }
    
    #[test]
    fun test_resale() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        create_event(
            string::utf8(b"Test Event"),
            string::utf8(b"testing@123"),
            3012025,
            string::utf8(b"Test Venue"),
            1,
            200,
            5,
            test_scenario::ctx(test)
        );

        // Ticket is now auto-listed in marketplace, buy it as BUYER1
        test_scenario::next_tx(test, BUYER1);
        let mut event_object = test_scenario::take_shared<EventObject>(test);
        let new_coin = coin::mint_for_testing<IOTA>(200, test_scenario::ctx(test));
        buy_ticket(new_coin, 1, &mut event_object, test_scenario::ctx(test));

        test_scenario::next_tx(test,BUYER1);
        let ticket2 = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,BUYER1);
        let initiated_resale = resale(ticket2,400,test_scenario::ctx(test));
        transfer::public_transfer(initiated_resale, BUYER1);

        test_scenario::next_tx(test,BUYER1);
        let initiated_resale = test_scenario::take_from_sender<InitiateResale>(test);

        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::next_tx(test,BUYER1);
        test_scenario::return_to_sender(test,initiated_resale);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = iota::test_scenario::EEmptyInventory)]
    fun test_burn() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        create_event(
            string::utf8(b"Test Event"),
            string::utf8(b"testing@123"),
            3012025,
            string::utf8(b"Test Venue"),
            1,
            200,
            5,
            test_scenario::ctx(test)
        );

        // Ticket is auto-listed, buy it first
        test_scenario::next_tx(test, BUYER1);
        let mut event_object = test_scenario::take_shared<EventObject>(test);
        let new_coin = coin::mint_for_testing<IOTA>(200, test_scenario::ctx(test));
        buy_ticket(new_coin, 1, &mut event_object, test_scenario::ctx(test));

        test_scenario::next_tx(test,BUYER1);
        let ticket = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,BUYER1);
        burn(ticket,test_scenario::ctx(test));

        test_scenario::next_tx(test,BUYER1);
        let ticket2 = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::return_to_sender(test,ticket2);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_transfer_ticket() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        create_event(
            string::utf8(b"Test Event"),
            string::utf8(b"testing@123"),
            3012025,
            string::utf8(b"Test Venue"),
            1,
            200,
            5,
            test_scenario::ctx(test)
        );

        // Ticket is auto-listed, buy it first
        test_scenario::next_tx(test, CREATOR);
        let mut event_object = test_scenario::take_shared<EventObject>(test);
        let new_coin = coin::mint_for_testing<IOTA>(200, test_scenario::ctx(test));
        buy_ticket(new_coin, 1, &mut event_object, test_scenario::ctx(test));

        test_scenario::next_tx(test,CREATOR);
        let ticket = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,CREATOR);
        transfer_ticket(ticket,BUYER1);

        test_scenario::next_tx(test,BUYER1);
        let ticket2 = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::next_tx(test,BUYER1);
        test_scenario::return_to_sender(test,ticket2);
        test_scenario::end(scenario);

    }

    #[test]
    fun test_buy_ticket() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        create_event(
            string::utf8(b"Test Event"),
            string::utf8(b"testing@123"),
            3012025,
            string::utf8(b"Test Venue"),
            1,
            200,
            5,
            test_scenario::ctx(test)
        );

        // Ticket is auto-listed when minted, buy it directly
        test_scenario::next_tx(test, BUYER1);
        let mut event_object = test_scenario::take_shared<EventObject>(test);
        let new_coin = coin::mint_for_testing<IOTA>(200, test_scenario::ctx(test));
        buy_ticket(new_coin, 1, &mut event_object, test_scenario::ctx(test));

        test_scenario::next_tx(test,BUYER1);
        let ticket2 = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::next_tx(test,BUYER1);
        test_scenario::return_to_sender(test,ticket2);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_buy_resale() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        create_event(
            string::utf8(b"Test Event"),
            string::utf8(b"testing@123"),
            3012025,
            string::utf8(b"Test Venue"),
            1,
            200,
            5,
            test_scenario::ctx(test)
        );

        // Ticket is auto-listed, buy it as BUYER1 first
        test_scenario::next_tx(test, BUYER1);
        let mut event_object = test_scenario::take_shared<EventObject>(test);
        let buy_coin = coin::mint_for_testing<IOTA>(200, test_scenario::ctx(test));
        buy_ticket(buy_coin, 1, &mut event_object, test_scenario::ctx(test));

        test_scenario::next_tx(test,BUYER1);
        let ticket2 = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,BUYER1);
        let initiated_resale = resale(ticket2,400,test_scenario::ctx(test));
        transfer::public_transfer(initiated_resale, BUYER1);

        test_scenario::next_tx(test,BUYER1);
        let initiated_resale = test_scenario::take_from_sender<InitiateResale>(test);

        // Buy resale with payment including royalty (400 + 5% of 400 = 420)
        let new_coin = coin::mint_for_testing<IOTA>(420, test_scenario::ctx(test));

        test_scenario::next_tx(test,BUYER2);
        buy_resale(new_coin, initiated_resale, test_scenario::ctx(test));

        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_redeem_ticket() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        create_event(
            string::utf8(b"Test Event"),
            string::utf8(b"testing@123"),
            3012025,
            string::utf8(b"Test Venue"),
            1,
            200,
            5,
            test_scenario::ctx(test)
        );

        test_scenario::next_tx(test, BUYER1);
        let mut event_object = test_scenario::take_shared<EventObject>(test);

        test_scenario::next_tx(test, BUYER1);
        let mut redemption_registry = test_scenario::take_shared<RedemptionRegistry>(test);

        // Ticket is auto-listed, buy it first
        let new_coin = coin::mint_for_testing<IOTA>(200, test_scenario::ctx(test));
        buy_ticket(new_coin, 1, &mut event_object, test_scenario::ctx(test));

        test_scenario::next_tx(test,BUYER1);
        let ticket = test_scenario::take_from_sender<TicketNFT>(test);

        let ticket_id = get_ticket_id(&ticket);

        // Verify ticket is not redeemed initially
        assert!(!is_redeemed(ticket_id, &redemption_registry), 0);

        test_scenario::next_tx(test,BUYER1);
        redeem_ticket(&ticket, &mut redemption_registry, test_scenario::ctx(test));

        // Verify ticket is now redeemed
        assert!(is_redeemed(ticket_id, &redemption_registry), 1);

        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::return_shared<RedemptionRegistry>(redemption_registry);

        // Return ticket to BUYER1 who owns it
        test_scenario::next_tx(test, BUYER1);
        test_scenario::return_to_sender(test,ticket);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = independent_ticketing_system::independent_ticketing_system_nft::TICKET_ALREADY_REDEEMED)]
    fun test_double_redemption() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        create_event(
            string::utf8(b"Test Event"),
            string::utf8(b"testing@123"),
            3012025,
            string::utf8(b"Test Venue"),
            1,
            200,
            5,
            test_scenario::ctx(test)
        );

        test_scenario::next_tx(test, BUYER1);
        let mut event_object = test_scenario::take_shared<EventObject>(test);

        test_scenario::next_tx(test, BUYER1);
        let mut redemption_registry = test_scenario::take_shared<RedemptionRegistry>(test);

        // Ticket is auto-listed, buy it first
        let new_coin = coin::mint_for_testing<IOTA>(200, test_scenario::ctx(test));
        buy_ticket(new_coin, 1, &mut event_object, test_scenario::ctx(test));

        test_scenario::next_tx(test,BUYER1);
        let ticket = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,BUYER1);
        redeem_ticket(&ticket, &mut redemption_registry, test_scenario::ctx(test));

        // Try to redeem again - should fail
        test_scenario::next_tx(test,BUYER2);
        redeem_ticket(&ticket, &mut redemption_registry, test_scenario::ctx(test));

        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::return_shared<RedemptionRegistry>(redemption_registry);
        test_scenario::return_to_sender(test,ticket);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_create_event() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        // Create an event with 5 tickets
        test_scenario::next_tx(test, CREATOR);
        create_event(
            string::utf8(b"Summer Music Festival"),
            string::utf8(b"summer-fest-2025"),
            27112025,
            string::utf8(b"Central Park, NYC"),
            5,
            100,
            10,
            test_scenario::ctx(test)
        );

        // Get the newly created event object
        test_scenario::next_tx(test, CREATOR);
        let mut event_object = test_scenario::take_shared<EventObject>(test);

        // Buy one of the tickets
        test_scenario::next_tx(test, BUYER1);
        let new_coin = coin::mint_for_testing<IOTA>(100, test_scenario::ctx(test));
        buy_ticket(new_coin, 3, &mut event_object, test_scenario::ctx(test));

        // Verify BUYER1 received the ticket
        test_scenario::next_tx(test, BUYER1);
        let ticket = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::next_tx(test, BUYER1);
        test_scenario::return_to_sender(test, ticket);
        test_scenario::end(scenario);
    }

    fun initialize(scenario: &mut Scenario, admin: address) {
        test_scenario::next_tx(scenario, admin);
        {
            test_init(test_scenario::ctx(scenario));
        };
    }
}
