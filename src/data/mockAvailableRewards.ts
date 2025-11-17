
import { AvailableReward } from './mockRewards';

export const mockAvailableRewards: Omit<AvailableReward, 'id'>[] = [
  {
    name: 'Free Grande Drink',
    description: 'Redeem your points for any Grande-sized drink on our menu. A perfect treat!',
    pointsCost: 200,
    imageUrl: '/Menu/free-grande-drink.jpg',
    category: 'drink',
    available: true,
    displayOrder: 1,
  },
  {
    name: '10% Off Total Order',
    description: 'Get a 10% discount on your entire order. Great for when you\'re treating friends!',
    pointsCost: 300,
    imageUrl: '/Menu/10-off-total-order.jpg',
    category: 'discount',
    available: true,
    displayOrder: 2,
  },
  {
    name: 'Free Pastry Item',
    description: 'Choose any delicious pastry from our selection to complement your coffee.',
    pointsCost: 150,
    imageUrl: '/Menu/free-pastry-item.jpg',
    category: 'food',
    available: true,
    displayOrder: 3,
  },
  {
    name: 'Upgrade to Venti',
    description: 'Get a free size upgrade from Grande to Venti on any drink.',
    pointsCost: 100,
    imageUrl: '/Menu/upgrade-to-venti.jpg',
    category: 'drink',
    available: true,
    displayOrder: 4,
  },
];