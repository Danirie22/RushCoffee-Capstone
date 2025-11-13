import React from 'react';

const ContactPage: React.FC = () => (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white p-8 shadow-sm text-center min-h-[60vh]">
        <h1 className="text-5xl font-bold text-primary-700">Contact Us</h1>
        <p className="mt-4 text-xl text-gray-600">We'd love to hear from you!</p>
         <img src="https://picsum.photos/800/400?image=1015" alt="Contact" className="mt-8 rounded-lg shadow-lg" />
    </div>
);

export default ContactPage;
