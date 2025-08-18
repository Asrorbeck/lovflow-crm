import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import axios from "axios";

const BottomNavBar = () => {
  const location = useLocation();
  const { userId } = useUser();
  const [cartQuantity, setCartQuantity] = useState(0);
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`${API_BASE}/carts/?tg_user=${userId}`);
        const items = res.data.Response || [];
        const total = items.reduce((acc, item) => acc + item.quantity, 0);
        setCartQuantity(total);
        localStorage.setItem("cartQuantity", total);
      } catch (err) {
        setCartQuantity(0);
        localStorage.setItem("cartQuantity", 0);
      }
    };
    fetchCart();

    // Real time update: poll localStorage every 500ms
    const interval = setInterval(() => {
      const qty = Number(localStorage.getItem("cartQuantity") || 0);
      setCartQuantity(qty);
    }, 500);

    return () => clearInterval(interval);
  }, [userId, API_BASE]);

  const navItems = [
    { to: "/", icon: "bi-house-door-fill", label: "Главная" },
    { to: "/catalog", icon: "bi-grid", label: "Каталог" },
    { to: "/search", icon: "bi-search", label: "Найти" },
    { to: "/cart", icon: "bi-cart", label: "Корзина" },
    { to: "/profile", icon: "bi-person", label: "Профиль" },
  ];

  return (
    <div className="bg-white border-top fixed-bottom d-flex justify-content-around py-2">
      {navItems.map((item, index) => (
        <Link
          key={index}
          to={item.to}
          className={`text-center text-decoration-none flex-fill ${
            location.pathname === item.to ? "text-danger" : "text-secondary"
          }`}
          style={{ position: "relative" }}
        >
          <i className={`bi ${item.icon} fs-5 d-block`}></i>
          {item.to === "/cart" && cartQuantity > 0 && (
            <span
              style={{
                position: "absolute",
                top: "2px",
                right: "18px",
                background: "#ff4da6",
                color: "#fff",
                borderRadius: "50%",
                padding: "2px 7px",
                fontSize: "0.8rem",
                fontWeight: "bold",
                minWidth: "22px",
                textAlign: "center",
                zIndex: 2,
              }}
            >
              {cartQuantity}
            </span>
          )}
          <small>{item.label}</small>
        </Link>
      ))}
    </div>
  );
};

export default BottomNavBar;
