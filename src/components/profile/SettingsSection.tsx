import React, { useState } from 'react';
import { Bell, Mail, Palette, Shield, Key, Trash2, AlertTriangle, Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { UserPreferences } from '../../data/mockUser';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface SettingsSectionProps {
  preferences: UserPreferences;
  onUpdatePreferences: (preferences: Partial<UserPreferences>) => void;
}

interface ToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  Icon: React.ElementType;
}

const ToggleSwitch: React.FC<ToggleProps> = ({ label, description, enabled, onChange, Icon }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-gray-500" />
      <div>
        <span className="font-medium text-gray-800">{label}</span>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${enabled ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </button>
  </div>
);

const SettingsSection: React.FC<SettingsSectionProps> = ({ preferences, onUpdatePreferences }) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { showToast } = useCart();
  const { updateUserPassword } = useAuth();

  const handlePrefChange = (category: keyof UserPreferences, key: any, value: any) => {
    const updatedPrefs = {
      ...localPrefs,
      [category]: {
        ...(localPrefs[category] as object),
        [key]: value,
      },
    };
    setLocalPrefs(updatedPrefs);
    onUpdatePreferences({ [category]: updatedPrefs[category] });
    showToast('Preferences updated!');
  };

  // Password Change State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete Account State
  const [deleteConfirm, setDeleteConfirm] = useState({ password: '', checkbox: false });
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPasswordError(null);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwords.new !== passwords.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (passwords.new.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await updateUserPassword(passwords.current, passwords.new);
      showToast("Password updated successfully!");
      setIsPasswordModalOpen(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error("Error updating password:", error);
      if (error.code === 'auth/wrong-password') {
        setPasswordError("Incorrect current password.");
      } else {
        setPasswordError("Failed to update password. Please try again.");
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <>
      <Card>
        <h2 className="mb-4 font-display text-2xl font-bold text-coffee-900">Preferences & Settings</h2>

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-500">Notifications</h3>
          <ToggleSwitch Icon={Bell} label="Push Notifications" description="Get notified when order is ready" enabled={localPrefs.notifications.push} onChange={(val) => handlePrefChange('notifications', 'push', val)} />
          <ToggleSwitch Icon={Mail} label="Email Updates" description="Receive order updates via email" enabled={localPrefs.notifications.emailUpdates} onChange={(val) => handlePrefChange('notifications', 'emailUpdates', val)} />
          <ToggleSwitch Icon={Mail} label="Marketing Emails" description="Get news and promotions" enabled={localPrefs.notifications.marketing} onChange={(val) => handlePrefChange('notifications', 'marketing', val)} />
        </div>

        <hr className="my-6" />

        {/* Appearance */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-800">Appearance</h3>
          </div>
          <div className="flex gap-2 rounded-full bg-gray-100 p-1">
            {(['light', 'dark', 'auto'] as const).map(theme => (
              <button key={theme} onClick={() => handlePrefChange('theme', 'theme', theme)} className={`w-full rounded-full py-1.5 text-sm font-semibold capitalize transition-colors ${localPrefs.theme === theme ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'}`}>
                {theme}
              </button>
            ))}
          </div>
        </div>

        <hr className="my-6" />

        {/* Privacy */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-500">Privacy</h3>
          <ToggleSwitch Icon={Shield} label="Share anonymous usage data" description="Help us improve our services" enabled={localPrefs.privacy.shareUsageData} onChange={(val) => handlePrefChange('privacy', 'shareUsageData', val)} />
          <ToggleSwitch Icon={Shield} label="Personalized recommendations" description="Get recommendations based on your activity" enabled={localPrefs.privacy.personalizedRecs} onChange={(val) => handlePrefChange('privacy', 'personalizedRecs', val)} />
        </div>
      </Card>

      {/* Account Management (Danger Zone) */}
      <Card className="mt-6 border-l-4 border-red-500">
        <h2 className="mb-4 font-display text-xl font-bold text-red-700">Account Management</h2>
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Change Password</h3>
            <p className="text-sm text-gray-500">Update your password for better security.</p>
          </div>
          <Button variant="secondary" onClick={() => setIsPasswordModalOpen(true)}><Key className="mr-2 h-4 w-4" />Change Password</Button>
        </div>
        <hr className="my-4" />
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Delete Account</h3>
            <p className="text-sm text-gray-500">Permanently delete your account and all data.</p>
          </div>
          <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Delete Account</Button>
        </div>
      </Card>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password">
        <form onSubmit={handleSavePassword} className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {passwordError}
            </div>
          )}

          <Input
            label="Current Password"
            type={showPasswords.current ? "text" : "password"}
            name="current"
            value={passwords.current}
            onChange={handlePasswordChange}
            required
            endIcon={
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="text-gray-900 hover:text-gray-700 cursor-pointer"
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <Input
            label="New Password"
            type={showPasswords.new ? "text" : "password"}
            name="new"
            value={passwords.new}
            onChange={handlePasswordChange}
            required
            endIcon={
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="text-gray-900 hover:text-gray-700 cursor-pointer"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <Input
            label="Confirm New Password"
            type={showPasswords.confirm ? "text" : "password"}
            name="confirm"
            value={passwords.confirm}
            onChange={handlePasswordChange}
            required
            endIcon={
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="text-gray-900 hover:text-gray-700 cursor-pointer"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSavingPassword}>
              {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Account">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Are you absolutely sure?</h3>
          <p className="mt-2 text-sm text-gray-500">This action cannot be undone. This will permanently delete your account, orders, and rewards.</p>
          {/* Delete form would go here */}
          <p className="mt-4 text-sm text-gray-600">Account deletion functionality is coming soon.</p>
        </div>
      </Modal>
    </>
  );
};

export default SettingsSection;