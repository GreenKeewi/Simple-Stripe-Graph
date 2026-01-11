import Stripe from 'stripe';
import { DataPoint, MetricType, MetricData } from '../types';

// Initialize Stripe with restricted API key from environment
// Use a restricted key with read-only permissions for: charges, subscriptions
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover'
});

// Format currency to display value
const formatCurrency = (amount: number): string => {
  return `$${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

/**
 * Fetch MRR (Monthly Recurring Revenue) from Stripe subscriptions
 */
export async function fetchMRRData(): Promise<MetricData> {
  const now = new Date();
  const monthlyData: DataPoint[] = [];
  let currentMRR = 0;

  // Get data for the last 12 months
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = Math.floor(monthDate.getTime() / 1000);
    const endOfMonth = Math.floor(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59).getTime() / 1000);

    // Get active subscriptions for this month
    const subscriptions = await stripe.subscriptions.list({
      created: { lte: endOfMonth },
      status: 'active',
      limit: 100,
    });

    // Calculate MRR for this month
    let monthMRR = 0;
    for (const sub of subscriptions.data) {
      // Only count if subscription was active during this month
      if (sub.created <= endOfMonth && (!sub.canceled_at || sub.canceled_at >= startOfMonth)) {
        for (const item of sub.items.data) {
          const amount = item.price.unit_amount || 0;
          const quantity = item.quantity || 1;
          
          // Convert to monthly recurring
          if (item.price.recurring?.interval === 'month') {
            monthMRR += amount * quantity;
          } else if (item.price.recurring?.interval === 'year') {
            monthMRR += (amount * quantity) / 12;
          }
        }
      }
    }

    if (i === 0) currentMRR = monthMRR;

    monthlyData.push({
      label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      value: Math.round(monthMRR / 100), // Convert cents to dollars
    });
  }

  return {
    id: MetricType.MRR,
    data: monthlyData,
    currentValue: formatCurrency(currentMRR),
  };
}

/**
 * Fetch Total Revenue from Stripe charges
 */
export async function fetchTotalRevenueData(): Promise<MetricData> {
  const now = new Date();
  const monthlyData: DataPoint[] = [];
  let totalRevenue = 0;

  // Get data for the last 12 months
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = Math.floor(monthDate.getTime() / 1000);
    const endOfMonth = Math.floor(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59).getTime() / 1000);

    // Get all successful charges for this month
    const charges = await stripe.charges.list({
      created: { gte: startOfMonth, lte: endOfMonth },
      limit: 100,
    });

    const monthRevenue = charges.data
      .filter(charge => charge.status === 'succeeded' && !charge.refunded)
      .reduce((sum, charge) => sum + charge.amount, 0);

    totalRevenue += monthRevenue;

    monthlyData.push({
      label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      value: Math.round(monthRevenue / 100), // Convert cents to dollars
    });
  }

  return {
    id: MetricType.TOTAL_REVENUE,
    data: monthlyData,
    currentValue: formatCurrency(totalRevenue),
  };
}

/**
 * Fetch revenue for current month (daily breakdown)
 */
export async function fetchThisMonthData(): Promise<MetricData> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  const dailyData: DataPoint[] = [];
  let monthTotal = 0;

  // Get data for each day of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStart = Math.floor(new Date(now.getFullYear(), now.getMonth(), day).getTime() / 1000);
    const dayEnd = Math.floor(new Date(now.getFullYear(), now.getMonth(), day, 23, 59, 59).getTime() / 1000);

    // Get charges for this specific day
    const charges = await stripe.charges.list({
      created: { gte: dayStart, lte: dayEnd },
      limit: 100,
    });

    const dayRevenue = charges.data
      .filter(charge => charge.status === 'succeeded' && !charge.refunded)
      .reduce((sum, charge) => sum + charge.amount, 0);

    monthTotal += dayRevenue;

    dailyData.push({
      label: day.toString(),
      value: Math.round(dayRevenue / 100), // Convert cents to dollars
    });
  }

  return {
    id: MetricType.THIS_MONTH,
    data: dailyData,
    currentValue: formatCurrency(monthTotal),
  };
}

/**
 * Fetch all dashboard data from Stripe
 */
export async function fetchAllStripeData(): Promise<Record<MetricType, MetricData>> {
  const [mrr, totalRevenue, thisMonth] = await Promise.all([
    fetchMRRData(),
    fetchTotalRevenueData(),
    fetchThisMonthData(),
  ]);

  return {
    [MetricType.MRR]: mrr,
    [MetricType.TOTAL_REVENUE]: totalRevenue,
    [MetricType.THIS_MONTH]: thisMonth,
  };
}
