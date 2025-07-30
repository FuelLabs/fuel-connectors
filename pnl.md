# O2 Spot - PnL Feature

## PnL Feature
PnL (Profit and Loss) viewer for spot market DEX exchange targeting professional traders.

### Core PnL Calculation Methods
* All of following methods are valid and can be tax-advantageous in some jurisdictions.

#### 1. **FIFO (First In, First Out)**
- Matches oldest positions first when selling
- Example: Buy 100 ETH @ $2000, Buy 50 ETH @ $2200, Sell 75 ETH @ $2400
  - PnL = (2400 - 2000) × 75 = +$30,000
  - Remaining: 25 ETH @ $2000 + 50 ETH @ $2200

#### 2. **LIFO (Last In, First Out)**
- Matches newest positions first
- Same example: PnL = (2400 - 2200) × 50 + (2400 - 2000) × 25 = +$20,000

#### 3. **Average Cost Basis**
- Most common and intuitive for traders
- Calculates weighted average purchase price
- Example: Avg cost = (100×2000 + 50×2200) / 150 = $2066.67
- PnL = (2400 - 2066.67) × 75 = +$25,000

### MVP Approach

#### Default Calculation Method: **Average Cost Basis**
- **Rationale**: Most traders are used to consider average price to understand their position and to keep track of their investments. It's the most comprehensive way for traders to understand. 
- **Chart representation**: Can represent single price line for open positions and unrealized PnL easily on the chart.
- **Live feedback**: Average price updates as user buys/sells. PnL updates as market moves (if user has open positions). Creating a very intuitive UX for the trader to track his positions.

### MVP Features

#### 1. Consolidated PnL (Account Level)
- **Currency of PnL**: USDC
- **Total PnL**: Realized + Unrealized across all asset pairs (in USDC)
- **Prices** - For all the calculations, use the actual execution prices, instead of order prices
- **Realized Calculation**
  - Includes fees
  - Converts all realized gains/losses to USDC at the time of realization
  - Formula: (Exit Price - Entry Price) × Quantity - Total Fees (all in USDC)
- **Unrealized Calculation**
  - Does not include fees (fees are only considered when position is closed)
  - Converts current market value to USDC for consolidation of all open positions PnL in a single coin
  - Formula: (Current Price - Average Entry Price) × Current Quantity (then convert to USDC)
- **Viewer**: Show Total, Realized and Unrealized, so the user understands what is composing his total PnL.
- **Period filtering**: 1D, 1W, 1M, YTD, All-time
- **Location**: Portfolio section or dedicated PnL dashboard
- **Real-time updates**: 
  - Realized PnL updates immediately when trades are executed
  - Open position sizes update immediately when trades are executed
  - Market price changes use polling (every 10 seconds or similar strategy)
@TODO: put reference image here

#### 2. Granular PnL (Per Asset Pair)
- **Per pair tracking**: Separate PnL tracking for each asset pair (ETH/Fuel, BTC/USDC, ETH/USDC etc.)
- **Inherit Rules**: The rules from Consolidated PnL are inherited for Per Asset style.
- **Currency of PnL**: Uses the quote asset for that specific pair
- **Location**: Portfolio section or dedicated PnL dashboard

#### 3. Granular PnL (Specific for Chart Integration)
- **Inherit Rules**: The rules from Granular PnL (Per Asset Pair) are inherited for Per Asset style. (Except by the real time updates)
- **Open position line**: Horizontal line at average entry price per asset pair
- **PnL display**: Over the open position line, show unrealized PnL for open positions on the chart
- **Real-time updates**: The only difference from previous rules, is that we need to instantly update the chart PnL as market move
@TODO: put reference image here

## Edge Cases to Handle
1. **Partial fills** - Track each fill separately (remember to use always execution prices)
2. **Multiple deposits/withdrawals** - Separate from trading PnL. PnL should consider only orders, and disconsider the balance. Also when withdraw happens, it needs to disconsider open positions from that value. More information on spreadsheet.

## Post-MVP Enhancements
- Method switching (FIFO/LIFO/Average)
- Export capabilities (CSV/API)
- Advanced Analytics
  - Win/loss ratio
  - Maximum drawdown
  - Allowing user to choose his default base currency, basing the PnL of whole application to the configured one (USDC, BTC or ETH for instance)
