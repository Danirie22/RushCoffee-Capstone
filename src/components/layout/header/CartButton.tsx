import * as React from 'react';
import { ShoppingCart } from 'lucide-react';

interface CartButtonProps {
    totalItems: number;
    onClick: () => void;
}

const CartButton: React.FC<CartButtonProps> = ({ totalItems, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="relative rounded-full p-2 text-gray-700 transition hover:bg-gray-100"
            aria-label={`Open cart with ${totalItems} items`}
        >
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white" aria-hidden="true">
                    {totalItems}
                </span>
            )}
        </button>
    );
};

export default CartButton;
