

import * as React from 'react';
import Card from '../../../components/ui/Card';

const ProductCardSkeleton: React.FC = () => {
  return (
    <Card className="flex animate-pulse flex-col overflow-hidden">
      <div className="relative">
        <div className="h-48 w-full bg-gray-300"></div>
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <div>
          <div className="h-4 w-1/4 rounded bg-gray-300"></div>
          <div className="mt-2 h-6 w-3/4 rounded bg-gray-300"></div>
          <div className="mt-2 space-y-2">
            <div className="h-4 rounded bg-gray-300"></div>
            <div className="h-4 w-5/6 rounded bg-gray-300"></div>
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-1/3 rounded bg-gray-300"></div>
            <div className="h-5 w-1/4 rounded bg-gray-300"></div>
          </div>

          <div className="mt-3 h-10 w-full rounded-full bg-gray-300"></div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCardSkeleton;