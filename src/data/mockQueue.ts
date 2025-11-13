
export interface QueueItem {
  id: string;
  customerName: string;
  orderNumber: string;
  position: number;
  status: 'waiting' | 'preparing' | 'ready' | 'completed';
  orderItems: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: 'gcash' | 'cash';
  paymentStatus: 'pending' | 'paid';
  timestamp: Date;
  estimatedTime: number; // in minutes
}

export const mockUserQueue: QueueItem = {
  id: 'queue-user-123',
  customerName: 'John Doe',
  orderNumber: "RC-2025-001",
  position: 3,
  status: 'preparing',
  orderItems: [
    {
      productId: 'ic-04',
      productName: 'Cold Brew',
      quantity: 2,
      price: 160
    },
    {
      productId: 'pa-01',
      productName: 'Chocolate Croissant',
      quantity: 1,
      price: 95
    }
  ],
  totalAmount: 415.00,
  paymentMethod: 'gcash',
  paymentStatus: 'paid',
  timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  estimatedTime: 8,
};
