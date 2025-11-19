import React, { useState, useEffect, FormEvent } from 'react';
import { db } from '../../firebaseConfig';
import { Loader2, Save, Store, Clock, Mail, Phone, Megaphone, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import { useCart } from '../../context/CartContext';

interface ShopSettings {
  shopName: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: string;
  announcement: {
    enabled: boolean;
    message: string;
  };
}

const defaultSettings: ShopSettings = {
  shopName: 'Rush Coffee',
  address: '123 Coffee Street, Malate, Manila',
  phone: '+63 917 123 4567',
  email: 'hello@rushcoffee.ph',
  operatingHours: 'Mon-Sun: 7:00 AM - 10:00 PM',
  announcement: {
    enabled: false,
    message: 'Welcome to Rush Coffee! Enjoy our new Matcha series.',
  },
};

const AdminSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<ShopSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [pageError, setPageError] = useState<React.ReactNode | null>(null);
    const { showToast } = useCart();

    useEffect(() => {
        const fetchSettings = async () => {
            const settingsDocRef = db.collection('settings').doc('shopConfig');
            try {
                const docSnap = await settingsDocRef.get();
                if (docSnap.exists) {
                    setSettings({ ...defaultSettings, ...docSnap.data() } as ShopSettings);
                } else {
                     // This is not an error, just a first-time setup state.
                    setSettings(defaultSettings);
                }
            } catch (error: any) {
                console.error("Error fetching settings:", error);
                if (error.code === 'permission-denied') {
                    const rulesToFix = `
service cloud.firestore {
  match /databases/{database}/documents {
    // ... your other rules ...

    // ADD OR UPDATE THIS RULE:
    match /settings/{docId} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}`;
                    const errorMessage = (
                        <>
                            <p className="font-bold">Permission Denied: Cannot access Shop Settings.</p>
                            <p className="mt-1">This is a Firestore security rule issue. Please update your rules in the Firebase Console to allow admins to manage settings.</p>
                            <p className="mt-2">Ensure you have a rule like this in your <code className="bg-red-200 text-red-900 px-1 rounded">firestore.rules</code> file:</p>
                            <pre className="mt-2 text-xs bg-red-200 text-red-900 p-2 rounded-md overflow-x-auto">
                                <code>{rulesToFix.trim()}</code>
                            </pre>
                        </>
                    );
                    setPageError(errorMessage);
                } else {
                    setPageError("An error occurred while loading shop settings. Please check the console for details.");
                }
                setSettings(defaultSettings);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleAnnouncementChange = (field: 'message' | 'enabled', value: string | boolean) => {
        setSettings(prev => ({
            ...prev,
            announcement: {
                ...prev.announcement,
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const settingsDocRef = db.collection('settings').doc('shopConfig');
            await settingsDocRef.set(settings, { merge: true });
            showToast('Settings saved successfully!');
            if (pageError) setPageError(null); // Clear error on successful save
        } catch (error: any) {
            console.error("Error saving settings:", error);
             if (error.code === 'permission-denied') {
                setPageError('Save Failed: Your account does not have permission to write to shop settings. Please check your Firestore security rules. Changes were not saved.');
            } else {
                setPageError('Failed to save settings. An error occurred.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="mb-6 font-display text-3xl font-bold text-gray-800">Shop Settings</h1>

            {pageError && (
                <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                       {pageError}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
                <fieldset disabled={!!pageError} className="space-y-6 disabled:opacity-50">
                    <Card>
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
                            <Store className="h-5 w-5 text-primary-600" />
                            Shop Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">Shop Name</label>
                                <input type="text" name="shopName" id="shopName" value={settings.shopName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                                <input type="text" name="address" id="address" value={settings.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
                                    <input type="tel" name="phone" id="phone" value={settings.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Contact Email</label>
                                    <input type="email" name="email" id="email" value={settings.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                         <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
                            <Clock className="h-5 w-5 text-primary-600" />
                            Operating Hours
                        </h2>
                        <div>
                            <label htmlFor="operatingHours" className="block text-sm font-medium text-gray-700">Display Text</label>
                            <textarea name="operatingHours" id="operatingHours" value={settings.operatingHours} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., Mon-Fri: 7am - 8pm&#10;Sat-Sun: 8am - 6pm" />
                            <p className="mt-1 text-xs text-gray-500">This text will be displayed in the footer and contact page.</p>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
                            <Megaphone className="h-5 w-5 text-primary-600" />
                            System-wide Announcement
                        </h2>
                        <div className="space-y-4">
                            <ToggleSwitch
                                Icon={Megaphone}
                                label="Enable Announcement Banner"
                                description="Show a banner at the top of the site."
                                enabled={settings.announcement.enabled}
                                onChange={(val) => handleAnnouncementChange('enabled', val)}
                            />
                             <div>
                                <label htmlFor="announcementMessage" className="block text-sm font-medium text-gray-700">Announcement Message</label>
                                <input type="text" name="announcementMessage" id="announcementMessage" value={settings.announcement.message} onChange={(e) => handleAnnouncementChange('message', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                            </div>
                        </div>
                    </Card>
                </fieldset>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving || !!pageError}>
                        {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                        Save Settings
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettingsPage;
