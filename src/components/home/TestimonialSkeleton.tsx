import React from 'react';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import { Quote } from 'lucide-react';

const TestimonialSkeleton: React.FC = () => {
    return (
        <Card
            padding="sm"
            className="flex flex-col border-l-4 border-gray-200"
        >
            <Quote className="h-6 w-6 text-gray-200 md:h-8 md:w-8" />
            <div className="my-3 md:my-4">
                <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="mt-4 flex items-center gap-3 md:gap-4">
                <Skeleton className="h-10 w-10 rounded-full md:h-12 md:w-12" />
                <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        </Card>
    );
};

export default TestimonialSkeleton;
