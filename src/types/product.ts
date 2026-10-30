export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  isPopular?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: 'cod' | 'qris' | 'bank_transfer';
  items: CartItem[];
  totalAmount: number;
  status: 'Menunggu Pembayaran' | 'Diproses' | 'Dikirim' | 'Selesai';
  createdAt: string;
}
