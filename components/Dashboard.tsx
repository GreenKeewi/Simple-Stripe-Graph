import React, { useState, useEffect } from 'react';
import { DASHBOARD_DATA } from '../constants';
import { MetricType } from '../types';
import RevenueChart from './RevenueChart';

const Dashboard: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>(MetricType.MRR);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect system color scheme for Notion-native feel
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const currentData = DASHBOARD_DATA[selectedMetric];

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-6 transition-colors duration-300 ${isDarkMode ? 'bg-notion-dark text-notion-textDark' : 'bg-notion-light text-notion-text'}`}>
      
      {/* Content Wrapper */}
      <div className="flex flex-col items-center w-full max-w-5xl h-full max-h-[600px]">
        
        {/* Top Controls & Header */}
        <div className="flex flex-col items-center justify-center mb-8 space-y-4">
          
          {/* Toggles */}
          <div className="flex items-center gap-6">
            {Object.values(MetricType).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`
                  text-sm font-medium transition-colors duration-200 outline-none select-none tracking-wide
                  ${selectedMetric === metric 
                    ? (isDarkMode ? 'text-notion-greenDark' : 'text-notion-green') 
                    : (isDarkMode ? 'text-neutral-600 hover:text-neutral-400' : 'text-neutral-400 hover:text-neutral-600')
                  }
                `}
              >
                {metric}
              </button>
            ))}
          </div>

          {/* Metric Value */}
          <div className="text-center">
             <h1 className={`text-6xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-notion-text'}`}>
               {currentData.currentValue}
             </h1>
          </div>
        </div>

        {/* The Graph Container */}
        {/* We use relative + absolute inset-0 to ensure the child (chart) always knows its height 
            even inside a flex container, fixing the width(-1) error. */}
        <div className="flex-1 w-full min-h-[250px] relative">
          <div className="absolute inset-0">
            <RevenueChart data={currentData.data} isDarkMode={isDarkMode} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;