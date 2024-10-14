## 📗 Description

To enable the use of a MetaMask wallet on Fuel we use [Predicates](https://docs.fuel.network/docs/intro/glossary/#predicate) on Fuel Network, that allow transactions to be validated using a script.

Below we share a model that explains how our EVM Connector works.

```mermaid
sequenceDiagram
    participant A as Dapp
    participant B as EVM Wallet Connector
    participant C as MetaMask (EVM Wallet)

    note over A,C: List Accounts
    A->>B: fuel.accounts()
    B->>C: ethProvider.request({ "method": "eth_accounts" })
    C-->>B: ["0xa202E75a467726Ad49F76e8914c42433c1Ad821F"]
    B->>B: Create a predicate for each ETH account address
    B-->>A: ['fuel1s6cswzjfunkarjh9rlr7fdug4r04le2zec9agtudj3gkjwarlwnsw8859m']

    note over A,C: Send Transaction
    A->>B: fuel.sendTransaction("<address>", { <transaction> })
    B->>B: Hash transaction Id
    B->>C: ethProvider.request({ "method": "personal_sign" })
    C-->>B: "0xa202..<sign hash>..222"
    B->>B: Send transaction using predicate validation to Fuel Nework
    B-->>A: "0x111..<transaction ID>..222"
```