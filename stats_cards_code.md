# Stats Cards Code - Ready to Apply

Replace lines 331-357 in `QueuePage.tsx` with this code:

```tsx
                                    {/* Orders Card */}
                                    <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-center">
                                        <div className="flex flex-col items-center text-white">
                                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                                <Clock className="h-6 w-6 sm:h-7 sm:w-7" />
                                            </div>
                                            <p className="text-3xl sm:text-4xl font-bold mb-1">{currentUser.totalOrders || 0}</p>
                                            <p className="text-xs sm:text-sm font-medium text-white/90">Orders</p>
                                            {currentUser.totalOrders > 0 && (
                                                <div className="flex items-center gap-1 mt-2 text-xs text-white/80">
                                                    <TrendingUp className="h-3 w-3" />
                                                    <span>Keep it up!</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Points Card */}
                                    <div className="group bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-center">
                                        <div className="flex flex-col items-center text-white">
                                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                                <Award className="h-6 w-6 sm:h-7 sm:w-7" />
                                            </div>
                                            <p className="text-3xl sm:text-4xl font-bold mb-1">{currentUser.currentPoints || 0}</p>
                                            <p className="text-xs sm:text-sm font-medium text-white/90">Points</p>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-white/80">
                                                <Sparkles className="h-3 w-3" />
                                                <span>Earn more!</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tier Card */}
                                    <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-center">
                                        <div className="flex flex-col items-center text-white">
                                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                                <Star className="h-6 w-6 sm:h-7 sm:w-7 fill-white" />
                                            </div>
                                            <p className="text-2xl sm:text-3xl font-bold mb-1 capitalize">{currentUser.tier || 'Bronze'}</p>
                                            <p className="text-xs sm:text-sm font-medium text-white/90">Tier</p>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-white/80">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>Level up!</span>
                                            </div>
                                        </div>
                                    </div>
```

**Also add this import** at the top of the file (around line 6):
```tsx
import { Star } from 'lucide-react';
```
