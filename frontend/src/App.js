import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import React, { useState, useEffect } from "react";
import TokenTrackerProvider from "./TokenTrackerProvider";
import ExpiryDialog from "./ExpiryDialog";
import Home from "./Home";
import ProductDetail from "./components/ProductDetail";
import CategoryPage from "./components/CategoryPage";
import About from "./pages/About";
import AdminPanel from "./admin/AdminPanel";
import Signup from "./Signup";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import WishlistPage from "./components/WishlistPage";
import { CartProvider } from "./hooks/useCart";
import Contact from "./pages/Contact";
import Loader from "./Loader"; // ⬅ Import Loader
import NewArrivalsPage from "./components/NewArrivalsPage";
import OurCollection from "./pages/OurCollection";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

export const UserContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ⬅ Loading state

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Simulate loader progress
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      const progressBar = document.getElementById("progressBar");
      const percentage = document.getElementById("percentage");
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (percentage) percentage.innerText = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        setLoading(false); // Hide loader
      }
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = ({ user, accessToken }) => {
    const userObj = {
      ...user,
      accessToken,
      createdAt: user.createdAt,
      userId: user.userId,
    };
    setUser(userObj);
    localStorage.setItem("user", JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <UserContext.Provider value={{ user, setUser, handleAuth, handleLogout }}>
      <TokenTrackerProvider user={user} setUser={setUser}>
        <ExpiryDialog />
        {loading ? (
          <Loader /> // ⬅ Show loader while loading
        ) : (
          <div className="App">
            <CartProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route
                    path="/category/:categoryName"
                    element={<CategoryPage />}
                  />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                  />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                  <Route path="/our-collection" element={<OurCollection />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                </Routes>
              </Router>
            </CartProvider>
          </div>
        )}
      </TokenTrackerProvider>
    </UserContext.Provider>
  );
}

export default App;
