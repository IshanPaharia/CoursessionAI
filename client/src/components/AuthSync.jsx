import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/react';
import { setTokenGetter } from '../lib/api';
import api from '../lib/api';
import { useToast } from './Toast';

export default function AuthSync({ children }) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const toast = useToast();

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    if (isSignedIn && user) {
      api.post('/api/auth/sync', {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
      }).catch((err) => {
        console.error('Auth sync failed:', err);
        if (err.response?.status === 503 || err.response?.status === 500) {
          toast('Account sync failed. The database might be offline. Please refresh.', 'error');
        }
      });
    }
  }, [isSignedIn, user, toast]);

  return children;
}
