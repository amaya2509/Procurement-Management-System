import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

import UsersPage from './pages/UsersPage';
import SuppliersPage from './pages/SuppliersPage';
import PRListPage from './pages/PRListPage';
import PRCreatePage from './pages/PRCreatePage';
import PRDetailPage from './pages/PRDetailPage';
import POListPage from './pages/POListPage';
import POCreatePage from './pages/POCreatePage';
import PODetailPage from './pages/PODetailPage';
import ApprovalsPage from './pages/ApprovalsPage';
import ApprovalDetailPage from './pages/ApprovalDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes inside Layout */}
        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />

            {/* Purchase Requests */}
            <Route path="/pr" element={<PRListPage />} />
            <Route path="/pr/new" element={<PRCreatePage />} />
            <Route path="/pr/:id" element={<PRDetailPage />} />

            {/* Purchase Orders */}
            <Route path="/po" element={<POListPage />} />
            <Route path="/po/new" element={<POCreatePage />} />
            <Route path="/po/:id" element={<PODetailPage />} />

            {/* Approvals */}
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/approvals/:id" element={<ApprovalDetailPage />} />

            {/* Admin */}
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
