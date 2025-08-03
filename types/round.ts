export interface Round {
  id: string;
  bidWinner: string;
  bid: number;
  meld: {
    [teamId: string]: number;
  };
  trickPoints: {
    [teamId: string]: number;
  };
  roundPoints: {
    [teamId: string]: number;
  };
  moonShotAttempted: boolean;
  moonShotSuccessful?: boolean;
}
