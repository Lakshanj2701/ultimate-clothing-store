import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLayout from './components/Layout/UserLayout';
import Home from "./pages/Home";
import { Toaster } from "sonner";
import AdminLayout from './components/Admin/AdminLayout';
import AdminHomePage from './pages/AdminHomePage';
import UserManagement from './components/Admin/UserManagement';
import ProductManagement from './components/Admin/ProductManagement';
import EditProductPage from './components/Admin/EditProductPage';
import OrderManagement from './components/Admin/OrderManagement';
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


const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right"/>
      <ToastContainer />

      <Routes>
        {/* User Routes */}
        <Route path="/" element={<UserLayout/>}> 
          <Route index element={<Home />} />
          <Route path="login" element={<Login/>}/>
          <Route path="register" element={<Register/>}/>
          <Route path="profile" element={<Profile/>}/>
          <Route path="collections/:collection" element={<CollectionPage/>}/>
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="order/:id" element={<OrderDetailsPage />} />
          <Route path="my-orders" element={<MyOrdersPage/>} />
        </Route>

        {/* Admin Routes - Protected */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout/>}>
            <Route index element={<AdminHomePage/>}/>
            <Route path="users" element={<UserManagement/>}/>
            <Route path="products" element={<ProductManagement/>}/>
            <Route path="products/:id/edit" element={<EditProductPage/>}/>
            <Route path="orders" element={<OrderManagement/>}/>
            <Route path="finance" element={<FinancialManagement/>}/>
            <Route path="/admin/products/new" element={<AddProductPage />} />
            <Route path="discounts" element={<DiscountForm />} />
          <Route path="discounts/list" element={<DiscountCard />} />

          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;