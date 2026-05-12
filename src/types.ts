/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PromoTier {
  minQty: number;
  discount: number;
}

export interface PromoRule {
  id: string;
  description: string;
  targetProductIds: string[];
  tiers: PromoTier[];
  isMixAndMatch: boolean;
}

export interface ProductPromoInfo {
  autoDiscount: number;
  maxDiscount: number;
  message: string;
  tiers: PromoTier[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

export interface Order {
  id: string;
  pdvId: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  billingType?: 'FACTURA_A' | 'REMITO';
}

export enum PDVStatus {
  PENDING = 'pending',
  SOLD = 'sold',
  NO_SALE = 'no-sale'
}

export interface PDV {
  id: string;
  name: string;
  address: string;
  type?: string;
  billing?: string;
  category?: string;
  isVerified?: boolean;
  day?: string;
  plans?: string[];
  plan?: 'GOLD' | 'SILVER' | 'INICIAL' | null;
  portfolio: number[]; // 1 for active, 0 for inactive
  status?: PDVStatus;
}

export interface Route {
  id: string;
  name: string;
  pdvs: PDV[];
}
