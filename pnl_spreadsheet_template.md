# O2 Spot PnL Tracking - Google Sheets Template

## Sheet 1: Multi-Asset Portfolio Example

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z | AA | AB | AC | AD |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Date** | **Type** | **Asset** | **Quote** | **Price** | **Quantity** | **Total Value** | **Running Balance** | **Open Entry Value** | **Open Current Value** | **Avg Entry Price** | **Realized PnL** | **Unrealized PnL** | **Total PnL** | **ETH Realized** | **ETH Unrealized** | **ETH Total** | **BTC Realized** | **BTC Unrealized** | **BTC Total** | **Total Realized** | **Total Unrealized** | **Total Portfolio PnL** | **ETH Prev Balance** | **ETH Prev Avg Price** | **BTC Prev Balance** | **BTC Prev Avg Price** | **ETH Prev Realized** | **BTC Prev Realized** |

**Formulas (starting from row 4):**
- **G (Total Value)**: `=E4*F4`
- **H (Running Balance)**: `=IF(B4="BUY",IF(C4="ETH",Y4+F4,IF(C4="BTC",AA4+F4,0)),IF(B4="SELL",IF(C4="ETH",Y4-F4,IF(C4="BTC",AA4-F4,0)),0))`
- **I (Open Entry Value)**: `=H4*K4`
- **J (Open Current Value)**: `=H4*E4`
- **K (Avg Entry Price)**: `=IF(B4="BUY",IF(C4="ETH",IF(Y4=0,E4,(Z4*Y4+E4*F4)/(Y4+F4)),IF(C4="BTC",IF(AA4=0,E4,(AB4*AA4+E4*F4)/(AA4+F4)),E4)),IF(C4="ETH",Z4,IF(C4="BTC",AB4,0)))`
- **L (Realized PnL)**: `=IF(B4="SELL",IF(ROW()=4,0,(E4-K4)*F4),0)`
- **M (Unrealized PnL)**: `=IF(ROW()=4,0,IF(H4>0,J4-I4,0))`
- **N (Total PnL)**: `=L4+M4`
- **O (ETH Realized)**: `=IF(C4="ETH",IF(B4="SELL",AC4+L4,AC4),AC4)`
- **P (ETH Unrealized)**: `=IF(C4="ETH",M4,IF(ROW()=4,0,P3))`
- **Q (ETH Total)**: `=O4+P4`
- **R (BTC Realized)**: `=IF(C4="BTC",IF(B4="SELL",AD4+L4,AD4),AD4)`
- **S (BTC Unrealized)**: `=IF(C4="BTC",M4,IF(ROW()=4,0,S3))`
- **T (BTC Total)**: `=R4+S4`
- **U (Total Realized)**: `=O4+R4`
- **V (Total Unrealized)**: `=P4+S4`
- **W (Total Portfolio PnL)**: `=U4+V4`
- **Y (ETH Prev Balance)**: `=IF(ROW()=4,0,SUMIFS(F$3:F3,C$3:C3,"ETH",B$3:B3,"BUY")-SUMIFS(F$3:F3,C$3:C3,"ETH",B$3:B3,"SELL"))`
- **Z (ETH Prev Avg Price)**: `=IF(ROW()=4,0,IF(COUNTIF(C$3:C3,"ETH")>0,INDEX(K$3:K3,MAX(FILTER(ROW(C$3:C3)-ROW(C$3)+1,C$3:C3="ETH"))),0))`
- **AA (BTC Prev Balance)**: `=IF(ROW()=4,0,SUMIFS(F$3:F3,C$3:C3,"BTC",B$3:B3,"BUY")-SUMIFS(F$3:F3,C$3:C3,"BTC",B$3:B3,"SELL"))`
- **AB (BTC Prev Avg Price)**: `=IF(ROW()=4,0,IF(COUNTIF(C$3:C3,"BTC")>0,INDEX(K$3:K3,MAX(FILTER(ROW(C$3:C3)-ROW(C$3)+1,C$3:C3="BTC"))),0))`
- **AC (ETH Prev Realized)**: `=IF(ROW()=4,0,IF(COUNTIF(C$3:C3,"ETH")>0,INDEX(O$3:O3,MAX(FILTER(ROW(C$3:C3)-ROW(C$3)+1,C$3:C3="ETH"))),0))`
- **AD (BTC Prev Realized)**: `=IF(ROW()=4,0,IF(COUNTIF(C$3:C3,"BTC")>0,INDEX(R$3:R3,MAX(FILTER(ROW(C$3:C3)-ROW(C$3)+1,C$3:C3="BTC"))),0))`

## Sheet 2: PnL Summary Dashboard

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| **Asset** | **Current Balance** | **Avg Entry Price** | **Current Price** | **Realized PnL** | **Unrealized PnL** | **Total PnL** | **ETH Total** | **BTC Total** | **Portfolio Total** |

**Formulas:**
- **B**: `=SUMIFS(Sheet1!H:H,Sheet1!C:C,A2)`
- **C**: `=AVERAGEIFS(Sheet1!K:K,Sheet1!C:C,A2)`
- **D**: `=VLOOKUP(A2,PriceFeed!A:B,2,FALSE)` (Reference to price feed)
- **E**: `=SUMIFS(Sheet1!L:L,Sheet1!C:C,A2)`
- **F**: `=IF(B2>0,(D2-C2)*B2,0)`
- **G**: `=E2+F2`
- **H**: `=SUMIFS(Sheet1!Q:Q,Sheet1!A:A,"<="&TODAY())`
- **I**: `=SUMIFS(Sheet1!T:T,Sheet1!A:A,"<="&TODAY())`
- **J**: `=H2+I2`

## Sheet 3: Period Filtering

### 1D PnL
`=SUMIFS(Sheet1!U:U,Sheet1!A:A,">="&TODAY()-1)+SUMIFS(Sheet1!V:V,Sheet1!A:A,">="&TODAY()-1)`

### 1W PnL
`=SUMIFS(Sheet1!U:U,Sheet1!A:A,">="&TODAY()-7)+SUMIFS(Sheet1!V:V,Sheet1!A:A,">="&TODAY()-7)`

### 1M PnL
`=SUMIFS(Sheet1!U:U,Sheet1!A:A,">="&EOMONTH(TODAY(),-1)+1)+SUMIFS(Sheet1!V:V,Sheet1!A:A,">="&EOMONTH(TODAY(),-1)+1)`

### YTD PnL
`=SUMIFS(Sheet1!U:U,Sheet1!A:A,">="&DATE(YEAR(TODAY()),1,1))+SUMIFS(Sheet1!V:V,Sheet1!A:A,">="&DATE(YEAR(TODAY()),1,1))` 