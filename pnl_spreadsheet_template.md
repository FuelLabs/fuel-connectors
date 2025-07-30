# O2 Spot PnL Tracking - Google Sheets Template

## Sheet 1: Multi-Asset Portfolio Example

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Date** | **Type** | **Asset** | **Quote** | **Price** | **Quantity** | **Total Value** | **Running Balance** | **Avg Entry Price** | **Realized PnL** | **Unrealized PnL** | **Total PnL** | **ETH Realized** | **ETH Unrealized** | **ETH Total** | **BTC Realized** | **BTC Unrealized** | **BTC Total** | **Total Realized** | **Total Unrealized** | **Total Portfolio PnL** | **ETH Prev Balance** | **ETH Prev Avg Price** | **BTC Prev Balance** | **BTC Prev Avg Price** |

**Formulas (starting from row 4):**
- **G (Total Value)**: `=E4*F4`
- **H (Running Balance)**: `=IF(B4="BUY",IF(C4="ETH",W4+F4,IF(C4="BTC",Y4+F4,0)),IF(B4="SELL",IF(C4="ETH",W4-F4,IF(C4="BTC",Y4-F4,0)),0))`
- **I (Avg Entry Price)**: `=IF(B4="BUY",IF(C4="ETH",IF(W4=0,E4,(X4*W4+E4*F4)/(W4+F4)),IF(C4="BTC",IF(Y4=0,E4,(Z4*Y4+E4*F4)/(Y4+F4)),E4)),IF(C4="ETH",X4,IF(C4="BTC",Z4,0)))`
- **J (Realized PnL)**: `=IF(B4="SELL",IF(ROW()=4,0,IF(C4=C3,(E4-I3)*F4,0)),0)`
- **K (Unrealized PnL)**: `=IF(ROW()=4,0,IF(H4>0,(E4-I4)*H4,0))`
- **L (Total PnL)**: `=J4+K4`
- **M (ETH Realized)**: `=IF(C4="ETH",J4,IF(ROW()=4,0,M3))`
- **N (ETH Unrealized)**: `=IF(C4="ETH",K4,IF(ROW()=4,0,N3))`
- **O (ETH Total)**: `=M4+N4`
- **P (BTC Realized)**: `=IF(C4="BTC",J4,IF(ROW()=4,0,P3))`
- **Q (BTC Unrealized)**: `=IF(C4="BTC",K4,IF(ROW()=4,0,Q3))`
- **R (BTC Total)**: `=P4+Q4`
- **S (Total Realized)**: `=M4+P4`
- **T (Total Unrealized)**: `=N4+Q4`
- **U (Total Portfolio PnL)**: `=S4+T4`
- **W (ETH Prev Balance)**: `=IF(ROW()=4,0,SUMIFS(F$3:F3,C$3:C3,"ETH",B$3:B3,"BUY")-SUMIFS(F$3:F3,C$3:C3,"ETH",B$3:B3,"SELL"))`
- **X (ETH Prev Avg Price)**: `=IF(ROW()=4,0,IF(COUNTIF(C$3:C3,"ETH")>0,INDEX(I$3:I3,MAX(FILTER(ROW(C$3:C3)-ROW(C$3)+1,C$3:C3="ETH"))),0))`
- **Y (BTC Prev Balance)**: `=IF(ROW()=4,0,SUMIFS(F$3:F3,C$3:C3,"BTC",B$3:B3,"BUY")-SUMIFS(F$3:F3,C$3:C3,"BTC",B$3:B3,"SELL"))`
- **Z (BTC Prev Avg Price)**: `=IF(ROW()=4,0,IF(COUNTIF(C$3:C3,"BTC")>0,INDEX(I$3:I3,MAX(FILTER(ROW(C$3:C3)-ROW(C$3)+1,C$3:C3="BTC"))),0))`

## Sheet 2: PnL Summary Dashboard

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| **Asset** | **Current Balance** | **Avg Entry Price** | **Current Price** | **Realized PnL** | **Unrealized PnL** | **Total PnL** | **ETH Total** | **BTC Total** | **Portfolio Total** |

**Formulas:**
- **B**: `=SUMIFS(Sheet1!H:H,Sheet1!C:C,A2)`
- **C**: `=AVERAGEIFS(Sheet1!I:I,Sheet1!C:C,A2)`
- **D**: `=VLOOKUP(A2,PriceFeed!A:B,2,FALSE)` (Reference to price feed)
- **E**: `=SUMIFS(Sheet1!J:J,Sheet1!C:C,A2)`
- **F**: `=IF(B2>0,(D2-C2)*B2,0)`
- **G**: `=E2+F2`
- **H**: `=SUMIFS(Sheet1!O:O,Sheet1!A:A,"<="&TODAY())`
- **I**: `=SUMIFS(Sheet1!R:R,Sheet1!A:A,"<="&TODAY())`
- **J**: `=H2+I2`

## Sheet 3: Period Filtering

### 1D PnL
`=SUMIFS(Sheet1!S:S,Sheet1!A:A,">="&TODAY()-1)+SUMIFS(Sheet1!T:T,Sheet1!A:A,">="&TODAY()-1)`

### 1W PnL
`=SUMIFS(Sheet1!S:S,Sheet1!A:A,">="&TODAY()-7)+SUMIFS(Sheet1!T:T,Sheet1!A:A,">="&TODAY()-7)`

### 1M PnL
`=SUMIFS(Sheet1!S:S,Sheet1!A:A,">="&EOMONTH(TODAY(),-1)+1)+SUMIFS(Sheet1!T:T,Sheet1!A:A,">="&EOMONTH(TODAY(),-1)+1)`

### YTD PnL
`=SUMIFS(Sheet1!S:S,Sheet1!A:A,">="&DATE(YEAR(TODAY()),1,1))+SUMIFS(Sheet1!T:T,Sheet1!A:A,">="&DATE(YEAR(TODAY()),1,1))` 