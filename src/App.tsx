import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store, type RootState } from './store/store';
import { CustomThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Capacity from './pages/Capacity';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import GrowerGroups from './pages/GrowerGroups';
import Growers from './pages/Growers';
import Preinward from './pages/transactions-in/Preinward';
import Quality from './pages/transactions-in/Quality';
import Dockyard from './pages/transactions-in/Dockyard';
import Slotting from './pages/transactions-in/Slotting';

import PlaceholderPage from './pages/PlaceholderPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <CustomThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Authenticated Layout Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/capacity" element={<Capacity />} />
              <Route path="/grower-groups" element={<GrowerGroups />} />
              <Route path="/growers" element={<Growers />} />
              <Route path="/growers/reports" element={<PlaceholderPage title="Grower Reports" />} />
              
              {/* Transactions In */}
              <Route path="/transactions-in/preinward" element={<Preinward />} />
              <Route path="/transactions-in/quality" element={<Quality />} />
              <Route path="/transactions-in/dockyard" element={<Dockyard />} />
              <Route path="/transactions-in/slotting" element={<Slotting />} />
              
              {/* Transactions Out */}
              <Route path="/transactions-out/calendar" element={<PlaceholderPage title="Dispatch Calendar" />} />
              <Route path="/transactions-out/demand" element={<PlaceholderPage title="Demand Orders" />} />
              <Route path="/transactions-out/store-out" element={<PlaceholderPage title="Store Out" />} />
              <Route path="/transactions-out/packing-draft" element={<PlaceholderPage title="Packing Drafts" />} />
              <Route path="/transactions-out/packing-order" element={<PlaceholderPage title="Packing Orders" />} />
              <Route path="/transactions-out/dispatch" element={<PlaceholderPage title="Final Dispatch" />} />
              
              {/* Reports */}
              <Route path="/reports/inbound" element={<PlaceholderPage title="Inbound Ledger Audits" />} />
              <Route path="/reports/outbound" element={<PlaceholderPage title="Outbound Settlement Audits" />} />

              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </CustomThemeProvider>
    </Provider>
  );
}

export default App;
