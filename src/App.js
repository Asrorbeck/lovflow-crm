import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import HomePage from "./components/Pages/Main/page";
import BottomNavBar from "./components/Parts/Footer/footer";
import CatalogPage from "./components/Pages/Catalog/page";
import SearchPage from "./components/Pages/SearchBar/page";
import CartPage from "./components/Pages/Cart/page";
import ProfilePage from "./components/Pages/Profile/page";
import Agreement from "./components/Pages/Agreement/page";
import Privacy from "./components/Pages/Privacy/page";
import ProductDetailPage from "./components/Pages/Product/page";
import Order from "./components/Pages/Orders/page";
import Bonus from "./components/Pages/Bonus/page";
import { ToastContainer } from "react-toastify";
import OrderForm from "./components/Pages/Orders/MakeOrder";

function App() {
  return (
    <Router>
      <div className="pb-5 mb-5">
        <ToastContainer />{" "}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/agreement" element={<Agreement />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/bonus" element={<Bonus />} />
          <Route path="/make-order" element={<OrderForm />} />
        </Routes>
      </div>
      <BottomNavBar />
    </Router>
  );
}

export default App;
