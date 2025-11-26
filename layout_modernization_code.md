# Queue Page Layout Modernization Code

Below is the code to modernize the Queue page layout with better hierarchy. Apply these changes to `QueuePage.tsx`:

## 1. Enhanced Page Header (Lines 303-309)

Replace the existing Dashboard Content section:

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

## 2. Enhanced Stats Section Label (Line 315)

Replace the "Your Coffee Journey" heading:

```tsx
                        <div className="flex items-center justify-center gap-2 mb-8">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-coffee-300 to-transparent"></div>
                            <h2 className="text-sm font-bold text-coffee-700 uppercase tracking-wider px-4">Your Coffee Journey</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-coffee-300 to-transparent"></div>
                        </div>
```

## 3. Enhanced Recent Orders Section Header (Lines 378-387)

Replace the Recent Orders heading section:

```tsx
                        <div className="flex items-center justify-center gap-2 mb-8">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-coffee-500 to-coffee-600 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-white" />
                                </div>
                                <h2 className="text-sm font-bold text-coffee-700 uppercase tracking-wider">Recent Orders</h2>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            {orderHistory.filter(o => o.status === 'completed').length > 2 && (
                                <Link
                                    to="/profile"
                                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors ml-2"
                                >
                                    View All →
                                </Link>
                            )}
                        </div>
```

These changes will create:
- **Bigger, bolder header** with coffee icon
- **Decorative divider lines** around section titles
- **Better visual hierarchy** with enhanced typography
- **More breathing room** with increased margins
