import { Box, Button, Card, Flex, Text } from "@radix-ui/themes";
import { useEffect, useState, useMemo } from "react";
import { useNetworkVariable } from "../networkConfig";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import { useCreateForm } from "../hooks/useCreateForm";
import { Link } from "react-router-dom";
import { nftOperations, resaleOperations } from "../constants";
import LoadingBar from "./molecules/LoadingBar";
import ParseAddress from "../utils/ParseAddress";
import CopyToClipboard from "./molecules/CopyToClipboard";
import { getExplorerObjectUrl } from "../utils/explorerUtils";

type FilterType = 'all' | 'tickets' | 'resale';

export default function OwnedObjects() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [resaleListings, setResaleListings] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState<boolean>(true);
  
  const packageId = useNetworkVariable("packageId" as never);
  const client = new IotaClient({ url: getFullnodeUrl("devnet") });
  const { address } = useCreateForm();

  // Helper to format DDMMYYYY to readable date
  const formatDate = (rawDate: string | number) => {
    const dateStr = String(rawDate);
    if (!dateStr || dateStr.length !== 8) return dateStr;
    
    const day = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = dateStr.substring(4, 8);
    
    const date = new Date(`${year}-${month}-${day}`);
    
    // Returns format: "November 29, 2025"
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    if (address) {
      Promise.all([
        client.getOwnedObjects({
          owner: address.address,
          filter: { StructType: `${packageId}::independent_ticketing_system_nft::TicketNFT` },
          options: { showContent: true },
        }),
        client.getOwnedObjects({
          owner: address.address,
          filter: { StructType: `${packageId}::independent_ticketing_system_nft::InitiateResale` },
          options: { showContent: true },
        })
      ]).then(([ticketRes, resaleRes]) => {
        setTickets(ticketRes.data || []);
        setResaleListings(resaleRes.data || []);
        setLoading(false);
      });
    } else {
      setTickets([]);
      setResaleListings([]);
      setLoading(false);
    }
  }, [address, packageId]);

  // Unified List Calculation
  const displayItems = useMemo(() => {
    const regular = tickets.map(t => ({ ...t, type: 'ticket' }));
    const selling = resaleListings.map(t => ({ ...t, type: 'resale' }));
    
    let all = [];
    if (filter === 'all') all = [...regular, ...selling];
    else if (filter === 'tickets') all = regular;
    else if (filter === 'resale') all = selling;

    return all;
  }, [tickets, resaleListings, filter]);

  if (loading) return <Flex justify="center" mt="5"><LoadingBar /></Flex>;

  if (!address) return null;

  // --- EMPTY STATE ---
  if (displayItems.length === 0) {
    return (
      <Flex justify="center" style={{ padding: '2rem 0', width: '100%' }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          padding: '2rem',
          border: '3px dashed var(--soft-gray)',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.5)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}>
          <div style={{ fontSize: '4rem', opacity: 0.3, filter: 'grayscale(1)', marginBottom: '-1rem' }}>🎫</div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--ink-black)', margin: '0 0 0.5rem 0' }}>Your Collection is Empty</h3>
            <p style={{ fontFamily: 'var(--font-body)', color: 'gray', fontSize: '0.95rem' }}>Tickets you purchase or events you create will appear right here.</p>
          </div>
          <Flex gap="3" wrap="wrap" justify="center" style={{ width: '100%' }}>
            <Link to="/AvailableTickets" style={{ textDecoration: 'none', flex: '1 1 auto' }}>
              <button style={{ width: '100%', padding: '0.8rem 1.5rem', background: 'var(--stamp-blue)', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--paper-shadow)' }}>Browse Marketplace 🌍</button>
            </Link>
            <Link to="/mint" style={{ textDecoration: 'none', flex: '1 1 auto' }}>
              <button style={{ width: '100%', padding: '0.8rem 1.5rem', background: 'white', color: 'var(--ink-black)', border: '2px solid var(--ink-black)', borderRadius: '8px', fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--paper-shadow)' }}>Create Event ✨</button>
            </Link>
          </Flex>
        </div>
      </Flex>
    );
  }

  // --- POPULATED STATE ---
  return (
    <Flex direction="column" gap="4">
      <Flex justify="center" gap="3" mb="2">
        {[
          { id: 'all', label: 'All Assets' },
          { id: 'tickets', label: 'Tickets' },
          { id: 'resale', label: 'On Sale' }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as FilterType)}
            style={{
              background: filter === btn.id ? 'var(--ink-black)' : 'transparent',
              color: filter === btn.id ? 'white' : 'var(--ink-black)',
              border: '2px solid var(--ink-black)',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
            }}
          >
            {btn.label}
          </button>
        ))}
      </Flex>

      <Flex wrap="wrap" gap="5" justify="start" style={{ padding: '1rem 0' }}>
        {displayItems.map((item, index) => {
          const isResale = item.type === 'resale';
          const data = item.data.content.fields;
          const nft = isResale ? data.nft.fields : data;
          const displayPrice = isResale ? data.price : nft.price;
          const objectId = item.data.content.fields.id.id;

          return (
            <Box key={index} style={{ position: "relative", width: "350px", flexGrow: 0 }}>
              <div style={{ transition: "transform 0.2s" }}>
                
                <div style={{
                  position: "absolute",
                  top: "-12px",
                  right: "20px",
                  background: isResale ? "var(--ticket-pink)" : "var(--sticker-yellow)",
                  color: isResale ? "white" : "var(--ink-black)",
                  padding: "0.4rem 1rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  transform: "rotate(-2deg)",
                  zIndex: 10,
                  boxShadow: "2px 2px 0px rgba(0,0,0,0.1)",
                  border: "2px solid var(--ink-black)"
                }}>
                  {isResale ? "On Sale" : "Admit One"}
                </div>

                <Card
                  className="ticket-card-edge"
                  style={{
                    padding: "1.5rem",
                    borderColor: isResale ? "var(--ticket-pink)" : "var(--ink-black)",
                    borderWidth: "2px",
                    overflow: 'visible'
                  }}
                >
                  <Flex direction="column" gap="3">
                    <div style={{ marginTop: '0.5rem' }}>
                      <Text size="5" weight="bold" style={{ color: "var(--ink-black)", fontFamily: "var(--font-display)", lineHeight: 1.1 }}>
                        {nft.name}
                      </Text>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <Box>
                        <Text size="1" color="gray" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Seat</Text>
                        <Text size="3" weight="bold" style={{ color: "var(--stamp-blue)" }}>#{nft.seat_number}</Text>
                      </Box>
                      <Box>
                        <Text size="1" color="gray" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Price</Text>
                        <Text size="3" weight="bold">{displayPrice} IOTA</Text>
                      </Box>
                      {/* ⬇️ CHANGED: Use Flex with gap for Date padding */}
                      <Flex style={{ gridColumn: 'span 2' }} gap="2" align="baseline">
                        <Text size="1" color="gray" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Date</Text>
                        <Text size="2" weight="bold">{formatDate(nft.event_date)}</Text>
                      </Flex>
                    </div>

                    <div style={{ height: '1px', background: 'none', borderBottom: '2px dashed var(--soft-gray)' }} />

                    <Flex justify="between" align="center">
                       <Text size="1" color="gray" style={{ fontFamily: 'var(--font-mono)' }}>
                         {ParseAddress(objectId)}
                       </Text>
                       <Flex gap="2">
                         <CopyToClipboard text={objectId} />
                         <a href={getExplorerObjectUrl(objectId)} target="_blank" style={{ textDecoration: 'none' }}>↗</a>
                       </Flex>
                    </Flex>

                    <Flex gap="2" mt="2" wrap="wrap">
                      {isResale 
                        ? resaleOperations.map((op, i) => (
                            <Link key={i} to={`/ownedTickets/${op.path}/${objectId}`} style={{ flex: 1 }}>
                              <Button variant="solid" style={{ width: '100%', cursor: 'pointer', background: 'var(--ticket-pink)', color: 'white', fontWeight: 700 }}>
                                {op.description}
                              </Button>
                            </Link>
                          ))
                        : nftOperations.map((op, i) => (
                            <Link key={i} to={`/ownedTickets/${op.path}/${objectId}`} style={{ flex: 1 }}>
                              <Button 
                                variant={op.name === 'Burn' ? 'outline' : 'solid'} 
                                style={{ 
                                  width: '100%', 
                                  cursor: 'pointer',
                                  background: op.name === 'Burn' ? 'transparent' : 'var(--ink-black)',
                                  color: op.name === 'Burn' ? 'red' : 'white',
                                  borderColor: op.name === 'Burn' ? 'red' : 'transparent',
                                  fontWeight: 700
                                }}
                              >
                                {op.description}
                              </Button>
                            </Link>
                          ))
                      }
                    </Flex>
                  </Flex>
                </Card>
              </div>
            </Box>
          );
        })}
      </Flex>
    </Flex>
  );
}