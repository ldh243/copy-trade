export interface IPosition {
  uid: string;
  data: IPositionDetail[];
}

export interface IProfile {
  username: string;
  uid: string;
}

export interface IPositionDetail {
  type: string;
  symbol: string;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  roe: number;
  updateTime: number[];
  amount: number;
  updateTimeStamp: string;
  yellow: boolean;
  tradeBefore: boolean;
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
