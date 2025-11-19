import * as React from 'react';
import { Plus, Minus, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { RewardHistory } from '../../data/mockRewards';
import Card from '../ui/Card';

interface RewardsHistoryProps {
  history: RewardHistory[];
}

const RewardsHistory: React.FC<RewardsHistoryProps> = ({ history }) => {
  const [filter, setFilter] = React.useState<'all' | 'earned' | 'redeemed'>('all');

  const filteredHistory = React.useMemo(() => {
    if (filter === 'all') return history;
    return history.filter(item => item.type === filter);
  }, [history, filter]);

  const sortedHistory = React.useMemo(() => {
    return [...filteredHistory].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredHistory]);

  const renderIcon = (type: 'earned' | 'redeemed') => {
    if (type === 'earned') {
      return (
        <div className="absolute left-1 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg ring-2 ring-white transition-transform hover:scale-110">
          <Plus className="h-4 w-4 text-white" strokeWidth={3} />
        </div>
      );
    }
    return (
      <div className="absolute left-1 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg ring-2 ring-white transition-transform hover:scale-110">
        <Minus className="h-4 w-4 text-white" strokeWidth={3} />
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-3xl font-bold text-coffee-900">Points History</h2>
          <p className="mt-1 text-sm text-gray-500">Track your rewards journey</p>
        </div>
        <div className="flex gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-gray-200">
          {(['all', 'earned', 'redeemed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all duration-200 ${filter === f
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
        {sortedHistory.length > 0 ? (
          <div className="relative border-l-2 border-gray-300 pl-6">
            {sortedHistory.map((item, index) => (
              <div
                key={item.id}
                className={`group relative transition-all duration-200 hover:translate-x-1 ${index < sortedHistory.length - 1 ? 'pb-10' : ''
                  }`}
              >
                {renderIcon(item.type)}
                <div className="ml-8 flex items-start justify-between gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-shadow duration-200 group-hover:shadow-md">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{item.description}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatDistanceToNow(item.date, { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className={`text-xl font-bold ${item.type === 'earned'
                        ? 'text-green-600'
                        : 'text-red-600'
                      }`}>
                      {item.type === 'earned' ? '+' : ''}{item.points}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-gray-50 py-16 text-center">
            <div className="rounded-full bg-gray-100 p-4">
              <History className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">No transactions yet</p>
              <p className="mt-1 text-sm text-gray-500">Your points history for this filter will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RewardsHistory;