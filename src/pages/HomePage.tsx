import * as React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Clock, Gift, Wallet, Users, Bell, ArrowRight, Quote, ChevronsDown } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import RushCoffeeLogo from '../components/layout/RushCoffeeLogo';
import heroBgFull from '../assets/rushb.webp';

const features = [
    {
        Icon: Clock,
        title: 'Live Queue Updates',
        description: 'Track your position in real-time and know exactly when your coffee will be ready. No more waiting around!',
        iconBgColor: 'bg-primary-100',
        iconTextColor: 'text-primary-600',
    },
    {
        Icon: RushCoffeeLogo,
        title: 'Order Ahead',
        description: 'Browse our menu, customize your drink, and order from anywhere. Your coffee, your way.',
        iconBgColor: 'bg-coffee-100',
        iconTextColor: 'text-coffee-800',
    },
    {
        Icon: Gift,
        title: 'Loyalty Rewards',
        description: 'Earn points with every purchase and redeem for free drinks and exclusive perks.',
        iconBgColor: 'bg-green-100',
        iconTextColor: 'text-green-600',
    },
    {
        Icon: Wallet,
        title: 'Multiple Payment Options',
        description: 'Pay with GCash or cash on pickup—whatever works best for you.',
        iconBgColor: 'bg-blue-100',
        iconTextColor: 'text-blue-600',
    },
];

const steps = [
    {
        number: 1,
        Icon: Menu,
        title: 'Browse & Customize',
        description: 'Explore our menu of premium coffee drinks and customize your order exactly how you like it.',
        hasAnimation: true,
    },
    {
        number: 2,
        Icon: Users,
        title: 'Join Virtual Queue',
        description: 'Place your order and automatically join the queue. Get your position and estimated wait time instantly.',
    },
    {
        number: 3,
        Icon: Bell,
        title: 'Pickup & Enjoy',
        description: 'Receive real-time notifications. When ready, breeze past the line and grab your coffee.',
        isPulsing: true,
    },
];

const defaultTestimonials = [
    {
        quote: "Rush Coffee changed my morning routine! No more waiting in long lines. I order on my way and pick up when it's ready. Absolutely love it!",
        name: "Sarah M.",
        title: "Regular Customer",
        initial: "S",
        avatarBg: "bg-primary-100",
        avatarText: "text-primary-600",
        rating: 5
    },
    {
        quote: "The queue system is genius. I can track exactly when my coffee will be ready. Plus, earning rewards with every purchase is a nice bonus!",
        name: "Miguel R.",
        title: "Gold Member",
        initial: "M",
        avatarBg: "bg-blue-100",
        avatarText: "text-blue-600",
        rating: 5
    },
    {
        quote: "Best coffee experience in Manila. Fast, convenient, and the coffee is always perfect. The mobile app makes everything so easy!",
        name: "Ana L.",
        title: "VIP Member",
        initial: "A",
        avatarBg: "bg-green-100",
        avatarText: "text-green-600",
        rating: 5
    }
];


