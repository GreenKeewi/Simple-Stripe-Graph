import { MetricType, MetricData } from './types';

// Helper to generate smooth curve data
const generateCurve = (points: number, start: number, variance: number, trend: number): number[] => {
  let current = start;
  const data: number[] = [];
  for (let i = 0; i < points; i++) {
    current += (Math.random() - 0.4) * variance + trend; 
    data.push(Math.max(0, current));
  }
  return data;
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = Array.from({ length: 30 }, (_, i) => (i + 1).toString());

// MRR Data (12 months)
const mrrValues = generateCurve(12, 12000, 500, 800);
const mrrData = months.map((month, i) => ({ label: month, value: Math.round(mrrValues[i]) }));

// Total Revenue Data (12 months, steeper growth)
const totalRevValues = generateCurve(12, 45000, 2000, 1500);
const totalRevData = months.map((month, i) => ({ label: month, value: Math.round(totalRevValues[i]) }));

// This Month Data (30 days)
const dailyValues = generateCurve(30, 1500, 300, 10);
const thisMonthData = days.map((day, i) => ({ label: day, value: Math.round(dailyValues[i]) }));

export const DASHBOARD_DATA: Record<MetricType, MetricData> = {
  [MetricType.MRR]: {
    id: MetricType.MRR,
    data: mrrData,
    currentValue: "$24,500"
  },
  [MetricType.TOTAL_REVENUE]: {
    id: MetricType.TOTAL_REVENUE,
    data: totalRevData,
    currentValue: "$68,200"
  },
  [MetricType.THIS_MONTH]: {
    id: MetricType.THIS_MONTH,
    data: thisMonthData,
    currentValue: "$48,900"
  }
};
