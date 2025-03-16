import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLayout from './components/Layout/UserLayout';
import Home from "./pages/Home";
import { Toaster } from "sonner";
import AdminLayout from './components/Admin/AdminLayout';
import AdminHomePage from './pages/AdminHomePage';

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
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App;
