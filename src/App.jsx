import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';
import Marketplace from './pages/Marketplace';
import NavBar from './components/NavBar';
import { MarketplaceProvider } from './contexts/MarketplaceContext';

function App() {
  return (
    <BrowserRouter>
      <MarketplaceProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
        </Routes>
      </MarketplaceProvider>
    </BrowserRouter>
  );
}

export default App;

