export enum MetricType {
  MRR = 'MRR',
  TOTAL_REVENUE = 'Total Revenue',
  THIS_MONTH = 'This Month'
}

export interface DataPoint {
  label: string;
  value: number;
}

export interface MetricData {
  id: MetricType;
  data: DataPoint[];
  currentValue: string;
}
