export interface Track {
  id: bigint;
  artist: `0x${string}`;
  title: string;
  metadataURI: string;
  listenPrice: bigint;
  totalListens: bigint;
  totalRevenue: bigint;
  beneficiaries: `0x${string}`[];
  shares: bigint[];
}

export interface SplitPreview {
  address: `0x${string}`;
  share: number;
  amount: bigint;
}

export interface RoyaltyBalance {
  address: `0x${string}`;
  earned: bigint;
}

export interface AudioTrack {
  id: number;
  title: string;
  artist: string;
  duration: number;
  frequency: number;
  color: string;
  beneficiaries: { address: `0x${string}`; share: number; role: string }[];
}
