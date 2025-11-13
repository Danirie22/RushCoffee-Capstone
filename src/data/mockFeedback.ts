
export interface Feedback {
  id: string;
  userId: string;
  orderId?: string;
  rating: number; // 1-5
  category: 'service' | 'food' | 'system' | 'other';
  comment: string;
  status: 'pending' | 'reviewed' | 'resolved';
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFeedback extends Feedback {
  orderNumber?: string;
}

export const mockUserFeedback: UserFeedback[] = [
  {
    id: 'fb-01',
    userId: 'user-123',
    orderId: 'ord-101',
    orderNumber: 'RC-2025-0101',
    rating: 5,
    category: 'food',
    comment: "The Spanish Latte was absolutely perfect! Best coffee I've had in a long time. Keep up the great work!",
    status: 'reviewed',
    response: "Thank you so much for the kind words! We're thrilled you enjoyed it and hope to see you again soon.",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: 'fb-02',
    userId: 'user-456',
    orderId: 'ord-102',
    orderNumber: 'RC-2025-0102',
    rating: 4,
    category: 'system',
    comment: "The queue system is a game-changer. It was so easy to order ahead and track my coffee. It really works great!",
    status: 'resolved',
    response: "We're glad to hear our system is making your experience better. Thanks for the wonderful feedback!",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 4)),
  },
  {
    id: 'fb-03',
    userId: 'user-789',
    orderId: 'ord-103',
    orderNumber: 'RC-2025-0103',
    rating: 3,
    category: 'service',
    comment: "The service was a bit slow today during the morning rush. The staff seemed overwhelmed. My coffee was still good though.",
    status: 'pending',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: 'fb-04',
    userId: 'user-123',
    rating: 4,
    category: 'other',
    comment: "It would be great if you had more comfortable seating options available.",
    status: 'reviewed',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 9)),
  }
];
