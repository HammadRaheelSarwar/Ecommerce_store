import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingCart from './components/FloatingCart';
import LivePurchasePopup from './components/LivePurchasePopup';
import ExitIntentPopup from './components/ExitIntentPopup';

// Basic Auth
const Auth = lazy(() => import('./pages/Auth'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

// Code Splitting & Lazy Loading components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SecurityPanel = lazy(() => import('./pages/SecurityPanel'));
const Profile = lazy(() => import('./pages/Profile'));
const Shop = lazy(() => import('./pages/Shop'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));

// Admin Routes
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAddProduct = lazy(() => import('./pages/admin/AdminAddProduct'));

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
  import.meta.env.VITE_STRIPE_KEY;

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const CheckoutRoute = () => {
  if (stripePromise) {
    return (
      <Elements stripe={stripePromise}>
        <Checkout stripeReady />
      </Elements>
    );
  }

  return <Checkout stripeReady={false} />;
};

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
      <CartProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <div className="app-container">
              <Navbar />
              <main className="main-content" style={{ marginTop: '100px' }}>
                <Suspense fallback={<div className="loader">Loading application...</div>}>
                  <Routes>
                    <Route path="/login" element={<Auth />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/shop/:gender" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
                    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutRoute /></ProtectedRoute>} />
                    <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                    <Route path="/security" element={<ProtectedRoute><SecurityPanel /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    
                    {/* Admin Platform */}
                    <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="products/new" element={<AdminAddProduct />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>
                  </Routes>
                </Suspense>
              </main>
              <ChatWidget />
              <FloatingCart />
              <LivePurchasePopup />
              <ExitIntentPopup />
            </div>
          </BrowserRouter>
        </ErrorBoundary>
      </CartProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
