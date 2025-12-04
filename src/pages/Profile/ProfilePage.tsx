import React, { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { User, ShoppingBag, Settings, Edit, Mail, Phone, Calendar, Star, Loader2, Upload, MessageSquare, TrendingUp } from 'lucide-react';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ProfileHeader from '../../components/profile/ProfileHeader';
import EditProfileForm from '../../components/profile/EditProfileForm';
import OrderHistory from '../../components/profile/OrderHistory';
import SettingsSection from '../../components/profile/SettingsSection';
import FeedbackSection from '../../components/profile/FeedbackSection';
import OrderHistoryCardSkeleton from '../../components/profile/OrderHistoryCardSkeleton';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { mockProducts } from '../../data/mockProducts';
import { useCart } from '../../context/CartContext';

type Tab = 'overview' | 'orders' | 'settings' | 'feedback';

const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile, updateUserPhoto } = useAuth();
  const { orderHistory, isHistoryLoading } = useOrder();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditing, setIsEditing] = useState(false);

  // Photo Upload State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showToast, addToCart } = useCart();

  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const favoriteProduct = useMemo(() => {
    // This is a mock implementation since we don't track favorite items yet.
    // In a real app, this would be part of the user's stats.
    if (!user) return null;
    return mockProducts.find(p => p.id === 'cb-01');
  }, [user]);

  const handleSaveProfile = (updates: Partial<UserProfile>) => {
    if (user && updateUserProfile) {
      updateUserProfile(updates);
      setIsEditing(false);
    }
  };

  const handleUpdatePreferences = (updates: Partial<UserProfile['preferences']>) => {
    if (user) {
      setUser(prevUser => prevUser ? { ...prevUser, preferences: { ...prevUser.preferences, ...updates } } : null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > 2 * 1024 * 1024) { // 2MB limit
        showToast('File size should not exceed 2MB.');
        return;
      }
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleUploadPhoto = () => {
    if (!photoFile || !user || !updateUserPhoto) return;
    setIsUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(photoFile);
    reader.onloadend = async () => {
      const base64Photo = reader.result as string;
      try {
        await updateUserPhoto(base64Photo);
        setIsUploading(false);
        setIsPhotoModalOpen(false);
        setPhotoFile(null);
        showToast('Profile photo updated!');
      } catch (error) {
        console.error("Error updating photo:", error);
        showToast('Failed to update photo.');
        setIsUploading(false);
      }
    };
  };

  const handleOrderAgain = () => {
    if (favoriteProduct) {
      // Add the default (Grande) size to cart
      addToCart(favoriteProduct, favoriteProduct.sizes[0]);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  const tabItems = [
    { id: 'overview', label: 'Overview', Icon: User },
    { id: 'orders', label: 'Order History', Icon: ShoppingBag },
    { id: 'feedback', label: 'My Feedback', Icon: MessageSquare },
    { id: 'settings', label: 'Settings', Icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        return isHistoryLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <OrderHistoryCardSkeleton key={i} />)}
          </div>
        ) : (
          <OrderHistory orders={orderHistory} />
        );
      case 'settings':
        return <SettingsSection preferences={user.preferences} onUpdatePreferences={handleUpdatePreferences} />;
      case 'feedback':
        return <FeedbackSection user={user} />;
      case 'overview':
      default:
        return (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {/* Flavor Profile Teaser Card */}
              <Card className="bg-gradient-to-r from-primary-900 to-primary-800 text-white border-none shadow-lg overflow-hidden relative group cursor-pointer" onClick={() => window.location.hash = '#/flavor-profile'}>
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl transition-transform group-hover:scale-150 duration-700"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400 font-bold text-sm uppercase tracking-wider">New Feature</span>
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-2">Your Flavor Profile</h3>
                    <p className="text-primary-100 max-w-md">
                      Discover your unique coffee personality! See your caffeine stats, favorite flavors, and get personalized recommendations.
                    </p>
                    <Button variant="secondary" className="mt-4 bg-white text-primary-900 hover:bg-primary-50 border-none">
                      View My Profile
                    </Button>
                  </div>
                  <div className="hidden sm:block">
                    <TrendingUp className="h-24 w-24 text-white opacity-20" />
                  </div>
                </div>
              </Card>
              {isEditing ? (
                <EditProfileForm user={user} onSave={handleSaveProfile} onCancel={() => setIsEditing(false)} />
              ) : (
                <Card className="overflow-hidden border-none shadow-md transition-shadow hover:shadow-lg">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                    <h3 className="font-display text-xl font-bold text-gray-900">Personal Information</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary-600 hover:bg-primary-50">
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Email Address</p>
                        <p className="text-gray-900 font-medium">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Phone Number</p>
                        <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Member Since</p>
                        <p className="text-gray-900 font-medium">{format(user.createdAt, 'MMMM dd, yyyy')}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              {isHistoryLoading ? (
                <Card className="border-none shadow-md">
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-4">Recent Orders</h3>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => <OrderHistoryCardSkeleton key={i} />)}
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-gray-900">Recent Orders</h3>
                    <Button variant="ghost" onClick={() => setActiveTab('orders')} className="text-primary-600">View All</Button>
                  </div>
                  <OrderHistory orders={orderHistory} limit={3} showViewAll={false} />
                </div>
              )}
            </div>
            <div className="space-y-8 lg:col-span-1">
              <Card className={`border-none shadow-md text-white overflow-hidden relative ${user.tier === 'gold' ? 'bg-gradient-to-br from-yellow-500 to-yellow-700' :
                user.tier === 'silver' ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                  'bg-gradient-to-br from-orange-400 to-orange-600'
                }`}>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10 blur-xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-black opacity-10 blur-xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Current Tier</p>
                      <h3 className="font-display text-2xl font-bold capitalize">{user.tier} Member</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Star className="h-6 w-6 text-white" fill="currentColor" />
                    </div>
                  </div>

                  <div className="mb-2 flex justify-between items-end">
                    <span className="text-3xl font-bold">{user.currentPoints}</span>
                    <span className="text-sm text-white/80 mb-1">points earned</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-black/20 rounded-full h-2 mb-4">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      style={{ width: `${Math.min((user.currentPoints % 1000) / 10, 100)}%` }}
                    ></div>
                  </div>

                  <p className="text-sm text-white/90">
                    {user.tier === 'gold'
                      ? 'You are at the highest tier! Enjoy your exclusive benefits.'
                      : `Earn ${1000 - (user.currentPoints % 1000)} more points to reach ${user.tier === 'bronze' ? 'Silver' : 'Gold'} tier.`}
                  </p>
                </div>
              </Card>

              {favoriteProduct && (
                <Card className="border-none shadow-md transition-shadow hover:shadow-lg overflow-hidden group">
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-4">Your Favorite</h3>
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl mb-4">
                    <img
                      src={favoriteProduct.imageUrl}
                      alt={favoriteProduct.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                      <p className="font-bold text-white text-lg">{favoriteProduct.name}</p>
                      <p className="text-white/80 text-sm">{favoriteProduct.category}</p>
                    </div>
                  </div>
                  <Button className="w-full rounded-xl py-3 font-bold shadow-lg shadow-primary-600/20" onClick={handleOrderAgain}>
                    Order Again <ShoppingBag className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <ProfileHeader user={user} onEditPhoto={() => setIsPhotoModalOpen(true)} />

        {/* Tab Navigation */}
        <div className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm sm:top-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto py-4 no-scrollbar">
              {tabItems.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`group inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <tab.Icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="container mx-auto max-w-7xl p-6">
          {renderTabContent()}
        </div>
      </main>
      <Footer />

      {/* Photo Upload Modal */}
      <Modal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} title="Upload New Photo">
        <div className="space-y-4">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:bg-gray-100"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="h-32 w-32 rounded-full object-cover" />
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-semibold text-gray-600">Click to upload</span>
                <span className="mt-1 block text-xs text-gray-500">PNG or JPG (MAX. 2MB)</span>
              </>
            )}
          </div>
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsPhotoModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUploadPhoto} disabled={!photoFile || isUploading}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload Photo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;