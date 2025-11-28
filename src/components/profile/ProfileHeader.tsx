import React from 'react';
import { Camera, Coffee, CircleDollarSign, Calendar, Shield, Star } from 'lucide-react';
import { format } from 'date-fns';
import { UserProfile } from '../../context/AuthContext';
import Badge from '../ui/Badge';

interface ProfileHeaderProps {
  user: UserProfile;
  onEditPhoto: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEditPhoto }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleLabel = (role?: 'customer' | 'employee' | 'admin') => {
    if (role === 'admin') return 'Admin';
    if (role === 'employee') return 'Employee';
    if (role === 'customer') return 'Customer';
    return '';
  };

  return (
    <div className="w-full bg-white shadow-sm">
      {/* Banner with Pattern */}
      <div className="relative h-48 w-full overflow-hidden bg-primary-600">

      </div>

      {/* Profile Info */}
      <div className="container mx-auto px-6">
        <div className="relative -mt-16 mb-6 flex flex-col items-center">
          <div className="relative h-32 w-32 transition-transform hover:scale-105">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-full w-full rounded-full border-4 border-white object-cover shadow-xl"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-xl">
                <span className="font-display text-4xl font-bold">
                  {getInitials(user.firstName, user.lastName)}
                </span>
              </div>
            )}
            <button
              onClick={onEditPhoto}
              className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg transition-all hover:bg-primary-50 hover:text-primary-600"
              aria-label="Edit profile photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 text-center">
            <h1 className="font-display text-3xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-500 font-medium">{user.email}</p>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {user.role && (
                <Badge className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1">
                  <Shield className="mr-1.5 h-3.5 w-3.5" />
                  <span>{getRoleLabel(user.role)}</span>
                </Badge>
              )}
              <Badge className={`px-3 py-1 border ${user.tier === 'gold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                user.tier === 'silver' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                  'bg-orange-50 text-orange-800 border-orange-200'
                }`}>
                <span className="capitalize font-semibold">{user.tier} Member</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="border-t border-gray-100 bg-gray-50/50">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-6 py-6 sm:grid-cols-4">
          <div className="flex flex-col items-center justify-center border-r border-gray-200 last:border-0 sm:border-r">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <Coffee className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{user.totalOrders}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Orders</p>
          </div>

          <div className="flex flex-col items-center justify-center border-r border-gray-200 last:border-0 sm:border-r">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">₱{user.totalSpent.toLocaleString()}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Spent</p>
          </div>

          <div className="flex flex-col items-center justify-center border-r border-gray-200 last:border-0 sm:border-r">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <Star className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{user.currentPoints}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Points</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{format(user.createdAt, 'MMM yyyy')}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Joined</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;