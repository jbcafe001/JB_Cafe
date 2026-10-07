import React, { useEffect } from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { LoginView } from './components/auth/LoginView';
import { ForcePasswordChangeView } from './components/auth/ForcePasswordChangeView';
import { WaiterView } from './components/waiter/WaiterView';
import { KitchenView } from './components/kitchen/KitchenView';
import { AdminView } from './components/admin/AdminView';

const MainAppContent: React.FC = () => {
  const { isLoggedIn, isAuthLoading, currentRole, requiresPasswordChange } = useCafe();

  // Globally prevent mouse wheel from changing number input values
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
        (target as HTMLInputElement).blur();
      }
    };
    
    // Add event listener to the window
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Wait for Firebase Auth to resolve before rendering anything
  // This prevents the login-page flash when the user is already logged in
  if (isAuthLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F9F8F6',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '4px solid #E7E5E4',
          borderTop: '4px solid #D97706',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-[#1C1917] selection:bg-[#B45309] selection:text-white antialiased">
      {/* Main View Router based on Authentication and Current Role */}
      {!isLoggedIn ? (
        <LoginView />
      ) : requiresPasswordChange ? (
        <ForcePasswordChangeView />
      ) : (
        <div className="flex-1 flex flex-col">
          {currentRole === 'waiter' && <WaiterView />}
          {currentRole === 'cook' && <KitchenView />}
          {(currentRole === 'admin' || currentRole === 'admin_kunafa') && <AdminView />}
          {currentRole === 'others' && (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-stone-500">
              <p>Your role ({currentRole}) does not have dashboard access.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <CafeProvider>
      <MainAppContent />
    </CafeProvider>
  );
}

export default App;
