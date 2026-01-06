import { Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useNetworkVariable } from "../networkConfig";
import { getFullnodeUrl, IotaClient } from "@iota/iota-sdk/client";
import LoadingBar from "./molecules/LoadingBar";

interface Metrics {
  totalEvents: number;
  totalTicketsSold: number;
  activeResaleListings: number;
  redemptionRate: number;
  avgResaleMarkup: number;
}

export default function Analytics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const packageId = useNetworkVariable("packageId" as never);
  const client = new IotaClient({ url: getFullnodeUrl("devnet") });

  useEffect(() => {
    if (packageId && packageId !== "<YOUR_PACKAGE_ID>") {
      fetchAnalytics();
    } else {
      setLoading(false);
      setError("Package ID not configured");
    }
  }, [packageId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Query all event types
      const [eventsCreated, ticketsBought, resalesInitiated, ticketsRedeemed] = await Promise.all([
        client.queryEvents({
          query: { MoveEventType: `${packageId}::independent_ticketing_system_nft::EventCreated` },
          limit: 50
        }),
        client.queryEvents({
          query: { MoveEventType: `${packageId}::independent_ticketing_system_nft::TicketBoughtSuccessfully` },
          limit: 50
        }),
        client.queryEvents({
          query: { MoveEventType: `${packageId}::independent_ticketing_system_nft::ResaleInitiated` },
          limit: 50
        }),
        client.queryEvents({
          query: { MoveEventType: `${packageId}::independent_ticketing_system_nft::TicketRedeemedSuccessfully` },
          limit: 50
        })
      ]);

      // Calculate metrics
      const totalEvents = eventsCreated.data.length;
      const totalTicketsSold = ticketsBought.data.length;
      const activeResaleListings = resalesInitiated.data.length;
      const ticketsRedeemedCount = ticketsRedeemed.data.length;

      // Calculate redemption rate
      const redemptionRate = totalTicketsSold > 0
        ? Number(((ticketsRedeemedCount / totalTicketsSold) * 100).toFixed(1))
        : 0;

      // Calculate average resale markup
      let totalMarkup = 0;
      let validResales = 0;

      resalesInitiated.data.forEach((resale: any) => {
        const originalPrice = resale.parsedJson?.original_price || 0;
        const resalePrice = resale.parsedJson?.price || 0;
        if (originalPrice > 0) {
          totalMarkup += ((resalePrice - originalPrice) / originalPrice) * 100;
          validResales++;
        }
      });

      const avgResaleMarkup = validResales > 0
        ? Number((totalMarkup / validResales).toFixed(1))
        : 0;

      setMetrics({
        totalEvents,
        totalTicketsSold,
        activeResaleListings,
        redemptionRate,
        avgResaleMarkup
      });

    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" mt="5">
        <LoadingBar />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" mt="5">
        <Card style={{ padding: '2rem', maxWidth: '500px' }}>
          <Text size="3" style={{ color: 'var(--ticket-pink)' }}>
            ⚠️ {error}
          </Text>
        </Card>
      </Flex>
    );
  }

  if (!metrics || metrics.totalEvents === 0) {
    return (
      <Box mt="5" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <Heading size="8" mb="4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-black)' }}>
          Platform Analytics
        </Heading>
        <Card style={{
          padding: '3rem',
          textAlign: 'center',
          border: '3px dashed var(--soft-gray)',
          background: 'rgba(255, 255, 255, 0.5)'
        }}>
          <Text size="6" style={{ fontSize: '3rem', opacity: 0.3 }}>📊</Text>
          <Heading size="5" mt="3" mb="2">No Data Yet</Heading>
          <Text size="3" style={{ color: 'gray' }}>
            Create your first event or buy a ticket to see analytics!
          </Text>
        </Card>
      </Box>
    );
  }

  return (
    <Box mt="5" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <Heading size="8" mb="4" style={{
        fontFamily: 'var(--font-display)',
        color: 'var(--ink-black)',
        letterSpacing: '-0.02em'
      }}>
        Platform Analytics
      </Heading>

      {/* Metrics Cards Grid */}
      <Flex wrap="wrap" gap="4" mb="5">
        <MetricCard
          title="Total Events"
          value={metrics.totalEvents.toString()}
          icon="🎪"
          description="Events created on platform"
        />
        <MetricCard
          title="Tickets Sold"
          value={metrics.totalTicketsSold.toString()}
          icon="🎟️"
          description="Primary market sales"
        />
        <MetricCard
          title="Resale Listings"
          value={metrics.activeResaleListings.toString()}
          icon="🔄"
          description="Active secondary market"
        />
        <MetricCard
          title="Redemption Rate"
          value={`${metrics.redemptionRate}%`}
          icon="✅"
          description="Tickets scanned at entry"
        />
        <MetricCard
          title="Avg Resale Markup"
          value={`${metrics.avgResaleMarkup}%`}
          icon="📈"
          description="Secondary market premium"
        />
      </Flex>

      {/* Key Insights Section */}
      <Card style={{
        padding: '2rem',
        background: 'var(--paper-white)',
        border: '2px solid var(--ink-black)',
        borderRadius: '12px',
        boxShadow: 'var(--paper-shadow)'
      }}>
        <Heading size="5" mb="3" style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--ink-black)'
        }}>
          Key Insights
        </Heading>
        <Text size="3" style={{
          lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
          color: 'var(--ink-black)'
        }}>
          <strong style={{ color: 'var(--stamp-blue)' }}>• Anti-Scalping Protection:</strong> Resale price caps (200% max) prevent ticket exploitation
          <br />
          <strong style={{ color: 'var(--stamp-blue)' }}>• Organizer Revenue:</strong> {metrics.activeResaleListings} resales generating royalties for creators
          <br />
          <strong style={{ color: 'var(--stamp-blue)' }}>• Fraud Prevention:</strong> {metrics.redemptionRate}% redemption rate proves blockchain verification works
          <br />
          <strong style={{ color: 'var(--stamp-blue)' }}>• Zero Counterfeits:</strong> All {metrics.totalTicketsSold} tickets cryptographically verified on-chain
          <br />
          <strong style={{ color: 'var(--stamp-blue)' }}>• Market Efficiency:</strong> {metrics.avgResaleMarkup}% average markup vs. {">"}100% on traditional platforms
        </Text>
      </Card>
    </Box>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon,
  description
}: {
  title: string;
  value: string;
  icon: string;
  description?: string;
}) {
  return (
    <Card style={{
      flex: '1 1 280px',
      minWidth: '280px',
      padding: '1.5rem',
      background: 'var(--paper-white)',
      border: '2px solid var(--ink-black)',
      borderRadius: '12px',
      boxShadow: 'var(--paper-shadow)',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e: any) => {
      e.currentTarget.style.transform = 'translate(-2px, -2px)';
      e.currentTarget.style.boxShadow = 'var(--paper-shadow-hover)';
    }}
    onMouseLeave={(e: any) => {
      e.currentTarget.style.transform = 'translate(0, 0)';
      e.currentTarget.style.boxShadow = 'var(--paper-shadow)';
    }}
    >
      <Flex direction="column" gap="2">
        <Text size="1" style={{
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'var(--stamp-blue)',
          letterSpacing: '0.1em',
          fontFamily: 'var(--font-body)'
        }}>
          {title}
        </Text>
        <Flex align="center" gap="3">
          <Text style={{ fontSize: '2.5rem', lineHeight: 1 }}>{icon}</Text>
          <Text size="9" weight="bold" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3rem',
            color: 'var(--ink-black)',
            lineHeight: 1
          }}>
            {value}
          </Text>
        </Flex>
        {description && (
          <Text size="2" style={{
            color: 'gray',
            fontFamily: 'var(--font-body)',
            marginTop: '0.5rem'
          }}>
            {description}
          </Text>
        )}
      </Flex>
    </Card>
  );
}
