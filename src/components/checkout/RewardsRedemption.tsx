import React from 'react';
import { Coffee, Loader2 } from 'lucide-react';
import { AvailableReward } from '../../data/mockRewards';
import { User } from '../../context/AuthContext';

interface RewardsRedemptionProps {
    rewards: AvailableReward[];
    selectedReward: AvailableReward | null;
    setSelectedReward: (reward: AvailableReward | null) => void;
    loading: boolean;
    currentUser: User;
}

const RewardsRedemption: React.FC<RewardsRedemptionProps> = ({
    rewards,
    selectedReward,
    setSelectedReward,
    loading,
    currentUser
}) => {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <h2 className="mb-4 font-display text-xl font-bold text-coffee-900">Redeem Rewards</h2>
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
            ) : (
                <div className="space-y-3">
                    {/* No Reward Option */}
                    <label
                        className={`relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all hover:border-primary-300 hover:shadow-md ${selectedReward === null
                            ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                            : 'border-gray-200 bg-white'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${selectedReward === null ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                                <Coffee className="h-6 w-6" />
                            </div>
                            <div>
                                <p className={`font-semibold ${selectedReward === null ? 'text-primary-900' : 'text-gray-900'}`}>No Reward</p>
                                <p className="text-sm text-gray-500">Save your points for later</p>
                            </div>
                        </div>
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${selectedReward === null ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}`}>
                            {selectedReward === null && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                        <input
                            type="radio"
                            name="reward"
                            className="hidden"
                            checked={selectedReward === null}
                            onChange={() => setSelectedReward(null)}
                        />
                    </label>

                    {rewards.map(reward => {
                        const canAfford = currentUser.currentPoints >= reward.pointsCost;
                        const isSelected = selectedReward?.id === reward.id;
                        return (
                            <label
                                key={reward.id}
                                className={`relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${!canAfford ? 'cursor-not-allowed opacity-60 bg-gray-50' : 'hover:border-primary-300 hover:shadow-md'
                                    } ${isSelected
                                        ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                                        : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                                        <img src={reward.imageUrl} alt={reward.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>{reward.name}</p>
                                        <div className="flex items-center gap-1">
                                            <span className={`text-sm font-bold ${canAfford ? 'text-primary-600' : 'text-gray-400'}`}>{reward.pointsCost} Points</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}`}>
                                    {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                </div>
                                <input
                                    type="radio"
                                    name="reward"
                                    className="hidden"
                                    disabled={!canAfford}
                                    checked={isSelected}
                                    onChange={() => setSelectedReward(reward)}
                                />
                            </label>
                        );
                    })}
                </div>
            )}
            <div className="mt-6 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
                <span className="text-gray-600">Available Points</span>
                <span className="font-display text-lg font-bold text-primary-600">{currentUser.currentPoints}</span>
            </div>
        </div>
    );
};

export default RewardsRedemption;
