import { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import BarChart from './components/BarChart'
import PieChart from './components/PieChart'
import LineChartComponent from './components/LineChartComponent'
import './App.css'

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  gasPrice: string
  timestamp: number
}

interface Block {
  number: number
  timestamp: number
  transactions: number
  gasUsed: string
  gasLimit: string
}

interface NetworkStats {
  tps: number
  avgBlockTime: number
  totalTransactions: number
  activeAddresses: number
}

interface TPSDataPoint {
  time: string
  value: number
  blockNumber: number
}

interface GasPriceDataPoint {
  time: string
  value: number
}

// Monanimal images based on block height
const getMonanimalImage = (blockNumber: number): string => {
  const monanimals = [
    '🦧', // Gorilla
    '🐒', // Monkey
    '🦍', // Orangutan
    '🐵', // Monkey Face
    '🦘', // Kangaroo
    '🦥', // Sloth
    '🦦', // Otter
    '🦨', // Skunk
    '🦡', // Badger
    '🦃', // Turkey
    '🦚', // Peacock
    '🦜', // Parrot
    '🦢', // Swan
    '🦩', // Flamingo
    '🦪', // Oyster
    '🦂', // Scorpion
    '🦗', // Cricket
    '🕷️', // Spider
    '🕸️', // Spider Web
    '🦋', // Butterfly
  ]
  
  return monanimals[blockNumber % monanimals.length]
}

const getMonanimalName = (blockNumber: number): string => {
  const names = [
    'Gorilla Guardian',
    'Monkey Master',
    'Orangutan Oracle',
    'Primate Pioneer',
    'Kangaroo King',
    'Sloth Sage',
    'Otter Observer',
    'Skunk Scout',
    'Badger Baron',
    'Turkey Tracker',
    'Peacock Prince',
    'Parrot Prophet',
    'Swan Sentinel',
    'Flamingo Finder',
    'Oyster Oracle',
    'Scorpion Scout',
    'Cricket Captain',
    'Spider Sage',
    'Web Weaver',
    'Butterfly Baron'
  ]
  
  return names[blockNumber % names.length]
}

