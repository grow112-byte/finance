import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/MainLayout';
import { CategoryProvider } from './contexts/CategoryContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TransactionsList from './pages/TransactionsList';
import AddTransaction from './pages/AddTransaction';
import Insights from './pages/Insights';
import Profile from './pages/Profile';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><TransactionsList /></ProtectedRoute>} />
      <Route path="/add" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CategoryProvider>
        <BrowserRouter basename="/finance/">
          <AppRoutes />
        </BrowserRouter>
      </CategoryProvider>
    </AuthProvider>
  );
}

export default App;
