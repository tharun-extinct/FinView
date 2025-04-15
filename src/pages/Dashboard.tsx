
import React, { useState, useEffect } from 'react';
import { 
  getStocks, 
  getPortfolio, 
  updateStocks, 
  updatePortfolio,
  getHistoricalData,
  getPortfolioAllocation,
  initializeStocksData
} from '../services/financialData';
import { Stock, Portfolio, Timeframe } from '../types/finance';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import PortfolioSummary from '../components/dashboard/PortfolioSummary';
import StockList from '../components/dashboard/StockList';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import AllocationChart from '../components/dashboard/AllocationChart';

const Dashboard = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1M');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data on component mount
  useEffect(() => {
    initializeStocksData();
    loadData();
    
    // Set up interval for simulated real-time updates
    const intervalId = setInterval(() => {
      const updatedStocks = updateStocks();
      const updatedPortfolio = updatePortfolio();
      
      setStocks(updatedStocks);
      setPortfolio(updatedPortfolio);
    }, 8000); // Update every 8 seconds
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Load initial data
  const loadData = () => {
    setIsLoading(true);
    
    try {
      const stocksData = getStocks();
      const portfolioData = getPortfolio();
      
      setStocks(stocksData);
      setPortfolio(portfolioData);
      
      // Select the first stock by default if none is selected
      if (!selectedStock && stocksData.length > 0) {
        setSelectedStock(stocksData[0].symbol);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-4 text-muted-foreground">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {portfolio && (
          <>
            {/* Portfolio Summary */}
            <PortfolioSummary portfolio={portfolio} />
            
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
              {/* Stock List */}
              <div className="lg:col-span-4">
                <StockList 
                  stocks={stocks} 
                  selectedStock={selectedStock}
                  onSelectStock={(symbol) => setSelectedStock(symbol)}
                />
              </div>
              
              {/* Charts */}
              <div className="lg:col-span-8 space-y-6">
                <PerformanceChart 
                  selectedStock={selectedStock}
                  selectedTimeframe={selectedTimeframe}
                  onTimeframeChange={setSelectedTimeframe}
                  getHistoricalData={getHistoricalData}
                />
                
                <AllocationChart 
                  getPortfolioAllocation={getPortfolioAllocation}
                />
              </div>
            </div>
          </>
        )}
      </main>
      
      <footer className="py-4 px-6 border-t text-sm text-muted-foreground text-center">
        <p>
          &copy; {new Date().getFullYear()} FinView. All data is simulated for demonstration purposes only.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
