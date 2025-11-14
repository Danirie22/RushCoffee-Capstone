
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { User, ShoppingBag, Settings, Edit, Mail, Phone, Calendar, Star, Loader2, Upload, MessageSquare } from 'lucide-react';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ProfileHeader from '../../components/profile/ProfileHeader';
import EditProfileForm from '../../components/profile/EditProfileForm';
import OrderHistory from '../../components/profile/OrderHistory';
import SettingsSection from '../../components/profile/SettingsSection';
import FeedbackSection from '../../components/profile/FeedbackSection';
import { UserProfile } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { mockProducts } from '../../data/mockProducts';
import { useCart } from '../../context/CartContext';

type Tab = 'overview' | 'orders' | 'settings' | 'feedback';

const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { orderHistory } = useOrder();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  // Photo Upload State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { showToast } = useCart();

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
      setUser(prevUser => prevUser ? { ...prevUser, preferences: { ...prevUser.preferences, ...updates }} : null);
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
    if (!photoFile || !user) return;
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
        const reader = new FileReader();
        reader.readAsDataURL(photoFile);
        reader.onloadend = () => {
            // This is a mock update. A real app would get a URL from a storage service.
            // For now, we update the local user state. In a full app, this would also call a context update function.
            setUser({ ...user, photoURL: reader.result as string });
            setIsUploading(false);
            setIsPhotoModalOpen(false);
            setPhotoFile(null);
            showToast('Profile photo updated!');
        };
    }, 1500);
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
        return <OrderHistory orders={orderHistory} />;
      case 'settings':
        return <SettingsSection preferences={user.preferences} onUpdatePreferences={handleUpdatePreferences} />;
      case 'feedback':
        return <FeedbackSection user={user} />;
      case 'overview':
      default:
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {isEditing ? (
                <EditProfileForm user={user} onSave={handleSaveProfile} onCancel={() => setIsEditing(false)} />
              ) : (
                <Card>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-coffee-900">Quick Info</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                  </div>
                  <ul className="mt-4 space-y-3 text-gray-700">
                    <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-gray-400" /> {user.email}</li>
                    <li className="flex items-center gap-3"><Phone className="h-5 w-5 text-gray-400" /> {user.phone || 'Not provided'}</li>
                    <li className="flex items-center gap-3"><Calendar className="h-5 w-5 text-gray-400" /> Member since {format(user.createdAt, 'MMMM dd, yyyy')}</li>
                  </ul>
                </Card>
              )}
              <OrderHistory orders={orderHistory} limit={3} showViewAll onViewAll={() => setActiveTab('orders')} />
            </div>
            <div className="space-y-6 lg:col-span-1">
              {favoriteProduct && (
                <Card>
                  <h3 className="font-display text-xl font-bold text-coffee-900">Your Favorite</h3>
                  <div className="mt-4 flex items-center gap-4">
                    <img src={favoriteProduct.imageUrl} alt={favoriteProduct.name} className="h-20 w-20 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-gray-800">{favoriteProduct.name}</p>
                      <p className="text-sm text-gray-500">{favoriteProduct.category}</p>
                       <Button size="sm" variant="secondary" className="mt-2">Order Again</Button>
                    </div>
                  </div>
                </Card>
              )}
               <Card>
                    <h3 className="font-display text-xl font-bold text-coffee-900">Quick Stats</h3>
                     <ul className="mt-4 space-y-3 text-gray-700">
                        <li className="flex justify-between"><span>Orders this week:</span> <span className="font-bold">5</span></li>
                        <li className="flex justify-between"><span>Orders this month:</span> <span className="font-bold">12</span></li>
                        <li className="flex justify-between"><span>Total Savings:</span> <span className="font-bold text-green-600">₱250.00</span></li>
                    </ul>
                </Card>
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
        <div className="sticky top-20 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto max-w-7xl px-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {tabItems.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`group inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <tab.Icon className={`h-5 w-5 ${activeTab !== tab.id && 'text-gray-400 group-hover:text-gray-500'}`} />
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
                    <img src={photoPreview} alt="Preview" className="h-32 w-32 rounded-full object-cover"/>
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
                    <div className="bg-primary-600 h-2.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
                </div>
            )}
            <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsPhotoModalOpen(false)}>Cancel</Button>
                <Button onClick={handleUploadPhoto} disabled={!photoFile || isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                    Upload Photo
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
