import React from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { LoginView } from './components/auth/LoginView';
import { WaiterView } from './components/waiter/WaiterView';
import { KitchenView } from './components/kitchen/KitchenView';
import { AdminView } from './components/admin/AdminView';

const MainAppContent: React.FC = () => {
  const { isLoggedIn, currentRole } = useCafe();

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-[#1C1917] selection:bg-[#B45309] selection:text-white antialiased">
      {/* Main View Router based on Authentication and Current Role */}
      {!isLoggedIn ? (
        <LoginView />
      ) : (
        <div className="flex-1 flex flex-col">
          {currentRole === 'waiter' && <WaiterView />}
          {currentRole === 'cook' && <KitchenView />}
          {currentRole === 'admin' && <AdminView />}
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
