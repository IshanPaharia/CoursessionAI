import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/react';
import { setTokenGetter } from '../lib/api';
import api from '../lib/api';

export default function AuthSync({ children }) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    if (isSignedIn && user) {
      api.post('/api/auth/sync', {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
      }).catch(() => {});
    }
  }, [isSignedIn, user]);

  return children;
}
