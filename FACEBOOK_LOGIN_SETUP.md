# Facebook Login Setup Instructions

## 1. Firebase Console Configuration
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **RushCoffee-Capstone**.
3. Navigate to **Authentication** > **Sign-in method**.
4. Click **Add new provider** and select **Facebook**.
5. Keep this tab open. You will need to paste the **App ID** and **App Secret** here later.
6. Copy the **OAuth redirect URI** (e.g., `https://rushcoffee-capstone.firebaseapp.com/__/auth/handler`).

## 2. Facebook for Developers Configuration
1. Go to [Facebook for Developers](https://developers.facebook.com/).
2. Log in and click **My Apps** > **Create App**.
3. Select **Consumer** or **Business** as the app type and click **Next**.
4. Enter an **App Name** (e.g., "Rush Coffee") and click **Create app**.
5. On the App Dashboard, find **Facebook Login** and click **Set Up**.
6. Select **Web**.
7. Enter your **Site URL** (e.g., `http://localhost:3000/` for development) and click **Save**.
8. In the left sidebar, go to **Facebook Login** > **Settings**.
9. Under **Valid OAuth Redirect URIs**, paste the **OAuth redirect URI** you copied from Firebase Console.
10. Click **Save Changes**.

## 3. Get App ID and Secret
1. In the left sidebar, go to **Settings** > **Basic**.
2. Copy the **App ID**.
3. Click **Show** next to **App Secret** and copy it.
4. Go back to the **Firebase Console** tab.
5. Paste the **App ID** and **App Secret**.
6. Click **Save**.

## 4. Testing
1. Restart your development server: `npm run dev`.
2. Go to the Login page.
3. Click the **Facebook** button.
4. **Note:** While the Facebook App is in "Development" mode, only you (the admin) can log in. To allow other users, you must add them as "Testers" in the Facebook App Roles or switch the app to "Live" mode.
