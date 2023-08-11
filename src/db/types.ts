export interface IPosition {
  uid: string;
  data: IPositionDetail[];
}

export interface IProfile {
  username: string;
  uid: string;
}

export interface IPositionDetail {
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
