import React from 'react';

const MenuPage: React.FC = () => (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white p-8 shadow-sm text-center min-h-[60vh]">
        <h1 className="text-5xl font-bold text-primary-700">Our Menu</h1>
        <p className="mt-4 text-xl text-gray-600">Explore our handcrafted beverages and delicious pastries.</p>
        <img src="https://picsum.photos/800/400?image=685" alt="Coffee Menu" className="mt-8 rounded-lg shadow-lg" />
    </div>
);

export default MenuPage;