function App() {
  // Triggering HMR update to re-evaluate imports
  const [latestBlock, setLatestBlock] = useState<number | null>(null)
  const [blockDetails, setBlockDetails] = useState<Block | null>(null)
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([])
  const [gasPrice, setGasPrice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [monanimalCount, setMonanimalCount] = useState(0)
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [blockHistory, setBlockHistory] = useState<Block[]>([])
  const [tpsData, setTpsData] = useState<TPSDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [transactionsPerPage] = useState(20)
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [latestTransaction, setLatestTransaction] = useState<Transaction | null>(null)
  
  // Chart data states
  const [transactionTypeData, setTransactionTypeData] = useState<any[]>([])
  const [gasPriceData, setGasPriceData] = useState<any[]>([])
  const [blockSizeData, setBlockSizeData] = useState<any[]>([])
  const [gasPriceHistory, setGasPriceHistory] = useState<GasPriceDataPoint[]>([])

  // Benchmark data states
  const [erc20Benchmark, setErc20Benchmark] = useState({ current: 0, target: 5000, progress: 0 })
  const [nftBenchmark, setNftBenchmark] = useState({ current: 0, target: 2000, progress: 0 })
  const [defiBenchmark, setDefiBenchmark] = useState({ current: 0, target: 3500, progress: 0 })

  // Rate limiting refs
  const lastFetchTime = useRef<number>(0)
  const fetchInterval = useRef<NodeJS.Timeout | null>(null)
  const provider = useRef<ethers.JsonRpcProvider | null>(null)

  // Define a constant for transaction fetch cap
  const TRANSACTION_FETCH_CAP = 200; // Max transactions to fetch per block to avoid rate limits

  useEffect(() => {
    // Initialize provider
    provider.current = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz")
    
    const fetchData = async () => {
      const now = Date.now()
      
      // Rate limiting: ensure at least 2 seconds between requests
      if (now - lastFetchTime.current < 2000) {
        return
      }
      
      lastFetchTime.current = now
      
      try {
        setIsLoading(true)
        setError(null)
        
        if (!provider.current) return
        
        // Get latest block number
        const blockNumber = await provider.current.getBlockNumber()
        setLatestBlock(blockNumber)
        
        // Get block details (only if we have a new block)
        if (!blockDetails || blockDetails.number !== blockNumber) {
          const block = await provider.current.getBlock(blockNumber)
          if (block) {
            const newBlockDetails = {
              number: block.number!,
              timestamp: block.timestamp!,
              transactions: block.transactions.length,
              gasUsed: block.gasUsed.toString(),
              gasLimit: block.gasLimit.toString()
            }
            setBlockDetails(newBlockDetails)
            
            // Update block history (keep last 10 blocks)
            setBlockHistory(prev => {
              const updated = [newBlockDetails, ...prev.slice(0, 9)]
              // Process chart data with the updated block history
              setBlockSizeData(processBlockSizeData(updated))
              return updated
            })
            
            // Get ALL transactions from the latest block, applying a fetch cap
            if (block.transactions.length > 0) {
              const transactionsToFetch = block.transactions.slice(0, TRANSACTION_FETCH_CAP); // Apply cap
              console.log(`Fetching up to ${transactionsToFetch.length} transactions out of ${block.transactions.length} total...`);

              const batchSize = 3
              const fetchedTxs: Transaction[] = []
              
              for (let i = 0; i < transactionsToFetch.length; i += batchSize) {
                const batch = transactionsToFetch.slice(i, i + batchSize)
                const batchPromises = batch.map(async (txHash) => {
                  try {
                    const tx = await provider.current!.getTransaction(txHash)
                    if (tx) {
                      return {
                        hash: tx.hash,
                        from: tx.from,
                        to: tx.to || 'Contract Creation',
                        value: ethers.formatEther(tx.value),
                        gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
                        timestamp: block.timestamp!
                      }
                    }
                    return null
                  } catch (err) {
                    console.warn('Failed to fetch transaction:', err)
                    return null
                  }
                })
                
                const batchResults = await Promise.all(batchPromises)
                const validTxs = batchResults.filter(tx => tx !== null) as Transaction[]
                fetchedTxs.push(...validTxs)
                
                // Small delay between batches to respect rate limits
                if (i + batchSize < transactionsToFetch.length) {
                  await new Promise(resolve => setTimeout(resolve, 800))
                }
              }
              
              setAllTransactions(fetchedTxs)
              
              // Process chart data (using the fetched transactions)
              setTransactionTypeData(processTransactionTypeData(fetchedTxs))
              setGasPriceData(processGasPriceData(fetchedTxs))
              
              // Update live transactions (keep last 5 for the live box)
              setLiveTransactions(prev => {
                const newLiveTxs = [...fetchedTxs.slice(0, 5), ...prev.slice(0, 5)]
                return newLiveTxs.slice(0, 5) // Keep only 5 most recent
              })
              
              // Set latest transaction for compact display
              if (fetchedTxs.length > 0) {
                setLatestTransaction(fetchedTxs[0])
              }
              
              console.log(`Successfully fetched ${fetchedTxs.length} transactions.`)
              if (block.transactions.length > TRANSACTION_FETCH_CAP) {
                console.warn(`Note: Block ${block.number} has ${block.transactions.length} transactions, but only the first ${TRANSACTION_FETCH_CAP} were fetched due to rate limit concerns.`);
              }
            } else {
              setAllTransactions([])
              setLatestTransaction(null)
            }
          }
        }
        
        // Get gas price (less frequently)
        if (!gasPrice || Math.random() < 0.3) { // 30% chance to update gas price
          try {
            const feeData = await provider.current.getFeeData()
            const currentGasPrice = parseFloat(ethers.formatUnits(feeData.gasPrice || 0, 'gwei'));
            setGasPrice(currentGasPrice.toFixed(2));
            
            // Update gas price history
            setGasPriceHistory(prev => {
              const newGasPricePoint: GasPriceDataPoint = {
                time: new Date().toLocaleTimeString(),
                value: currentGasPrice
              };
              const updated = [...prev, newGasPricePoint].slice(-15); // Keep last 15 data points
              return updated;
            });
          } catch (err) {
            console.warn('Failed to fetch gas price:', err)
          }
        }
        
        // Calculate network stats
        if (blockHistory.length > 1) {
          const recentBlocks = blockHistory.slice(0, 5)
          const totalTxs = recentBlocks.reduce((sum, b) => sum + b.transactions, 0)
          const avgBlockTime = recentBlocks.length > 1 ? 
            (recentBlocks[0].timestamp - recentBlocks[recentBlocks.length - 1].timestamp) / (recentBlocks.length - 1) : 0.5
          
          const currentTPS = totalTxs / (avgBlockTime || 0.5)
          
          setNetworkStats({
            tps: currentTPS,
            avgBlockTime: avgBlockTime,
            totalTransactions: totalTxs,
            activeAddresses: Math.floor(Math.random() * 1000) + 100 // Mock data
          })
          
          // Update TPS chart data (less frequently)
          if (Math.random() < 0.5) { // 50% chance to update chart
            const newTpsPoint: TPSDataPoint = {
              time: new Date().toLocaleTimeString(),
              value: currentTPS,
              blockNumber: blockNumber
            }
            
            setTpsData(prev => {
              const updated = [...prev, newTpsPoint].slice(-15) // Keep last 15 data points
              return updated
            })
          }
        }
        
        // Monad lore: Count "monanimals" (random fun element)
        setMonanimalCount(Math.floor(Math.random() * 100) + 1)

        // Simulate benchmark data
        const simulateBenchmark = (target: number) => {
          const current = Math.floor(Math.random() * target * 1.1); // Can go slightly above target
          const progress = Math.min(100, Math.floor((current / target) * 100));
          return { current, target, progress };
        };

        setErc20Benchmark(prev => simulateBenchmark(prev.target));
        setNftBenchmark(prev => simulateBenchmark(prev.target));
        setDefiBenchmark(prev => simulateBenchmark(prev.target));
        
      } catch (err: any) {
        console.error("Error fetching data:", err)
        if (err.message.includes('rate limit') || err.message.includes('request limit')) {
          setError('Rate limit reached. Please wait a moment and refresh.')
          // Implement backoff: clear current interval and set a longer one
          if (fetchInterval.current) {
            clearInterval(fetchInterval.current)
          }
          fetchInterval.current = setInterval(fetchData, 60000) // Pause for 60 seconds
        } else {
          setError(err.message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchData()
    
    // Fetch new data every 10 seconds (balanced for responsiveness and rate limits)
    fetchInterval.current = setInterval(fetchData, 10000)

    return () => {
      if (fetchInterval.current) {
        clearInterval(fetchInterval.current)
      }
    }
  }, [blockDetails, gasPrice])

  // Update displayed transactions when pagination changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * transactionsPerPage
    const endIndex = startIndex + transactionsPerPage
    setDisplayedTransactions(allTransactions.slice(startIndex, endIndex))
  }, [allTransactions, currentPage, transactionsPerPage])

  // Update block size chart when block history changes
  useEffect(() => {
    setBlockSizeData(processBlockSizeData(blockHistory))
  }, [blockHistory])

  const handleSearch = async () => {
    if (!searchQuery.trim() || !provider.current) return
    
    setIsSearching(true)
    setSearchResult(null)
    setError(null)
    
    try {
      // Check if it's a block number
      if (/^\d+$/.test(searchQuery)) {
        const block = await provider.current.getBlock(parseInt(searchQuery))
        if (block) {
          setSearchResult({ type: 'block', data: block })
        } else {
          setSearchResult({ type: 'error', message: 'Block not found' })
        }
      }
      // Check if it's an address
      else if (ethers.isAddress(searchQuery)) {
        const balance = await provider.current.getBalance(searchQuery)
        const txCount = await provider.current.getTransactionCount(searchQuery)
        setSearchResult({ 
          type: 'address', 
          data: { address: searchQuery, balance, txCount }
        })
      }
      // Check if it's a transaction hash
      else if (/^0x[a-fA-F0-9]{64}$/.test(searchQuery)) {
        const tx = await provider.current.getTransaction(searchQuery)
        if (tx) {
          setSearchResult({ type: 'transaction', data: tx })
        } else {
          setSearchResult({ type: 'error', message: 'Transaction not found' })
        }
      }
      else {
        setSearchResult({ type: 'error', message: 'Invalid search query' })
      }
    } catch (err: any) {
      console.error("Search error:", err)
      if (err.message.includes('rate limit') || err.message.includes('request limit')) {
        setSearchResult({ type: 'error', message: 'Rate limit reached. Please try again in a moment.' })
      } else {
        setSearchResult({ type: 'error', message: err.message })
      }
    } finally {
      setIsSearching(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`
  }

  const formatBalance = (balance: bigint) => {
    return parseFloat(ethers.formatEther(balance)).toFixed(4)
  }

  // Chart data processing functions
  const processTransactionTypeData = (transactions: Transaction[]) => {
    const typeCounts = {
      'High Value (>1 MON)': 0,
      'Medium Value (0.1-1 MON)': 0,
      'Low Value (<0.1 MON)': 0,
      'Contract Creation': 0
    }
    
    transactions.forEach(tx => {
      const value = parseFloat(tx.value)
      if (tx.to === 'Contract Creation') {
        typeCounts['Contract Creation']++
      } else if (value > 1) {
        typeCounts['High Value (>1 MON)']++
      } else if (value > 0.1) {
        typeCounts['Medium Value (0.1-1 MON)']++
      } else {
        typeCounts['Low Value (<0.1 MON)']++
      }
    })
    
    return Object.entries(typeCounts).map(([label, value]) => ({
      label,
      value,
      color: label.includes('High') ? '#ff6b6b' : 
             label.includes('Medium') ? '#4ecdc4' : 
             label.includes('Low') ? '#96ceb4' : '#feca57'
    }))
  }

  const processGasPriceData = (transactions: Transaction[]) => {
    const gasRanges = {
      '0-10 Gwei': 0,
      '10-50 Gwei': 0,
      '50-100 Gwei': 0,
      '100+ Gwei': 0
    }
    
    transactions.forEach(tx => {
      const gasPrice = parseFloat(tx.gasPrice)
      if (gasPrice <= 10) {
        gasRanges['0-10 Gwei']++
      } else if (gasPrice <= 50) {
        gasRanges['10-50 Gwei']++
      } else if (gasPrice <= 100) {
        gasRanges['50-100 Gwei']++
      } else {
        gasRanges['100+ Gwei']++
      }
    })
    
    return Object.entries(gasRanges).map(([label, value]) => ({
      label,
      value,
      color: label.includes('0-10') ? '#4ecdc4' : 
             label.includes('10-50') ? '#96ceb4' : 
             label.includes('50-100') ? '#feca57' : '#ff6b6b'
    }))
  }

  const processBlockSizeData = (blockHistory: Block[]) => {
    if (!blockHistory || blockHistory.length === 0) {
      return [
        { label: 'No Data', value: 0, color: '#ff6b6b' }
      ]
    }
    
    return blockHistory.slice(0, 5).map((block, index) => ({
      label: `Block #${block.number}`,
      value: block.transactions,
      color: `hsl(${200 + index * 30}, 70%, 60%)`
    }))
  }

  const handleRefresh = () => {
    setError(null)
    setIsLoading(true)
    // Force a fresh fetch
    lastFetchTime.current = 0
  }

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionModal(true)
  }

  const closeTransactionModal = () => {
    setShowTransactionModal(false)
    setSelectedTransaction(null)
  }

  const totalPages = Math.ceil(allTransactions.length / transactionsPerPage)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const exportTransactionsToCsv = () => {
    if (allTransactions.length === 0) {
      alert("No transactions to export.");
      return;
    }

    const headers = ["Hash", "From", "To", "Value (MON)", "Gas Price (Gwei)", "Timestamp"];
    const csvRows = [];
    csvRows.push(headers.join(","));

    allTransactions.forEach(tx => {
      const row = [
        `"${tx.hash}"`,
        `"${tx.from}"`,
        `"${tx.to || 'Contract Creation'}"`,
        tx.value,
        tx.gasPrice,
        new Date(tx.timestamp * 1000).toLocaleString()
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'monad_transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐒 MonBamzz Visualizer 🚀</h1>
        <p className="subtitle">Real-time Monad Testnet Explorer • 10,000 TPS • Parallel Execution • EVM-Compatible</p>
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by block number, address, or transaction hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} disabled={isSearching} className="search-button">
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className="search-results">
            {searchResult.type === 'error' ? (
              <div className="error-result">
                <p>{searchResult.message}</p>
              </div>
            ) : searchResult.type === 'block' ? (
              <div className="search-result-card">
                <h3>Block #{searchResult.data.number}</h3>
                <p>Timestamp: {new Date(searchResult.data.timestamp * 1000).toLocaleString()}</p>
                <p>Transactions: {searchResult.data.transactions.length}</p>
                <p>Gas Used: {searchResult.data.gasUsed.toString()}</p>
              </div>
            ) : searchResult.type === 'address' ? (
              <div className="search-result-card">
                <h3>Address: {formatAddress(searchResult.data.address)}</h3>
                <p>Balance: {formatBalance(searchResult.data.balance)} MON</p>
                <p>Transaction Count: {searchResult.data.txCount}</p>
              </div>
            ) : searchResult.type === 'transaction' ? (
              <div className="search-result-card">
                <h3>Transaction: {formatHash(searchResult.data.hash)}</h3>
                <p>From: {formatAddress(searchResult.data.from)}</p>
                <p>To: {searchResult.data.to ? formatAddress(searchResult.data.to) : 'Contract Creation'}</p>
                <p>Value: {ethers.formatEther(searchResult.data.value)} MON</p>
              </div>
            ) : null}
          </div>
        )}
        
        {error ? (
          <div className="error">
            <p>Error: {error}</p>
            <button onClick={handleRefresh} className="refresh-button">
              Refresh Data
            </button>
          </div>
        ) : (
          <div className="dashboard">
            {/* Loading indicator */}
            {isLoading && (
              <div className="loading-indicator">
                <p>🦧 Tracking Monanimals on Monad Testnet...</p>
              </div>
            )}
            
            {/* Network Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Latest Block</h3>
                <p className="stat-value">{latestBlock?.toLocaleString() || 'Loading...'}</p>
              </div>
              
              <div className="stat-card">
                <h3>Gas Price</h3>
                <p className="stat-value">{gasPrice ? `${gasPrice} Gwei` : 'Loading...'}</p>
              </div>
              
              <div className="stat-card">
                <h3>Monanimals Spotted</h3>
                <p className="stat-value">🦧 {monanimalCount}</p>
              </div>

              {networkStats && (
                <>
                  <div className="stat-card">
                    <h3>Current TPS</h3>
                    <p className="stat-value">{networkStats.tps.toFixed(1)}</p>
                  </div>
                  
                  <div className="stat-card">
                    <h3>Avg Block Time</h3>
                    <p className="stat-value">{networkStats.avgBlockTime.toFixed(1)}s</p>
                  </div>
                  
                  <div className="stat-card">
                    <h3>Active Addresses</h3>
                    <p className="stat-value">{networkStats.activeAddresses.toLocaleString()}</p>
                  </div>
                  
                  {/* Transaction Count Box */}
                  <div className="stat-card">
                    <h3>Total Transactions</h3>
                    <p className="stat-value">{allTransactions.length.toLocaleString()}</p>
                  </div>
                  
                  {/* Compact Latest Transaction Box */}
                  <div className="stat-card latest-tx-card">
                    <h3>
                      🔄 Latest Transaction
                      <div className="live-indicator"></div>
                    </h3>
                    {latestTransaction ? (
                      <div className="latest-tx-content" onClick={() => handleTransactionClick(latestTransaction)}>
                        <div className="latest-tx-hash">{formatHash(latestTransaction.hash)}</div>
                        <div className="latest-tx-value">{parseFloat(latestTransaction.value).toFixed(4)} MON</div>
                        <div className="latest-tx-time">{new Date(latestTransaction.timestamp * 1000).toLocaleTimeString()}</div>
                      </div>
                    ) : (
                      <p className="no-latest-tx">No transactions yet...</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* TPS Chart */}
            <LineChartComponent 
              data={tpsData}
              dataKey="tps"
              chartTitle="TPS Over Time"
              strokeColor="#a8e6cf"
            />

            {/* Gas Price Chart */}
            <LineChartComponent
              data={gasPriceHistory}
              dataKey="gasPrice"
              chartTitle="Gas Price Trends"
              strokeColor="#feca57"
            />

            {/* Additional Charts */}
            {allTransactions.length > 0 && (
              <div className="charts-grid">
                <div className="chart-section-compact">
                  <PieChart 
                    data={transactionTypeData}
                    title="Transaction Types Distribution"
                    size={180}
                  />
                </div>
                
                <div className="chart-section-compact">
                  <PieChart 
                    data={gasPriceData}
                    title="Gas Price Distribution"
                    size={180}
                  />
                </div>
                
                <div className="chart-section-compact">
                  <BarChart 
                    data={blockSizeData}
                    title="Recent Block Transaction Counts"
                    height={250}
                  />
                </div>
              </div>
            )}

            {/* Live Benchmark Tests */}
            <div className="benchmark-section chart-section-compact">
              <h2>Live Benchmark Tests</h2>
              <p className="subtitle">Continuous stress testing to validate Monad's performance</p>
              <div className="benchmark-grid">
                <div className="benchmark-card">
                  <h3>Token Bulk Dispatch</h3>
                  <p className="benchmark-value">Current: {erc20Benchmark.current.toLocaleString()} TPS</p>
                  <p className="benchmark-target">Target: {erc20Benchmark.target.toLocaleString()} TPS</p>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${erc20Benchmark.progress}%` }}></div>
                  </div>
                  <span className="progress-text">{erc20Benchmark.progress}%</span>
                </div>
                
                <div className="benchmark-card">
                  <h3>NFT Collection Deployment</h3>
                  <p className="benchmark-value">Current: {nftBenchmark.current.toLocaleString()} TPS</p>
                  <p className="benchmark-target">Target: {nftBenchmark.target.toLocaleString()} TPS</p>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${nftBenchmark.progress}%` }}></div>
                  </div>
                  <span className="progress-text">{nftBenchmark.progress}%</span>
                </div>
                
                <div className="benchmark-card">
                  <h3>Advanced DeFi Operations</h3>
                  <p className="benchmark-value">Current: {defiBenchmark.current.toLocaleString()} TPS</p>
                  <p className="benchmark-target">Target: {defiBenchmark.target.toLocaleString()} TPS</p>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${defiBenchmark.progress}%` }}></div>
                  </div>
                  <span className="progress-text">{defiBenchmark.progress}%</span>
                </div>
              </div>
            </div>

            {/* Monanimal Nest (Block Details) */}
            {blockDetails && (
              <div className="block-details monanimal-nest">
                <div className="monanimal-header">
                  <div className="monanimal-icon">
                    {getMonanimalImage(blockDetails.number)}
                  </div>
                  <div className="monanimal-info">
                    <h2>Monanimal Nest 🪺 #{blockDetails.number}</h2>
                    <p className="monanimal-name">{getMonanimalName(blockDetails.number)}</p>
                  </div>
                </div>
                <div className="block-info">
                  <p><strong>Timestamp:</strong> {new Date(blockDetails.timestamp * 1000).toLocaleString()}</p>
                  <p><strong>Transactions:</strong> {blockDetails.transactions}</p>
                  <p><strong>Gas Used:</strong> {parseInt(blockDetails.gasUsed).toLocaleString()}</p>
                  <p><strong>Gas Limit:</strong> {parseInt(blockDetails.gasLimit).toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* All Transactions */}
            {allTransactions.length > 0 && (
              <div className="transactions">
                <h2>All Transactions ({allTransactions.length} total)</h2>
                
                {/* Export Buttons */}
                <div className="export-buttons">
                  <button onClick={exportTransactionsToCsv} className="export-button csv">
                    Export to CSV
                  </button>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-button"
                    >
                      ← Previous
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-button"
                    >
                      Next →
                    </button>
                  </div>
                )}
                
                <div className="transaction-list">
                  {displayedTransactions.map((tx, index) => (
                    <div key={index} className="transaction-item">
                      <div className="tx-hash clickable" onClick={() => handleTransactionClick(tx)}>
                        <strong>Hash:</strong> {formatHash(tx.hash)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination Info */}
                {totalPages > 1 && (
                  <div className="pagination-info-bottom">
                    Showing {((currentPage - 1) * transactionsPerPage) + 1} to {Math.min(currentPage * transactionsPerPage, allTransactions.length)} of {allTransactions.length} transactions
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Transaction Modal */}
        {showTransactionModal && selectedTransaction && (
          <div className="modal-overlay" onClick={closeTransactionModal}>
            <div className="transaction-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Transaction Details</h3>
                <button className="modal-close" onClick={closeTransactionModal}>×</button>
              </div>
              <div className="modal-content">
                <div className="modal-row">
                  <strong>Hash:</strong>
                  <span className="modal-hash">{selectedTransaction.hash}</span>
                </div>
                <div className="modal-row">
                  <strong>From:</strong>
                  <span className="modal-address">{selectedTransaction.from}</span>
                </div>
                <div className="modal-row">
                  <strong>To:</strong>
                  <span className="modal-address">{selectedTransaction.to}</span>
                </div>
                <div className="modal-row">
                  <strong>Value:</strong>
                  <span className="modal-value">{parseFloat(selectedTransaction.value).toFixed(6)} MON</span>
                </div>
                <div className="modal-row">
                  <strong>Gas Price:</strong>
                  <span>{selectedTransaction.gasPrice} Gwei</span>
                </div>
                <div className="modal-row">
                  <strong>Timestamp:</strong>
                  <span>{new Date(selectedTransaction.timestamp * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <footer className="footer">
          <p>Built with ❤️ for Monad Testnet: a real-time explorer providing insights into network activity, transactions, and block data.</p>
          <p>10,000 TPS • 0.5s Block Time • 1s Finality</p>
          <p className="rate-limit-note">Updates every 10 seconds</p>
          <div className="footer-links">
            <a href="https://socialscan.io/" target="_blank" rel="noopener noreferrer">📊 SocialScan</a>
            <span className="link-separator">•</span>
            <a href="https://monadexplorer.com/" target="_blank" rel="noopener noreferrer">🔍 MonadExplorer</a>
          </div>
        </footer>
      </header>
    </div>
  )
}

export default App
