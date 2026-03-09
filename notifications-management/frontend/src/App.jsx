import { useMemo } from 'react';
import NotificationCenter from './components/NotificationCenter';
import { getCurrentUser } from './utils/auth';

export default function App() {
  const currentUser = useMemo(() => getCurrentUser(), []);

  return <NotificationCenter currentUser={currentUser} />;
}