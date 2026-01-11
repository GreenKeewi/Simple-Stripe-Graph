import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { DataPoint } from '../types';

interface RevenueChartProps {
  data: DataPoint[];
  isDarkMode: boolean;
}

const CustomTooltip = ({ active, payload, label, isDarkMode }: TooltipProps<number, string> & { isDarkMode: boolean }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`${isDarkMode ? 'bg-[#252525] text-gray-200 border-[#333]' : 'bg-white text-gray-800 border-gray-100'} px-3 py-1.5 text-xs font-medium rounded-md shadow-sm border`}>
        <span className="opacity-60 mr-2">{label}</span>
        <span>{`$${payload[0].value?.toLocaleString()}`}</span>
      </div>
    );
  }
  return null;
};

const RevenueChart: React.FC<RevenueChartProps> = ({ data, isDarkMode }) => {
  
  // Notion specific color palette
  const strokeColor = isDarkMode ? '#45C28F' : '#2EAA76'; 
  const gridColor = isDarkMode ? '#2F2F2F' : '#F7F7F5'; // Lighter grid for minimal look
  const tickColor = isDarkMode ? '#555' : '#BBB';
  
  // Bright green for active hover state
  const activeDotFill = isDarkMode ? '#6EE7B7' : '#4ADE80';
  const activeDotStroke = isDarkMode ? '#191919' : '#FFFFFF';

  return (
    <ResponsiveContainer width="99%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 10,
          right: 0,
          left: -20,
          bottom: 0,
        }}
      >
        <CartesianGrid 
          vertical={false} 
          stroke={gridColor} 
          strokeWidth={1}
        />
        <XAxis 
          dataKey="label" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: tickColor, fontSize: 11 }}
          dy={15}
          interval="preserveStartEnd"
          minTickGap={30}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: tickColor, fontSize: 11 }}
          tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
        />
        <Tooltip 
          content={<CustomTooltip isDarkMode={isDarkMode} />}
          cursor={{ stroke: gridColor, strokeWidth: 1 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={2}
          dot={false}
          activeDot={{ 
            r: 6, 
            fill: activeDotFill, 
            stroke: activeDotStroke, 
            strokeWidth: 3 
          }}
          isAnimationActive={true}
          animationDuration={800}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;