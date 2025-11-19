
import { AvailableReward } from './mockRewards';



export const mockAvailableRewards: Omit<AvailableReward, 'id'>[] = [
  {
    name: 'Free Grande Drink',
    description: 'Redeem your points for any Grande-sized drink on our menu. A perfect treat!',
    pointsCost: 200,
    imageUrl: '/Rewards/Free-Iced-Grande-Drink.jpg',
    category: 'drink',
    available: true,
    displayOrder: 1,
  },
  {
    name: '10% Off Total Order',
    description: 'Get a 10% discount on your entire order. Great for when you\'re treating friends!',
    pointsCost: 200,
    imageUrl: '/Rewards/10-percent-off.jpg',
    category: 'discount',
    available: true,
    displayOrder: 2,
  },
  {
    name: 'Free Rice Meal',
    description: 'Choose any Tasty Rice Meal from our selection to complement your coffee.',
    pointsCost: 350,
    imageUrl: '/Rewards/Free-Rice-Meal.jpg',
    category: 'food',
    available: true,
    displayOrder: 3,
  },
  {
    name: 'Upgrade to Venti',
    description: 'Get a free size upgrade from Grande to Venti on any drink.',
    pointsCost: 300,
    imageUrl: '/Rewards/Free-Iced-Venti-Drink.jpg',
    category: 'drink',
    available: true,
    displayOrder: 4,
  },
];


