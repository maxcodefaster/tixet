#[test_only]
module independent_ticketing_system::independent_ticketing_system_nft_test {
    use std::string;
    use iota::coin;
    use iota::iota::IOTA;
    use iota::test_scenario::{Self, Scenario};
    use independent_ticketing_system :: independent_ticketing_system_nft :: {
        CreatorCap,
        EventObject,
        TicketNFT,
        InitiateResale,
        RedemptionRegistry,
        mint_ticket,
        resale,
        burn,
        transfer_ticket,
        test_init,
        whitelist_buyer,
        enable_ticket_to_buy,
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
    fun test_mint_ticket() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        let mut event_object = test_scenario::take_shared<EventObject>(test);

        test_scenario::next_tx(test,CREATOR);
        mint_ticket(string::utf8(b"testing@123"),3012025,5,&mut event_object,200,test.ctx());

        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::end(scenario);
    }
    #[test]
    fun test_resale() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        let mut event_object = test_scenario::take_shared<EventObject>(test);

        test_scenario::next_tx(test,CREATOR);
        mint_ticket(string::utf8(b"testing@123"),3012025,5,&mut event_object,200,test.ctx());

        test_scenario::next_tx(test,CREATOR);
        let ticket = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,CREATOR);
        transfer_ticket(ticket,BUYER1);

        test_scenario::next_tx(test,BUYER1);
        let mut ticket2 = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,BUYER1);
        whitelist_buyer(BUYER2,&mut ticket2);

        test_scenario::next_tx(test,BUYER1);
        resale(ticket2,500,BUYER2,test_scenario::ctx(test));

        test_scenario::next_tx(test,BUYER2);
        let initiated_resale = test_scenario::take_from_sender<InitiateResale>(test);

        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::next_tx(test,BUYER2);
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
        let mut event_object = test_scenario::take_shared<EventObject>(test);

        test_scenario::next_tx(test,CREATOR);
        mint_ticket(string::utf8(b"testing@123"),3012025,5,&mut event_object,200,test.ctx());

        test_scenario::next_tx(test,CREATOR);
        let ticket = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,CREATOR);
        burn(ticket,test_scenario::ctx(test));

        test_scenario::next_tx(test,CREATOR);
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
        let mut event_object = test_scenario::take_shared<EventObject>(test);

        test_scenario::next_tx(test,CREATOR);
        mint_ticket(string::utf8(b"testing@123"),3012025,5,&mut event_object,200,test.ctx());

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
    #[expected_failure(abort_code = iota::test_scenario::EEmptyInventory)]
    fun test_enable_ticket_to_buy() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        let mut event_object = test_scenario::take_shared<EventObject>(test);


        test_scenario::next_tx(test,CREATOR);
        mint_ticket(string::utf8(b"testing@123"),3012025,5,&mut event_object,200,test.ctx());

        test_scenario::next_tx(test,CREATOR);
        let ticket = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,CREATOR);
        enable_ticket_to_buy(ticket,&mut event_object);

        test_scenario::next_tx(test,BUYER1);
        let ticket2 = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::return_to_sender(test,ticket2);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_buy_ticket() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        let mut event_object = test_scenario::take_shared<EventObject>(test);

        test_scenario::next_tx(test,CREATOR);
        mint_ticket(string::utf8(b"testing@123"),3012025,5,&mut event_object,200,test.ctx());

        test_scenario::next_tx(test,CREATOR);
        let mut ticket = test_scenario::take_from_sender<TicketNFT>(test);

        whitelist_buyer(BUYER1, &mut ticket);
        test_scenario::next_tx(test,CREATOR);

        enable_ticket_to_buy(ticket,&mut event_object);
        test_scenario::next_tx(test,BUYER1);

        let mut new_coin = coin::mint_for_testing<IOTA>(500,test_scenario::ctx(test));
        test_scenario::next_tx(test,BUYER1);
        buy_ticket(&mut new_coin,300,&mut event_object,test_scenario::ctx(test));
        test_scenario::next_tx(test,BUYER1);
        let ticket2 = test_scenario::take_from_sender<TicketNFT>(test);

        new_coin.burn_for_testing();
        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::next_tx(test,BUYER1);
        test_scenario::return_to_sender(test,ticket2);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_buy_resale() { //fdsdfads
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        let mut event_object = test_scenario::take_shared<EventObject>(test);

        test_scenario::next_tx(test,CREATOR);
        mint_ticket(string::utf8(b"testing@123"),3012025,5,&mut event_object,200,test.ctx());

        test_scenario::next_tx(test,CREATOR);
        let ticket = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,CREATOR);
        transfer_ticket(ticket,BUYER1);

        test_scenario::next_tx(test,BUYER1);
        let mut ticket2 = test_scenario::take_from_sender<TicketNFT>(test);

        test_scenario::next_tx(test,BUYER1);
        whitelist_buyer(BUYER2, &mut ticket2);

        test_scenario::next_tx(test,BUYER1);
        resale(ticket2,500,BUYER2,test_scenario::ctx(test));

        test_scenario::next_tx(test,BUYER2);
        let initiated_resale = test_scenario::take_from_sender<InitiateResale>(test);

        let mut new_coin = coin::mint_for_testing<IOTA>(500,test_scenario::ctx(test));

        test_scenario::next_tx(test,BUYER2);
        buy_resale(&mut new_coin,initiated_resale, test_scenario::ctx(test));

        new_coin.burn_for_testing();
        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_whitelist_buyer() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        let mut event_object = test_scenario::take_shared<EventObject>(test);

        test_scenario::next_tx(test,CREATOR);
        mint_ticket(string::utf8(b"testing@123"),3012025,5,&mut event_object,200,test.ctx());

        test_scenario::next_tx(test,CREATOR);
        let mut ticket = test_scenario::take_from_sender<TicketNFT>(test);

        whitelist_buyer(BUYER1,&mut ticket);
        test_scenario::return_shared<EventObject>(event_object);
        test_scenario::return_to_sender(test,ticket);

        test_scenario::end(scenario);
    }

    #[test]
    fun test_redeem_ticket() {
        let mut scenario = test_scenario::begin(CREATOR);
        let test = &mut scenario;
        initialize(test, CREATOR);

        test_scenario::next_tx(test, CREATOR);
        let mut event_object = test_scenario::take_shared<EventObject>(test);

        test_scenario::next_tx(test, CREATOR);
        let mut redemption_registry = test_scenario::take_shared<RedemptionRegistry>(test);

        test_scenario::next_tx(test,CREATOR);
        mint_ticket(string::utf8(b"testing@123"),3012025,5,&mut event_object,200,test.ctx());

        test_scenario::next_tx(test,CREATOR);
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
        let mut event_object = test_scenario::take_shared<EventObject>(test);

        test_scenario::next_tx(test, CREATOR);
        let mut redemption_registry = test_scenario::take_shared<RedemptionRegistry>(test);

        test_scenario::next_tx(test,CREATOR);
        mint_ticket(string::utf8(b"testing@123"),3012025,5,&mut event_object,200,test.ctx());

        test_scenario::next_tx(test,CREATOR);
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

    fun initialize(scenario: &mut Scenario, admin: address) {
        test_scenario::next_tx(scenario, admin);
        {
            test_init(test_scenario::ctx(scenario));
        };
    }
}