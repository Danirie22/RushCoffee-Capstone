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
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md border border-gray-100 rounded-2xl" hover>
      <div className="relative group">
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300 z-10 pointer-events-none"></div>
        <img
          src={imageUrl}
          alt={name}
          className={`h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110 ${!available ? 'grayscale' : ''}`}
        />
        <Badge className={`absolute top-3 left-3 capitalize shadow-sm z-20 ${categoryColors[category]}`}>
          {category}
        </Badge>
        {!available && (
          <Badge className="absolute top-3 right-3 bg-gray-500 text-white z-20 shadow-sm">
            Temporarily Unavailable
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-coffee-900 group-hover:text-primary-600 transition-colors">{name}</h3>
          <p className="mt-2 h-10 text-sm text-gray-600 line-clamp-2 leading-relaxed">{description}</p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 text-primary-600">
            <Gift className="h-5 w-5" />
            <p className="text-lg font-bold">{pointsCost} points</p>
          </div>
        </div>

        <button
          onClick={() => onRedeem(id)}
          disabled={!isRedeemable}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
            ${isRedeemable
              ? 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 hover:shadow-lg transform hover:scale-[1.02]'
              : 'bg-gray-300 cursor-not-allowed text-gray-500'}`}
          aria-label={isRedeemable ? `Redeem ${name}` : `Cannot redeem ${name}`}
        >
          {getButtonContent()}
        </button>
      </div>
    </Card>
  );
};

export default RewardCard;