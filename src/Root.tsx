import { LoginScreen } from './components/LoginScreen';
import App from './App';
import { AppProvider } from './state/store';
import { useAuth } from './state/auth';

/**
 * Gates the whole app behind login. This has to sit above AppProvider/App rather than as an
 * early-return inside App itself — App already calls hooks unconditionally, and conditionally
 * skipping them across the logged-out → logged-in transition would violate the rules of hooks.
 * Mounting/unmounting AppProvider here instead means App starts fresh on every login.
 */
export function Root() {
  const { user } = useAuth();
  if (!user) return <LoginScreen />;

  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
