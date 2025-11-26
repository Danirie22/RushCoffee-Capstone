# Hero Section Background Code

Add a beautiful gradient hero section background to the Queue page header.

## Code to Add

Wrap the Dashboard Content section (lines 308-322) with this hero section:

```tsx
                {/* Hero Section with Background */}
                <div className="relative -mx-4 px-4 py-12 sm:py-16 mb-12 overflow-hidden">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-coffee-600 via-coffee-700 to-coffee-900 opacity-95"></div>
                    
                    {/* Decorative Pattern Overlay */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                    
                    {/* Floating Coffee Beans */}
                    <div className="absolute top-10 right-10 h-20 w-20 rounded-full bg-white/5 blur-2xl"></div>
                    <div className="absolute bottom-10 left-10 h-32 w-32 rounded-full bg-white/5 blur-3xl"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center justify-center gap-3 mb-4">
                            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                                <Coffee className="h-7 w-7 text-white" />
                            </div>
                            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
                                Your Queue
                            </h1>
                        </div>
                        <p className="text-base sm:text-lg text-white/90 font-medium max-w-md mx-auto">
                            Track your orders and earn rewards with every sip
                        </p>
                    </div>
                </div>
```

## What This Adds:

✨ **Rich gradient background** (coffee-600 → coffee-900)
🎨 **Subtle grid pattern** overlay for texture
☁️ **Floating blur orbs** for depth
💎 **Glassmorphic icon** with border and backdrop blur
🌟 **White text** that pops against dark background
📱 **Responsive sizing** (text scales up on larger screens)

## Replace This Section:

Find and replace the current "Dashboard Content" section (around lines 308-322) with the code above.

**Before:**
```tsx
{/* Dashboard Content */}
<div className="text-center mb-10 sm:mb-14">
    <div className="inline-flex items-center justify-center gap-3 mb-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-coffee-600 to-coffee-700 flex items-center justify-center shadow-lg">
            <Coffee className="h-6 w-6 text-white" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-coffee-900 tracking-tight">
            Your Queue
        </h1>
    </div>
    <p className="text-base sm:text-lg text-gray-600 font-medium">
        Track your orders and earn rewards with every sip
    </p>
</div>
```

**After:** The new hero section code above!
