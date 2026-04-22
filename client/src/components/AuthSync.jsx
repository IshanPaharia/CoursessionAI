import { useEffect, useState, useRef } from 'react';
import { useAuth, useUser } from '@clerk/react';
import { setTokenGetter } from '../lib/api';
import api from '../lib/api';
import { useToast } from './Toast';
import PageLoader from './PageLoader';

export default function AuthSync({ children }) {
  const { getToken, isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const toast = useToast();
  const [syncedUserId, setSyncedUserId] = useState(null);
  const syncInProgress = useRef(false);

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return;

    if (isSignedIn && user && syncedUserId !== user.id && !syncInProgress.current) {
      syncInProgress.current = true;
      api.post('/api/auth/sync', {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
      }).catch((err) => {
        console.error('Auth sync failed:', err);
        if (err.response?.status === 503 || err.response?.status === 500) {
          toast('Account sync failed. The database might be offline. Please refresh.', 'error');
        }
      }).finally(() => {
        setSyncedUserId(user.id);
        syncInProgress.current = false;
      });
    }
  }, [isSignedIn, user, isAuthLoaded, isUserLoaded, syncedUserId, toast]);

  // If we are signed in, but haven't finished syncing this user yet, show a loader
  if (isSignedIn && syncedUserId !== user?.id) {
    return <PageLoader />;
  }

  return children;
}

