import { BallEdition } from './components/Basketball';

export interface BallModelInfo {
  id: BallEdition;
  name: string;
  bgText: string;
  bgLeft: string;
  bgRight: string;
  subtitle: string;
  desc: string;
  price: number;
  size: string;
  color: string;
  accentHover?: string;
  glow?: string;
  specChannel: string;
  bounceRate: string;
}

export interface CartItem {
  id: string;
  edition: BallEdition;
  name: string;
  price: number;
  quantity: number;
  color: string;
}
