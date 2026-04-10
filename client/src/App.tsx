
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ui/ToastContainer';
import { useToast } from './hooks/useToast';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

function AppContent() {
  const { toasts, dismiss } = useToast();
  return (
    <>
      <Header />
      <Routes>
        <Route path="/"                   element={<HomePage />} />
        <Route path="/products"           element={<ProductsPage />} />
        <Route path="/product/:slug"      element={<ProductDetailPage />} />
        <Route path="/cart"               element={<CartPage />} />
        <Route path="/checkout"           element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/signup"             element={<SignupPage />} />
        <Route path="*" element={
          <main className="pt-32 pb-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
            <div className="text-7xl mb-4">🌸</div>
            <h2 className="text-3xl font-extrabold text-saffron-text mb-3">Page Not Found</h2>
            <p className="text-saffron-muted mb-8">The page you are looking for does not exist.</p>
            <a href="/" className="btn-gold px-8 py-4">Go Home</a>
          </main>
        } />
      </Routes>
      <Footer />
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
