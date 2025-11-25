import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  // Note: ProtectedRoute handles redirects using Navigate (no page reload)
  // This useEffect is kept minimal to avoid interference with form submissions

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
            <Route path="*" element={<NotFound />} />
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