const HomePage: React.FC = () => {
    const { currentUser } = useAuth();

    let orderNowPath = '/auth/register';
    if (currentUser) {
        if (currentUser.role === 'admin') {
            orderNowPath = '/admin';
        } else if (currentUser.role === 'employee') {
            orderNowPath = '/employee';
        } else {
            orderNowPath = '/menu';
        }
    }

    const [testimonials, setTestimonials] = React.useState(defaultTestimonials);

    React.useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Fetch reviews that are marked as 'reviewed' (approved)
                // Simplified query to avoid needing a custom Firestore index
                const q = query(
                    collection(db, 'feedback'),
                    where('status', '==', 'reviewed')
                );

                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    // Filter and sort client-side to avoid index issues
                    const allReviews = snapshot.docs.map(doc => doc.data());
                    const topReviews = allReviews
                        .filter((data: any) => data.rating >= 4)
                        .sort((a: any, b: any) => b.rating - a.rating)
                        .slice(0, 3);

                    if (topReviews.length > 0) {
                        const reviewsData = await Promise.all(topReviews.map(async (data: any) => {
                            let name = "Rush Customer";
                            let initial = "R";

                            if (data.userId) {
                                try {
                                    const userDoc = await getDoc(doc(db, 'users', data.userId));
                                    if (userDoc.exists()) {
                                        const userData = userDoc.data();
                                        name = `${userData.firstName} ${userData.lastName.charAt(0)}.`;
                                        initial = userData.firstName.charAt(0);
                                    }
                                } catch (e) {
                                    console.error("Error fetching user for review", e);
                                }
                            }

                            const colors = [
                                { bg: "bg-primary-100", text: "text-primary-600" },
                                { bg: "bg-blue-100", text: "text-blue-600" },
                                { bg: "bg-green-100", text: "text-green-600" },
                                { bg: "bg-yellow-100", text: "text-yellow-600" },
                                { bg: "bg-purple-100", text: "text-purple-600" },
                            ];
                            const randomColor = colors[Math.floor(Math.random() * colors.length)];

                            return {
                                quote: data.comment,
                                name: name,
                                title: "Verified Customer",
                                initial: initial,
                                avatarBg: randomColor.bg,
                                avatarText: randomColor.text,
                                rating: data.rating
                            };
                        }));

                        setTestimonials(reviewsData);
                    }
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
                // Fallback to default testimonials is already set in initial state
            }
        };

        fetchReviews();
    }, []);

    return (
        <div className="bg-white">
            <Header />
            <main>
                <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden bg-gray-900">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={heroBgFull}
                            alt="Coffee Shop Atmosphere"
                            className="h-full w-full object-cover brightness-110"
                        />
                        {/* Gradient overlay: Dark on left for text, transparent on right for products */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>
                    </div>

                    <div className="container relative z-10 mx-auto max-w-7xl px-6 py-20">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

                            <div className="animate-fade-in-up text-center lg:text-left">
                                <h1 className="font-display text-5xl font-bold text-white md:text-6xl lg:text-7xl leading-tight">
                                    <span className="block" style={{ animation: 'fade-in-up 0.8s ease-out 200ms forwards', opacity: 0 }}>Skip the Line,</span>
                                    <span className="block text-[#8B5E3C]" style={{ animation: 'fade-in-up 0.8s ease-out 300ms forwards', opacity: 0 }}>Get Your Coffee</span>
                                    <span className="block" style={{ animation: 'fade-in-up 0.8s ease-out 400ms forwards', opacity: 0 }}>Faster.</span>
                                </h1>
                                <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-200 md:text-xl lg:mx-0 shadow-black drop-shadow-md" style={{ animation: 'fade-in-up 0.8s ease-out 500ms forwards', opacity: 0 }}>
                                    Join our digital queue system. Order ahead, track your position in real-time, and breeze through pickup. Your perfect cup awaits—without the wait.
                                </p>

                                <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start" style={{ animation: 'fade-in-up 0.8s ease-out 600ms forwards', opacity: 0 }}>
                                    <Badge className="bg-[#3E2723]/90 text-[#D7CCC8] border border-[#5D4037] backdrop-blur-sm px-4 py-2">⚡ Real-Time Queue</Badge>
                                    <Badge className="bg-[#3E2723]/90 text-[#D7CCC8] border border-[#5D4037] backdrop-blur-sm px-4 py-2">📱 Mobile Ordering</Badge>
                                    <Badge className="bg-[#3E2723]/90 text-[#D7CCC8] border border-[#5D4037] backdrop-blur-sm px-4 py-2">🎁 Rewards Program</Badge>
                                </div>

                                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start" style={{ animation: 'fade-in-up 0.8s ease-out 700ms forwards', opacity: 0 }}>
                                    <Link to={orderNowPath}>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            startIcon={<RushCoffeeLogo className="h-5 w-5" />}
                                        >
                                            Order Now
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Right column is empty as the image is now the background */}
                            <div className="hidden lg:block"></div>
                        </div>
                    </div>
                </section>

                <section id="features" className="bg-white px-6 py-20">
                    <div className="container mx-auto max-w-7xl">
                        <div className="text-center">
                            <p className="mb-2 font-medium text-primary-600">Why Rush Coffee?</p>
                            <h2 className="mb-4 font-display text-2xl font-bold text-coffee-900 md:text-4xl">
                                Everything You Need for a Seamless Coffee Experience
                            </h2>
                            <p className="mx-auto mb-12 max-w-2xl text-sm text-gray-600 md:text-base">
                                From ordering to pickup, we've got you covered.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature, index) => (
                                <Card key={index} hover padding="none" className="text-center p-4 md:p-6">
                                    <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl md:mb-4 md:h-16 md:w-16 ${feature.iconBgColor}`}>
                                        <feature.Icon className={`h-6 w-6 md:h-8 md:w-8 ${feature.iconTextColor}`} />
                                    </div>
                                    <h3 className="mb-1 font-display text-sm font-bold text-coffee-900 md:mb-2 md:text-xl md:font-semibold">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs leading-snug text-gray-600 md:text-sm md:leading-relaxed">
                                        {feature.description}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="bg-gradient-to-b from-coffee-50 to-white px-6 py-12 md:py-20">
                    <div className="container mx-auto max-w-7xl">
                        <div className="text-center">
                            <p className="mb-2 font-medium text-primary-600">Simple Process</p>
                            <h2 className="mb-4 font-display text-2xl font-bold text-coffee-900 md:text-4xl">
                                How Rush Coffee Works
                            </h2>
                            <p className="mx-auto mb-10 max-w-2xl text-sm text-gray-600 md:mb-16 md:text-base">
                                Get your perfect cup in three easy steps.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {steps.map((step, index) => (
                                <div
                                    key={step.number}
                                    className={`relative w-full text-center ${index === 2 ? 'md:col-span-2 lg:col-span-1 md:w-[calc(50%-0.5rem)] md:mx-auto lg:w-full' : ''}`}
                                >
                                    <div className="absolute -top-3 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-primary-600 font-display text-lg font-bold text-white shadow-lg md:-top-4 md:h-12 md:w-12 md:text-xl">
                                        {step.number}
                                    </div>
                                    <Card className="pt-8 h-full" padding="sm">
                                        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-coffee-100 p-3 md:h-20 md:w-20 md:p-4">
                                            {step.hasAnimation && (
                                                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                                    <div className="absolute left-1/2 top-2 h-4 w-px -translate-x-1/2 animate-steam-1 rounded-full bg-primary-300/80"></div>
                                                    <div className="absolute left-1/3 top-2 h-5 w-px animate-steam-2 rounded-full bg-primary-300/80"></div>
                                                    <div className="absolute left-2/3 top-2 h-3 w-px animate-steam-1 rounded-full bg-primary-300/80"></div>
                                                </div>
                                            )}
                                            <step.Icon className={`h-8 w-8 text-primary-600 md:h-10 md:w-10 ${step.isPulsing ? 'animate-pulse-slow' : ''}`} />
                                        </div>
                                        <h3 className="mb-2 mt-3 font-display text-lg font-semibold text-coffee-900 md:mt-4 md:text-xl">
                                            {step.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 md:text-sm">{step.description}</p>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="testimonials" className="bg-white py-12 px-6 md:py-20">
                    <div className="container mx-auto max-w-7xl">
                        <div className="text-center">
                            <p className="mb-2 font-medium text-primary-600">Customer Love</p>
                            <h2 className="mb-4 font-display text-2xl font-bold text-coffee-900 md:text-4xl">
                                What Our Customers Say
                            </h2>
                            <p className="mx-auto mb-10 max-w-2xl text-sm text-gray-600 md:mb-12 md:text-base">
                                Join thousands of satisfied coffee lovers.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {testimonials.map((testimonial, index) => (
                                <Card
                                    key={index}
                                    hover
                                    padding="sm"
                                    className={`flex flex-col border-l-4 border-primary-400 transition-transform duration-300 hover:scale-105 ${index === 2 ? 'md:col-span-2 lg:col-span-1 md:w-[calc(50%-0.5rem)] md:mx-auto lg:w-full' : ''}`}
                                >
                                    <Quote className="h-6 w-6 text-primary-200 md:h-8 md:w-8" />
                                    <div className="my-3 text-sm text-yellow-400 md:my-4 md:text-base">
                                        {'⭐'.repeat(Math.round(testimonial.rating || 5))}
                                    </div>
                                    <p className="flex-grow font-sans italic text-sm text-gray-700 md:text-base">
                                        "{testimonial.quote}"
                                    </p>
                                    <div className="mt-4 flex items-center gap-3 md:gap-4">
                                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold text-sm md:h-12 md:w-12 md:text-base ${testimonial.avatarBg} ${testimonial.avatarText}`}>
                                            {testimonial.initial}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-coffee-900 md:text-base">{testimonial.name}</p>
                                            <Badge className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 md:text-xs md:px-2">
                                                {testimonial.title}
                                            </Badge>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden bg-coffee-900 px-6 py-24 text-center text-white">
                    {/* Background Pattern/Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop"
                            alt="Coffee shop atmosphere"
                            className="h-full w-full object-cover opacity-20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-coffee-900/90 via-coffee-800/90 to-coffee-900/90"></div>
                    </div>

                    <div className="absolute -left-1/4 -top-1/4 opacity-5"><RushCoffeeLogo className="h-96 w-96 animate-float text-white" /></div>
                    <div className="absolute -bottom-1/4 -right-1/4 opacity-5"><RushCoffeeLogo className="h-[30rem] w-[30rem] animate-float-delay text-white" /></div>

                    <div className="relative z-10 mx-auto max-w-3xl">
                        <div className="relative mx-auto mb-6 inline-block">
                            <span className="text-6xl" role="img" aria-label="Coffee cup">☕</span>
                            <div className="absolute -top-4 left-0 right-0 h-12">
                                <div className="absolute left-1/2 h-6 w-px -translate-x-1/2 animate-steam-1 rounded-full bg-white/50"></div>
                                <div className="absolute left-1/3 h-8 w-px animate-steam-2 rounded-full bg-white/50"></div>
                                <div className="absolute left-2/3 h-5 w-px animate-steam-1 rounded-full bg-white/50"></div>
                            </div>
                        </div>

                        <h2 className="font-display text-4xl font-bold md:text-5xl lg:text-6xl">
                            Ready to Rush Through Your Day?
                        </h2>
                        <p className="mx-auto mb-8 mt-6 max-w-2xl text-xl text-gray-300">
                            Join 4,000+ customers who've already skipped the line. Experience the future of coffee ordering.
                        </p>

                        <div className="mb-10 flex flex-wrap justify-center gap-3">
                            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm border border-white/10">
                                5,000+ Orders Completed
                            </span>
                            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm border border-white/10">
                                4.9★ Average Rating
                            </span>
                            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm border border-white/10">
                                &lt; 5 min Average Wait
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                to={orderNowPath}
                                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-primary-500 hover:shadow-primary-600/30 hover:-translate-y-1"
                            >
                                Start Ordering Now
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                to="/menu"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:-translate-y-1"
                            >
                                View Menu
                            </Link>
                        </div>

                        <p className="mt-8 text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link to="/auth/login" className="font-medium text-primary-400 hover:text-primary-300 hover:underline">
                                Log in here
                            </Link>
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;