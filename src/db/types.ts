export interface IPosition {
  username: string;
  data: IPositionDetail[];
}

export interface IProfile {
  username: string;
  channelId: string;
  uid?: string;
  type?: number;
}

export interface IPositionDetail {
  type: string;
  symbol: string;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  amount: number;
  leverage: number;
}

export interface IPrice {
  symbol: string;
  markPrice: string;
  indexPrice: string;
  estimatedSettlePrice: string;
  lastFundingRate: string;
  interestRate: string;
  nextFundingTime: number;
  time: number;
}

export interface IAccountPositionDetail {
  symbol: string;
  initialMargin: string;
  maintMargin: string;
  unrealizedProfit: string;
  positionInitialMargin: string;
  openOrderInitialMargin: string;
  leverage: string;
  isolated: boolean;
  entryPrice: string;
  maxNotional: string;
  positionSide: string;
  positionAmt: string;
  notional: string;
  isolatedWallet: string;
  updateTime: number;
  bidNotional: string;
  askNotional: string;
}
