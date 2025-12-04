import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200/80 ${className}`}
            {...props}
        />
    );
};

export default Skeleton;
