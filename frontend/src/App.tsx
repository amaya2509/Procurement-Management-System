import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

import UsersPage from './pages/UsersPage';
import SuppliersPage from './pages/SuppliersPage';
import PRListPage from './pages/PRListPage';
import PRCreatePage from './pages/PRCreatePage';
import POListPage from './pages/POListPage';
import POCreatePage from './pages/POCreatePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes inside Layout */}
        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pr" element={<PRListPage />} />
            <Route path="/pr/new" element={<PRCreatePage />} />
            <Route path="/po" element={<POListPage />} />
            <Route path="/po/new" element={<POCreatePage />} />
            <Route path="/approvals" element={<div className="text-xl font-bold">Approvals Coming Soon</div>} />
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
