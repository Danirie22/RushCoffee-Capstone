
import { AvailableReward } from './mockRewards';

export const mockAvailableRewards: Omit<AvailableReward, 'id'>[] = [
  {
    name: 'Free Grande Drink',
    description: 'Redeem your points for any Grande-sized drink on our menu. A perfect treat!',
    pointsCost: 250,
    imageUrl: 'https://images.unsplash.com/photo-1517701559439-d2380festi-fresh-coffee-beans.jpg?q=80&w=600',
    category: 'drink',
    available: true,
    displayOrder: 1,
  },
  {
    name: '10% Off Total Order',
    description: 'Get a 10% discount on your entire order. Great for when you\'re treating friends!',
    pointsCost: 400,
    imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1-payment-terminal.jpg?q=80&w=600',
    category: 'discount',
    available: true,
    displayOrder: 2,
  },
  {
    name: 'Free Pastry Item',
    description: 'Choose any delicious pastry from our selection to complement your coffee.',
    pointsCost: 150,
    imageUrl: 'https://images.unsplash.com/photo-1582249075228-3d1f404e57b3-assorted-pastries.jpg?q=80&w=600',
    category: 'food',
    available: true,
    displayOrder: 3,
  },
  {
    name: 'Upgrade to Venti',
    description: 'Get a free size upgrade from Grande to Venti on any drink.',
    pointsCost: 100,
    imageUrl: 'https://images.unsplash.com/photo-1594963321151-0c5888e2983b-coffee-cup-size-comparison.jpg?q=80&w=600',
    category: 'drink',
    available: true,
    displayOrder: 4,
  },
];
