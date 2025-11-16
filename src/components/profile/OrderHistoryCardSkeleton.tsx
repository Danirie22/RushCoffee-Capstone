import React from 'react';
import Card from '../ui/Card';

const OrderHistoryCardSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-grow space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-1/3 rounded bg-gray-300"></div>
            <div className="h-5 w-1/4 rounded-full bg-gray-300"></div>
          </div>
          <div className="h-3 w-1/4 rounded bg-gray-300"></div>
          <div className="h-4 w-1/2 rounded bg-gray-300"></div>
        </div>
        <div className="flex-shrink-0 space-y-2 text-right sm:ml-4">
          <div className="h-8 w-24 rounded bg-gray-300 ml-auto"></div>
          <div className="h-8 w-28 rounded-full bg-gray-300 ml-auto"></div>
        </div>
      </div>
    </Card>
  );
};

export default OrderHistoryCardSkeleton;