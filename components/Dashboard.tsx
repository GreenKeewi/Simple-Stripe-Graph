import React, { useEffect, useMemo, useState } from 'react';
import { MetricType, MetricData } from '../types';
import RevenueChart from './RevenueChart';
import { fetchAllStripeData } from '../services/stripeService';

// Normalize Vite env flags into booleans with sensible defaults
const parseEnvToggle = (value: string | boolean | undefined, defaultValue = true): boolean => {
  if (value === undefined) return defaultValue;
  if (typeof value === 'boolean') return value;
  const normalized = value.toString().trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

const Dashboard: React.FC = () => {
  const metricVisibility = useMemo(() => ({
    [MetricType.MRR]: parseEnvToggle(import.meta.env.VITE_SHOW_MRR),
    [MetricType.TOTAL_REVENUE]: parseEnvToggle(import.meta.env.VITE_SHOW_TOTAL_REVENUE),
    [MetricType.THIS_MONTH]: parseEnvToggle(import.meta.env.VITE_SHOW_THIS_MONTH),
  }), []);

  const visibleMetrics = useMemo(
    () => Object.values(MetricType).filter((metric) => metricVisibility[metric]),
    [metricVisibility]
  );

  const [selectedMetric, setSelectedMetric] = useState<MetricType>(
    visibleMetrics[0] ?? MetricType.MRR
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dashboardData, setDashboardData] = useState<Record<MetricType, MetricData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detect system color scheme for Notion-native feel
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Fetch Stripe data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!visibleMetrics.length) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const stripeData = await fetchAllStripeData();
        setDashboardData(stripeData);
      } catch (err) {
        console.error('Failed to fetch Stripe data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch Stripe data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [visibleMetrics]);

  const currentData = dashboardData?.[selectedMetric];

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-6 transition-colors duration-300 ${isDarkMode ? 'bg-notion-dark text-notion-textDark' : 'bg-notion-light text-notion-text'}`}>
      
      {/* Content Wrapper */}
      <div className="flex flex-col items-center w-full max-w-5xl h-full max-h-[600px]">
        
        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className={`text-xl font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              Failed to load Stripe data
            </div>
            <div className={`text-sm max-w-md ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {error}
            </div>
            <div className={`text-xs max-w-lg ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
              Make sure your Stripe API key is configured correctly in the .env file
            </div>
          </div>
        )}

        {/* Loading or Data State */}
        {!error && (
          <>
            {/* Top Controls & Header */}
            <div className="flex flex-col items-center justify-center mb-8 space-y-4">
              
              {/* Toggles */}
              {visibleMetrics.length > 0 ? (
                <div className="flex items-center gap-6">
                  {visibleMetrics.map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      disabled={isLoading}
                      className={`
                        text-sm font-medium transition-colors duration-200 outline-none select-none tracking-wide
                        ${selectedMetric === metric 
                          ? (isDarkMode ? 'text-notion-greenDark' : 'text-notion-green') 
                          : (isDarkMode ? 'text-neutral-600 hover:text-neutral-400' : 'text-neutral-400 hover:text-neutral-600')
                        }
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {metric}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`text-sm ${isDarkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  Enable at least one metric toggle in your .env file to view data.
                </div>
              )}

              {/* Metric Value */}
              <div className="text-center">
                {isLoading ? (
                  <div className={`text-4xl font-bold tracking-tight ${isDarkMode ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    Loading...
                  </div>
                ) : currentData && visibleMetrics.length ? (
                  <h1 className={`text-6xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-notion-text'}`}>
                    {currentData.currentValue}
                  </h1>
                ) : null}
              </div>
            </div>

            {/* The Graph Container */}
            {/* We use relative + absolute inset-0 to ensure the child (chart) always knows its height 
                even inside a flex container, fixing the width(-1) error. */}
            {!isLoading && currentData && visibleMetrics.length > 0 && (
              <div className="flex-1 w-full min-h-[250px] relative">
                <div className="absolute inset-0">
                  <RevenueChart data={currentData.data} isDarkMode={isDarkMode} />
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Dashboard;