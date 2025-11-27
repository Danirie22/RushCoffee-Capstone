import * as React from 'react';
import { Plus, Minus, History, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
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
        <div className="absolute left-0 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg ring-4 ring-white transition-transform group-hover:scale-110">
          <Plus className="h-5 w-5 text-white" strokeWidth={3} />
        </div>
      );
    }
    return (
      <div className="absolute left-0 top-0 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg ring-4 ring-white transition-transform group-hover:scale-110">
        <Minus className="h-5 w-5 text-white" strokeWidth={3} />
      </div>
    );
  };

  return (
    <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
      <div className="bg-gray-50/50 p-6 sm:p-8 border-b border-gray-100">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-coffee-900">Points History</h2>
            <p className="mt-2 text-gray-500 flex items-center gap-2">
              <History className="h-4 w-4" />
              Track your rewards journey
            </p>
          </div>
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {(['all', 'earned', 'redeemed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all duration-200 ${filter === f
                  ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-50 scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
        {sortedHistory.length > 0 ? (
          <div className="relative border-l-2 border-gray-100 ml-5 pl-8 space-y-8">
            {sortedHistory.map((item, index) => (
              <div
                key={item.id}
                className="group relative"
              >
                {renderIcon(item.type)}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-gray-50/50 p-5 transition-all duration-300 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-gray-100/50">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-lg">{item.description}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(item.date, 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold ${item.type === 'earned'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      {item.type === 'earned' ? '+' : ''}{item.points} pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-gray-50/50 py-20 text-center border-2 border-dashed border-gray-200">
            <div className="rounded-full bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <History className="h-10 w-10 text-gray-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">No transactions found</p>
              <p className="mt-1 text-gray-500">Your points history for this filter will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RewardsHistory;