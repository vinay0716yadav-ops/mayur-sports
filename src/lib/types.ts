export type Category = 
  | 'Cricket'
  | 'Badminton'
  | 'Football'
  | 'Fitness & Gym'
  | 'Swimming'
  | 'Skating'
  | 'Tennis & TT'
  | 'Shoes & Wear'
  | 'Accessories';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Product {
  id: string;
  name: string;
  category: Category;
  brand: string;
  price: number; // in INR ₹
  mrp: number; // Maximum Retail Price
  stockStatus: StockStatus;
  stockCount?: number;
  description: string;
  features: string[];
  imageUrl: string;
  badge?: string; // e.g., "Best Seller", "New Arrival", "Hot Deal"
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreInfo {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string; // WhatsApp number with country code, e.g., 919876543210
  address: string;
  city: string;
  state: string;
  pincode: string;
  openingHours: string;
  announcement: string;
}
