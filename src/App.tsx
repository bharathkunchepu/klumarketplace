import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import CreateItem from './pages/CreateItem';
import MyItems from './pages/MyItems';
import Profile from './pages/Profile';
import ItemDetail from './pages/ItemDetail';
import EditItem from './pages/EditItem';
import { authUtils } from './utils/auth';
import './App.css';

function App() {
  // Auto-redirect to products if token exists on app load
  useEffect(() => {
    if (authUtils.isLoggedIn()) {
      const currentPath = window.location.pathname;
      // Only redirect if on login or signup pages
      if (currentPath === '/login' || currentPath === '/signup') {
        window.location.href = '/products';
      }
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Signup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Products />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products/create" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <CreateItem />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-items" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <MyItems />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/items/:id" 
              element={<ItemDetail />} 
            />
            <Route 
              path="/items/:id/edit" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <EditItem />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
