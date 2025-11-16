import * as React from 'react';
import { Gift, Lock } from 'lucide-react';
import { AvailableReward } from '../../data/mockRewards';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface RewardCardProps {
  reward: AvailableReward;
  currentPoints: number;
  onRedeem: (rewardId: string) => void;
}

const categoryColors = {
  drink: 'bg-blue-100 text-blue-800',
  food: 'bg-green-100 text-green-800',
  discount: 'bg-yellow-100 text-yellow-800',
};

const RewardCard: React.FC<RewardCardProps> = ({ reward, currentPoints, onRedeem }) => {
  const { id, name, description, pointsCost, imageUrl, category, available } = reward;

  const hasEnoughPoints = currentPoints >= pointsCost;
  const isRedeemable = available && hasEnoughPoints;
  const pointsNeeded = pointsCost - currentPoints;

  const getButtonContent = () => {
    if (!available) {
      return 'Unavailable';
    }
    if (!hasEnoughPoints) {
      return (
        <>
          <Lock className="h-4 w-4" />
          Need {pointsNeeded} more points
        </>
      );
    }
    return 'Redeem Now';
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1" hover>
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className={`h-40 w-full object-cover ${!available ? 'grayscale' : ''}`}
        />
        <Badge className={`absolute top-2 left-2 capitalize ${categoryColors[category]}`}>
          {category}
        </Badge>
        {!available && (
          <Badge className="absolute top-2 right-2 bg-gray-500 text-white">
            Temporarily Unavailable
          </Badge>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-coffee-900">{name}</h3>
          <p className="mt-1 h-10 text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-600">
            <Gift className="h-5 w-5" />
            <p className="text-lg font-bold">{pointsCost} points</p>
          </div>
        </div>

        <button
          onClick={() => onRedeem(id)}
          disabled={!isRedeemable}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-100"
          aria-label={isRedeemable ? `Redeem ${name}` : `Cannot redeem ${name}`}
        >
          {getButtonContent()}
        </button>
      </div>
    </Card>
  );
};

export default RewardCard;