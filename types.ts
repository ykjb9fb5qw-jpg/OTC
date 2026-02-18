
export interface MarketPrice {
  buyFromMarket: number; // From slab (HKD -> USDT)
  sellFromMarket: number; // From grp (USDT -> HKD)
  lastUpdate: string;
  sourceSlab: string;
  sourceGrp: string;
}

export interface OTCQuote {
  ourBuyPrice: number; // Market + 0.03
  ourSellPrice: number; // Market - 0.02
  timestamp: string;
}
