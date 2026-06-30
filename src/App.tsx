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
import GrowerReports from './pages/GrowerReports';
import Preinward from './pages/transactions-in/Preinward';
import Quality from './pages/transactions-in/Quality';
import Dockyard from './pages/transactions-in/Dockyard';
import Slotting from './pages/transactions-in/Slotting';

// Transactions Out
import DispatchCalendar from './pages/transactions-out/Calendar';
import DemandOrder from './pages/transactions-out/DemandOrder';
import StoreOut from './pages/transactions-out/StoreOut';
import PackingDraft from './pages/transactions-out/PackingDraft';
import PackingOrder from './pages/transactions-out/PackingOrder';
import Dispatch from './pages/transactions-out/Dispatch';
import FinalOutward from './pages/transactions-out/FinalOutward';

// Reports
import InboundReports from './pages/reports/InboundReports';
import OutboundReports from './pages/reports/OutboundReports';
import Invoices from './pages/Invoices';

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
              <Route path="/growers/reports" element={<GrowerReports />} />
              
              {/* Transactions In */}
              <Route path="/transactions-in/preinward" element={<Preinward />} />
              <Route path="/transactions-in/quality" element={<Quality />} />
              <Route path="/transactions-in/dockyard" element={<Dockyard />} />
              <Route path="/transactions-in/slotting" element={<Slotting />} />
              
              {/* Transactions Out */}
              <Route path="/transactions-out/calendar" element={<DispatchCalendar />} />
              <Route path="/transactions-out/demand" element={<DemandOrder />} />
              <Route path="/transactions-out/store-out" element={<StoreOut />} />
              <Route path="/transactions-out/packing-draft" element={<PackingDraft />} />
              <Route path="/transactions-out/packing-order" element={<PackingOrder />} />
              <Route path="/transactions-out/dispatch" element={<Dispatch />} />
              <Route path="/transactions-out/final-outward" element={<FinalOutward />} />
              
              {/* Reports */}
              <Route path="/reports/inbound" element={<InboundReports />} />
              <Route path="/reports/outbound" element={<OutboundReports />} />
              <Route path="/invoices" element={<Invoices />} />

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
