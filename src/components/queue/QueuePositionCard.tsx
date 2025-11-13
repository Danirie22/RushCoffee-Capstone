import React from 'react';
import { Clock, Coffee, Bell, Check, Timer } from 'lucide-react';
import Badge from '../../../components/ui/Badge';

// Define the props interface
interface QueuePositionCardProps {
  position: number;
  status: 'waiting' | 'preparing' | 'ready' | 'completed';
  estimatedTime: number;
}

// Status configuration object
const statusConfig = {
  waiting: {
    gradient: 'from-gray-400 to-gray-500',
    animation: '',
    badgeIcon: Clock,
    badgeText: 'In Queue',
    badgeClasses: 'bg-gray-600/50 text-white',
    progressStep: 1,
    estimatedTimeText: (time: number) => `Estimated wait: ~${time} minutes`,
  },
  preparing: {
    gradient: 'from-primary-500 to-coffee-600',
    animation: 'animate-pulse-slow',
    badgeIcon: Coffee,
    badgeText: 'Preparing Your Order',
    badgeClasses: 'bg-primary-600/50 text-white',
    progressStep: 2,
    estimatedTimeText: (time: number) => `Ready in about: ${time} minutes`,
  },
  ready: {
    gradient: 'from-green-400 to-green-500',
    animation: 'animate-bounce',
    badgeIcon: Bell,
    badgeText: 'Ready for Pickup!',
    badgeClasses: 'bg-green-600/50 text-white',
    progressStep: 3,
    estimatedTimeText: () => 'Please proceed to the counter.',
  },
  completed: {
    gradient: 'from-blue-400 to-blue-500',
    animation: '',
    badgeIcon: Check,
    badgeText: 'Order Completed',
    badgeClasses: 'bg-blue-600/50 text-white',
    progressStep: 4,
    estimatedTimeText: () => 'Thank you for your order!',
  },
};

interface ProgressStepProps {
  stepNumber: number;
  label: string;
  currentStep: number;
}

const ProgressStep: React.FC<ProgressStepProps> = ({ stepNumber, label, currentStep }) => {
  const isActive = stepNumber <= currentStep;
  return (
    <div className="relative z-10 flex flex-col items-center">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold transition-all duration-500 ${isActive ? 'border-white bg-white text-primary-600' : 'border-white/50 bg-transparent text-white/50'}`}>
        {stepNumber < currentStep ? <Check className="h-5 w-5" /> : stepNumber}
      </div>
      <p className={`mt-2 text-xs font-semibold transition-all duration-500 ${isActive ? 'text-white' : 'text-white/50'}`}>
        {label}
      </p>
    </div>
  );
};

const ConfettiPiece: React.FC<{ index: number }> = ({ index }) => {
  const colors = ['bg-yellow-300', 'bg-pink-400', 'bg-green-400', 'bg-blue-400', 'bg-red-400'];
  
  const style: React.CSSProperties = {
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 8 + 5}px`,
    height: `${Math.random() * 8 + 5}px`,
    transform: `rotate(${Math.random() * 360}deg)`,
    animation: `fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
  };

  return <div className={`absolute -top-5 rounded-full ${colors[index % colors.length]}`} style={style}></div>;
};


const QueuePositionCard: React.FC<QueuePositionCardProps> = ({
  position,
  status,
  estimatedTime,
}) => {
  const config = statusConfig[status];
  const progressSteps = ['Ordered', 'Preparing', 'Ready', 'Complete'];

  const keyframes = `
    @keyframes fall {
      0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }
  `;
  
  return (
    <>
    <style>{keyframes}</style>
    <div
      className={`relative w-full max-w-lg overflow-hidden rounded-2xl p-8 text-white shadow-xl ${config.gradient}`}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] opacity-10"
      ></div>

      {/* Confetti for completed status */}
      {status === 'completed' && (
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}
      
      <div className={`relative z-10 flex flex-col items-center gap-6 ${config.animation}`}>
        {/* Status Badge */}
        <Badge className={`px-4 py-2 text-lg font-bold backdrop-blur-sm ${config.badgeClasses}`}>
          <config.badgeIcon className="mr-2 h-5 w-5" />
          {config.badgeText}
        </Badge>

        {/* Position Circle */}
        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white text-center shadow-lg">
          <span className="font-display text-5xl font-bold text-primary-600">
            {status === 'completed' ? <Check className="h-12 w-12"/> : position}
          </span>
          <p className="text-sm font-semibold text-gray-500">
            {status === 'completed' ? 'Enjoy!' : 'Your Position'}
          </p>
        </div>

        {/* Estimated Time */}
        <div className="flex items-center gap-2 text-center text-lg font-medium">
          {status !== 'completed' && <Timer className="h-5 w-5" />}
          <span>{config.estimatedTimeText(estimatedTime)}</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full self-stretch">
          <div className="relative flex items-start justify-between">
            {/* Connecting Lines */}
            <div className="absolute top-3.5 left-0 h-1 w-full">
                <div className="h-full w-full bg-white/30"></div>
                <div 
                  className="absolute top-0 left-0 h-full bg-white transition-all duration-500"
                  style={{ width: `${((config.progressStep - 1) / (progressSteps.length - 1)) * 100}%` }}
                ></div>
            </div>
            {progressSteps.map((label, index) => (
                <ProgressStep 
                  key={label}
                  stepNumber={index + 1} 
                  label={label} 
                  currentStep={config.progressStep} 
                />
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default QueuePositionCard;