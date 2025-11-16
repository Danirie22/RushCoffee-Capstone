
import * as React from 'react';
import { Medal, Award, Crown } from 'lucide-react';

interface RewardsTierBadgeProps {
  tier: 'bronze' | 'silver' | 'gold';
  currentPoints: number;
  nextTierPoints: number;
  showProgress?: boolean;
}

const tierConfig = {
  bronze: {
    Icon: Medal,
    name: 'Bronze Member',
    gradient: 'from-orange-400 to-orange-600',
    nextTierName: 'Silver',
    progressColor: 'bg-gray-400',
    minPoints: 0,
  },
  silver: {
    Icon: Award,
    name: 'Silver Member',
    gradient: 'from-gray-300 to-gray-500',
    nextTierName: 'Gold',
    progressColor: 'bg-yellow-400',
    minPoints: 300,
  },
  gold: {
    Icon: Crown,
    name: 'Gold Member',
    gradient: 'from-yellow-400 to-yellow-600',
    nextTierName: null,
    progressColor: '',
    minPoints: 1000,
  },
};

const RewardsTierBadge: React.FC<RewardsTierBadgeProps> = ({
  tier,
  currentPoints,
  nextTierPoints,
  showProgress = true,
}) => {
  const config = tierConfig[tier];
  
  const pointsToNextTier = nextTierPoints - currentPoints;
  const progressPercent = tier !== 'gold' 
    ? Math.max(0, Math.min(100, ((currentPoints - config.minPoints) / (nextTierPoints - config.minPoints)) * 100))
    : 100;

  return (
    <div className={`relative w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-center text-white shadow-lg md:p-8 ${config.gradient}`}>
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center">
        <config.Icon className="h-16 w-16 animate-pulse-slow drop-shadow-lg" />
        <h2 className="mt-4 font-display text-2xl font-bold drop-shadow-md md:text-3xl">
          {config.name}
        </h2>
        <p className="font-semibold text-white/80">{currentPoints} points</p>
      </div>

      {showProgress && tier !== 'gold' && (
        <div className="relative z-10 mt-6 text-left">
          <p className="text-xs font-semibold md:text-sm">
            <span className="font-bold">{pointsToNextTier > 0 ? pointsToNextTier : 0}</span> points to {config.nextTierName}
          </p>
          <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-black/20">
            <div
              className={`h-full rounded-full ${config.progressColor} transition-all duration-500 ease-out`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsTierBadge;