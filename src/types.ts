import { BallEdition } from './components/Basketball';

export type AppView = 'landing' | 'customizer';

export type GripTextureType = 'classic' | 'street' | 'tech' | 'cross';

export interface CustomBallConfig {
  baseColor: string;
  lineColor: string;
  secondaryLineColor?: string;
  textureType: GripTextureType;
  laserText?: string;
  vibeName?: string;
}

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
  edition: BallEdition | 'custom';
  name: string;
  price: number;
  quantity: number;
  color: string;
  customConfig?: CustomBallConfig;
}

export type DeliveryMethod = 'domicilio' | 'sucursal';
export type PaymentMethod = 'transferencia' | 'contra_entrega';
export type CashPaymentType = 'efectivo' | 'transferencia_al_recibir';

export interface CustomerData {
  nombre: string;
  telefono: string;
  direccion: string;
  metodoEntrega: DeliveryMethod;
  referencias?: string;
}

export interface PaymentData {
  metodoPago: PaymentMethod;
  tipoContraEntrega?: CashPaymentType;
  pagoConMonto?: string;
}

export interface OrderData {
  orderId: string;
  items: CartItem[];
  total: number;
  cliente: CustomerData;
  pago: PaymentData;
  fecha: string;
}

