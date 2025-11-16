import React from 'react';
import { Camera, Coffee, CircleDollarSign, Calendar, Shield } from 'lucide-react';
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

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-48 w-full bg-gradient-to-r from-primary-500 to-coffee-600"></div>

      {/* Profile Info */}
      <div className="-mt-16 px-6">
        <div className="relative mx-auto h-32 w-32">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={`${user.firstName} ${user.lastName}`}
              className="h-full w-full rounded-full border-4 border-white object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg">
              <span className="font-display text-4xl font-bold">
                {getInitials(user.firstName, user.lastName)}
              </span>
            </div>
          )}
          <button
            onClick={onEditPhoto}
            className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-colors hover:bg-primary-700"
            aria-label="Edit profile photo"
          >
            <Camera className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <h1 className="font-display text-3xl font-bold text-coffee-900">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600">{user.email}</p>
          {user.role && (
             <Badge className="mt-2 bg-yellow-100 text-yellow-800 capitalize">
                <Shield className="mr-1 h-3 w-3" />
                {user.role}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="mt-8 grid grid-cols-3 gap-4 border-y border-gray-200 bg-gray-50/50 px-6 py-4">
        <div className="text-center">
          <Coffee className="mx-auto mb-1 h-6 w-6 text-primary-600" />
          <p className="text-xl font-bold text-coffee-900">{user.totalOrders}</p>
          <p className="text-xs text-gray-500">Total Orders</p>
        </div>
        <div className="text-center">
          <CircleDollarSign className="mx-auto mb-1 h-6 w-6 text-primary-600" />
          <p className="text-xl font-bold text-coffee-900">₱{user.totalSpent.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Spent</p>
        </div>
        <div className="text-center">
          <Calendar className="mx-auto mb-1 h-6 w-6 text-primary-600" />
          <p className="text-xl font-bold text-coffee-900">{format(user.createdAt, 'MMMM yyyy')}</p>
          <p className="text-xs text-gray-500">Member Since</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;