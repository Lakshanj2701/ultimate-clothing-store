import React from 'react'
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

const App = () => {
  return (
    <BrowserRouter>

      <Toaster position="top-right"/>
      <Routes>
        <Route path="/" element={<UserLayout/>}> 
         <Route index element={<Home />} />
        </Route>
        <Route path="/admin" element={< AdminLayout/>}>
          <Route index element={<AdminHomePage/>}/>
          <Route path="users" element={<UserManagement/>}/>
          <Route path="products" element={<ProductManagement/>}/>
          <Route path="products/:id/edit" element={<EditProductPage/>}/>
          <Route path="orders" element={<OrderManagement/>}/>
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App;
