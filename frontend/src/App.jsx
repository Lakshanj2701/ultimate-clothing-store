// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLayout from './components/Layout/UserLayout';
import Home from './pages/Home';
import { Toaster } from 'sonner';
import AdminLayout from './components/Admin/AdminLayout';
import AdminHomePage from './pages/AdminHomePage';
import UserManagement from './components/Admin/UserManagement';
import ProductManagement from './components/Admin/ProductManagement';
import EditProductPage from './components/Admin/EditProductPage';
import OrderManagement from './components/Admin/OrderManagement';
import AdminReturnRefundPage from './components/Admin/AdminReturnRefundPage';
import FinancialManagement from './components/Admin/FinancialManagement';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CollectionPage from './pages/CollectionPage';
import ProductDetails from './components/Products/ProductDetails';
import Checkout from './components/Cart/Checkout';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AddProductPage from './components/Admin/AddProductPage';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import DiscountForm from './components/Admin/DiscountForm';
import DiscountCard from './components/Admin/DiscountCard';
import ForgotPassword from './components/Password/ForgotPassword';
import ResetPassword from './components/Password/ResetPassword';
import { CartProvider } from './components/Cart/CartContext';
import CustomProductsPage from './components/Products/CustomProductsPage';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <ToastContainer />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
              <Route path="collections/:collection" element={<CollectionPage />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="/collections/custom" element={<CustomProductsPage />} />

              {/* Protected User Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<Profile />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="order/:id" element={<OrderDetailsPage />} />
                <Route path="my-orders" element={<MyOrdersPage />} />
              </Route>
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedAdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminHomePage />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="products/:id/edit" element={<EditProductPage />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="finance" element={<FinancialManagement />} />
                <Route path="products/new" element={<AddProductPage />} />
                <Route path="discounts" element={<DiscountForm />} />
                <Route path="discounts/list" element={<DiscountCard />} />
                <Route path="return-refund" element={<AdminReturnRefundPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;