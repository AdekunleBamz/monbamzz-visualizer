# 🐒 Monad Testnet Visualizer 🚀

A comprehensive real-time dashboard for monitoring Monad Testnet activity, built for the Monad Testnet Visualizer Contest.

## ✨ Features

- **Real-time Block Monitoring**: Live updates of the latest block number every 10 seconds
- **Network Statistics**: Current gas price, TPS, block time, and network performance metrics
- **Interactive Search**: Search by block number, address, or transaction hash
- **TPS Chart**: Real-time visualization of transactions per second over time
- **Block Details**: Comprehensive information about the latest block including timestamp, transaction count, and gas usage
- **Recent Transactions**: Live feed of recent transactions with detailed information
- **Monad Lore Integration**: Fun "Monanimals" counter for bonus points
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Beautiful gradient background with glassmorphism effects

## 🛠️ Technical Stack

- **Frontend**: React 18 with TypeScript
- **Blockchain Integration**: Ethers.js v6
- **Data Visualization**: Recharts
- **Styling**: CSS3 with modern design patterns
- **Build Tool**: Vite
- **Network**: Monad Testnet (Chain ID: 10143)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd monad-visualizer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
monad-visualizer/
├── src/
│   ├── App.tsx              # Main application component
│   ├── App.css              # Styling for the application
│   ├── main.tsx             # Application entry point
│   ├── components/
│   │   └── TPSChart.tsx     # TPS visualization component
│   └── assets/              # Static assets
├── public/                  # Public assets
├── package.json             # Project dependencies and scripts
└── README.md               # Project documentation
```

## 📊 Features in Detail

### Network Statistics
- **Latest Block**: Real-time display of the current block number
- **Gas Price**: Current network gas price in Gwei
- **Current TPS**: Real-time transactions per second calculation
- **Average Block Time**: Network performance metric
- **Active Addresses**: Network activity indicator
- **Monanimals Spotted**: A fun, random counter that changes with each update (Monad lore integration)

### Interactive Search
- **Block Search**: Enter a block number to view block details
- **Address Search**: Search for wallet addresses to see balance and transaction count
- **Transaction Search**: Look up specific transactions by hash
- **Real-time Results**: Instant search results with detailed information

### TPS Visualization
- **Real-time Chart**: Line chart showing TPS over time
- **Historical Data**: Tracks the last 20 data points
- **Interactive Tooltips**: Hover for detailed information
- **Responsive Design**: Adapts to different screen sizes

### Block Information
- Block number and timestamp
- Number of transactions in the block
- Gas used and gas limit
- Formatted for easy reading

### Transaction Feed
- Recent transactions from the latest block
- Transaction hash (truncated for readability)
- Sender and recipient addresses (truncated)
- Transaction value in MON
- Gas price for each transaction

## 🔗 Monad Testnet Integration

The visualizer connects to Monad Testnet using the official RPC endpoint:
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **Chain ID**: `10143`
- **Currency**: MON

## 🏆 Contest Submission

This project is built for the **Monad Testnet Visualizer Contest** with the following features:

✅ **Custom Frontend**: Built from scratch using React and TypeScript
✅ **Real-time Data**: Live updates from Monad Testnet every 10 seconds
✅ **Correct Information**: All data is fetched directly from the blockchain
✅ **No Individual Farming**: Focuses on network-wide metrics
✅ **Advanced Analytics**: TPS tracking, search functionality, and detailed statistics
✅ **Bonus Points**: 
- 🦧 **Silly/Left Curve**: "Monanimals Spotted" counter with random updates
- 🐒 **Monad Lore**: Integration of "monanimals" concept throughout the interface

## ⚡ Performance Features

- **10,000 TPS**: Monad's incredible transaction throughput
- **0.5s Block Time**: Ultra-fast block generation
- **1s Finality**: Near-instant transaction finality
- **EVM Compatible**: Full Ethereum compatibility

## 🎨 UI/UX Highlights

- **Glassmorphism Design**: Modern glass-like effects with backdrop blur
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Smooth Animations**: Hover effects and transitions
- **Color-coded Information**: Easy-to-read data presentation
- **Loading States**: Graceful loading indicators
- **Error Handling**: User-friendly error messages

## 🔍 Search Examples

- **Block**: `21207406`
- **Address**: `0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6`
- **Transaction**: `0x347f6c0c98a6cec9e27990968a2b5465d06de9fddebdf1cdb8fed7692e60d0ca`

## 🤝 Contributing

This is a contest submission for the Monad Testnet Visualizer Contest. Feel free to fork and enhance!

## 📄 License

MIT License - feel free to use this code for your own projects.

---

**Built with ❤️ for the Monad ecosystem**
