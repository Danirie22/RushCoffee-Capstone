import React, { useState, useMemo } from 'react';
import { Plus, Minus, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { RewardHistory } from '../../data/mockRewards';
import Card from '../../../components/ui/Card';

interface RewardsHistoryProps {
  history: RewardHistory[];
}

const RewardsHistory: React.FC<RewardsHistoryProps> = ({ history }) => {
  const [filter, setFilter] = useState<'all' | 'earned' | 'redeemed'>('all');

  const filteredHistory = useMemo(() => {
    if (filter === 'all') return history;
    return history.filter(item => item.type === filter);
  }, [history, filter]);

  const sortedHistory = useMemo(() => {
    return [...filteredHistory].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredHistory]);

  const renderIcon = (type: 'earned' | 'redeemed') => {
    if (type === 'earned') {
      return (
        <div className="absolute left-0 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-green-100 ring-8 ring-white">
          <Plus className="h-5 w-5 text-green-600" />
        </div>
      );
    }
    return (
      <div className="absolute left-0 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-red-100 ring-8 ring-white">
        <Minus className="h-5 w-5 text-red-600" />
      </div>
    );
  };

  return (
    <Card>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="font-display text-2xl font-bold text-coffee-900">Points History</h2>
        <div className="flex gap-2 rounded-full bg-gray-100 p-1">
          {(['all', 'earned', 'redeemed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-sm font-semibold capitalize transition-colors ${
                filter === f ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 max-h-96 overflow-y-auto pr-2">
        {sortedHistory.length > 0 ? (
          <div className="relative border-l-2 border-gray-200 pl-8">
            {sortedHistory.map((item, index) => (
              <div key={item.id} className={`relative ${index < sortedHistory.length - 1 ? 'pb-8' : ''}`}>
                {renderIcon(item.type)}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{item.description}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(item.date, { addSuffix: true })}
                    </p>
                  </div>
                  <p className={`text-lg font-bold ${item.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'earned' ? '+' : ''}{item.points}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <History className="h-12 w-12 text-gray-300" />
            <p className="font-semibold text-gray-700">No transactions yet</p>
            <p className="text-sm text-gray-500">Your points history for this filter will appear here.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RewardsHistory;
