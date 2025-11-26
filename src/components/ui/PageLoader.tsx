import React from 'react';
import { Loader2 } from 'lucide-react';
import RushCoffeeLogo from '../layout/RushCoffeeLogo';

const PageLoader: React.FC = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-coffee-50">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <RushCoffeeLogo className="h-16 w-16 text-coffee-600" />
                <div className="flex items-center gap-2 text-coffee-800">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="font-medium">Brewing your page...</span>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
