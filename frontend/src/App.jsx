import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PersonalizationProvider } from './context/PersonalizationContext';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Jewelry } from './pages/jewelry/Jewelry';
import { JewelryBuilder } from './pages/jewelry/JewelryBuilder';
import { Cart } from './pages/Cart';
import { CheckoutAddress } from './pages/CheckoutAddress';
import CheckoutPayment from './pages/CheckoutPayment';
import OrderConfirmation from './pages/OrderConfirmation';
import { Profile } from './pages/Profile';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/Admin/AdminPanel';
import SuperadminPanel from './pages/SuperadminPanel';
import { AccessDenied } from './pages/AccessDenied';

export default function App() {
  return (
    <ErrorBoundary>
      <PersonalizationProvider>
        <div className="min-h-screen flex flex-col bg-white">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/jewelry" element={<Jewelry />} />
              <Route path="/jewelry/builder" element={<JewelryBuilder />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout/address" element={<CheckoutAddress />} />
              <Route path="/checkout/payment" element={<CheckoutPayment />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/superadmin" 
                element={
                  <ProtectedRoute requiredRole="SUPERADMIN">
                    <SuperadminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/access-denied" element={<AccessDenied />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </PersonalizationProvider>
    </ErrorBoundary>
  );
}
