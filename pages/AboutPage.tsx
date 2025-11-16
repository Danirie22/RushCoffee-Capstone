

import * as React from 'react';

const AboutPage: React.FC = () => (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white p-8 shadow-sm text-center min-h-[60vh]">
        <h1 className="text-5xl font-bold text-primary-700">About Us</h1>
        <p className="mt-4 text-xl text-gray-600">Discover the story behind our beans.</p>
        <img src="https://picsum.photos/800/400?image=1060" alt="Coffee Beans" className="mt-8 rounded-lg shadow-lg" />
    </div>
);

export default AboutPage;