import React, { useState, useEffect } from "react";
import { Container, Button, Form } from "react-bootstrap";
import Lottie from "lottie-react";
import empty from "../../../images/empty.json";
import axios from "axios";
import { useUser } from "../../../context/UserContext";
import { useCart } from "../../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const CartPage = () => {
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoData, setPromoData] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const { cartItems, setCartItems } = useCart();
  const { userId } = useUser();
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    const fetchCart = async () => {
      try {
        const res = await axios.get(`${API_BASE}/carts/?tg_user=${userId}`);
        const cartItemsData = res.data.Response;

        // Fetch complete product data for each cart item to get extra_items
        const itemsWithExtras = await Promise.all(
          cartItemsData.map(async (item) => {
            try {
              // Get complete product data including extra_items
              const productRes = await axios.get(
                `${API_BASE}/product/${item.flower.id}`
              );
              const productData = productRes.data.Response;

              return {
                id: item.id,
                name: item.flower.name,
                subtitle: item.flower?.subtitle || "",
                price: item.flower.price,
                quantity: item.quantity,
                image: item.flower.images?.[0]?.image || "",
                extras: item.extras || [],
                extra_items: productData.extra_items || [], // Complete extra items data
              };
            } catch (error) {
              console.error(`Error fetching product ${item.flower.id}:`, error);
              // Fallback if product fetch fails
              return {
                id: item.id,
                name: item.flower.name,
                subtitle: item.flower?.subtitle || "",
                price: item.flower.price,
                quantity: item.quantity,
                image: item.flower.images?.[0]?.image || "",
                extras: item.extras || [],
                extra_items: [],
              };
            }
          })
        );

        setCartItems(itemsWithExtras);
        updateFooterCartBadge(itemsWithExtras);
      } catch (err) {
        console.error("Cart fetch error:", err);
      }
    };
    fetchCart();
  }, [API_BASE, userId]);

  // Calculate total price for a single item including extras
  const calculateItemTotalPrice = (item) => {
    const basePrice = item.price || 0;
    const extras = item.extra_items || [];
    const selectedExtras = item.extras || [];

    // Handle case where selectedExtras contains full objects instead of just IDs
    let extrasTotal = 0;

    if (selectedExtras.length > 0 && typeof selectedExtras[0] === "object") {
      // If selectedExtras contains full objects, sum their prices directly
      extrasTotal = selectedExtras.reduce(
        (sum, extra) => sum + (extra.price || 0),
        0
      );
    } else {
      // If selectedExtras contains IDs, filter and sum from available extras
      extrasTotal = extras
        .filter((extra) => selectedExtras.includes(extra.id))
        .reduce((sum, extra) => sum + extra.price, 0);
    }

    return (basePrice + extrasTotal) * item.quantity;
  };

  // Calculate subtotal including extras
  const subtotal = cartItems.reduce(
    (acc, item) => acc + calculateItemTotalPrice(item),
    0
  );

  const updateFooterCartBadge = (items) => {
    const total = items.reduce((acc, item) => acc + item.quantity, 0);
    localStorage.setItem("cartQuantity", total);
  };

  const handleActivatePromo = () => setShowPromoModal(true);
  const handleCloseModal = () => {
    setShowPromoModal(false);
    setPromoCode("");
    setPromoError("");
  };

  const handlePromoSubmit = async () => {
    if (!promoCode.trim()) {
      setPromoError("Промокод введите");
      return;
    }

    setPromoLoading(true);
    setPromoError("");

    try {
      const response = await axios.get(
        `${API_BASE}/promo-code/${promoCode.trim()}/`
      );
      const promoResponse = response.data.Response;

      // Check if promo code is expired
      const validityDate = new Date(promoResponse.validity_date);
      const currentDate = new Date();

      if (validityDate < currentDate) {
        setPromoError("Промокод истек");
        return;
      }

      setPromoData(promoResponse);
      setPromoError("");
      console.log("Промокод активирован:", promoResponse);
    } catch (error) {
      console.error("Промокод ошибка:", error);
      if (error.response?.status === 404) {
        setPromoError("Промокод не найден");
      } else if (error.response?.status === 400) {
        setPromoError("Промокод недействителен");
      } else {
        setPromoError("Ошибка при активации промокода");
      }
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = () => {
    setPromoData(null);
    setPromoCode("");
  };

  const handleQuantityChange = async (item, type) => {
    const newQty = type === "increment" ? item.quantity + 1 : item.quantity - 1;
    if (newQty < 1) {
      await handleDelete(item.id);
      return;
    }
    try {
      // Extract only the IDs from extras array
      const extraIds = item.extras.map((extra) =>
        typeof extra === "object" ? extra.id : extra
      );

      await axios.put(`${API_BASE}/cart-item/${item.id}/`, {
        quantity: newQty,
        extras: extraIds, // Send only IDs, not full objects
      });
      const updatedItems = cartItems.map((p) =>
        p.id === item.id ? { ...p, quantity: newQty } : p
      );
      setCartItems(updatedItems);
      updateFooterCartBadge(updatedItems);
    } catch (err) {
      console.error("Quantity update error:", err);
    }
  };

  const handleDelete = async (id) => {
    confirmAlert({
      title: "Подтверждение удаления",
      message: "Вы действительно хотите удалить этот товар из корзины?",
      buttons: [
        {
          label: "Отмена",
          onClick: () => {}, // Do nothing, just close the dialog
        },
        {
          label: "Удалить",
          onClick: async () => {
            try {
              await axios.delete(`${API_BASE}/cart-item/${id}/`);
              const updatedItems = cartItems.filter((p) => p.id !== id);
              setCartItems(updatedItems);
              updateFooterCartBadge(updatedItems);

              // Show success toast after deletion
              toast.success("Товар успешно удален из корзины", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            } catch (err) {
              console.error("Delete error:", err);
              toast.error("Ошибка при удалении товара", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }
          },
          style: { backgroundColor: "#dc3545", color: "white" }, // Red button for delete
        },
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
      overlayClassName: "overlay-custom-class-name",
    });
  };

  const discount = promoData ? promoData.value : 0;
  const totalPrice = Math.max(0, subtotal - discount);

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Container
        className="py-4"
        style={{ minHeight: "80vh", paddingBottom: "140px" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-semi-bold fs-3 m-0">Корзина</h4>
          <Button
            variant="light"
            style={{
              border: "1px solid #ccc",
              borderRadius: "2rem",
              fontSize: "0.9rem",
            }}
            onClick={handleActivatePromo}
          >
            {promoData ? "Промокод активирован" : "Активировать промокод"}
          </Button>
        </div>

        {cartItems.length === 0 ? (
          <div
            className="d-flex flex-column justify-content-center align-items-center text-center"
            style={{ minHeight: "60vh" }}
          >
            <div style={{ maxWidth: 150, margin: "0 auto" }}>
              <Lottie animationData={empty} loop={true} />
            </div>
            <h5 className="mt-4">Корзина пуста</h5>
            <Button
              className="mt-3"
              style={{
                backgroundColor: "#ff4da6",
                border: "none",
                borderRadius: "8px",
              }}
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Перейти на главную
            </Button>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="d-flex p-2 rounded mb-3 bg-white shadow-sm"
                style={{ alignItems: "flex-start" }}
              >
                {/* Rasmi chapda */}
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "8px",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                  className="me-3"
                />

                {/* Info + actions o'ngda (2 qator) */}
                <div className="flex-grow-1 d-flex flex-column">
                  {/* 1-qator: nomi va subtitle */}
                  <div style={{ marginBottom: "0.4rem" }}>
                    <div
                      style={{
                        color: "#ff4da6",
                        fontWeight: 500,
                        fontSize: "0.95rem",
                      }}
                    >
                      {item.name}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#999" }}>
                      {item.subtitle}
                      {item.extras && item.extras.length > 0 && (
                        <div className="mt-1">
                          <small className="text-success">
                            <i className="bi bi-plus-circle me-1"></i>
                            {item.extras.length} доп. товар
                          </small>
                          {/* Show selected extras names */}
                          <div className="mt-1">
                            {item.extras.map((extra) => (
                              <small
                                key={extra.id}
                                className="d-block text-muted"
                              >
                                • {extra.name} (+
                                {extra.price.toLocaleString()} ₽)
                              </small>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2-qator: quantity, narx, trash */}
                  <div className="d-flex justify-content-between align-items-center">
                    {/* Counter */}
                    <div className="d-flex align-items-center">
                      <Button
                        variant="light"
                        size="sm"
                        style={{ width: 30, height: 30, padding: 0 }}
                        onClick={() => handleQuantityChange(item, "decrement")}
                      >
                        −
                      </Button>
                      <div className="mx-2">{item.quantity}</div>
                      <Button
                        variant="light"
                        size="sm"
                        style={{ width: 30, height: 30, padding: 0 }}
                        onClick={() => handleQuantityChange(item, "increment")}
                      >
                        +
                      </Button>
                    </div>

                    {/* Narx */}
                    <div
                      className="text-nowrap fw-bold mx-2"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {calculateItemTotalPrice(item).toLocaleString()} ₽
                    </div>

                    {/* Delete tugmasi */}
                    <button
                      className="btn btn-link text-muted p-0"
                      style={{ fontSize: "1.2rem" }}
                      onClick={() => handleDelete(item.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div
              className="p-3"
              style={{
                background: "#fff",
                borderTop: "1px solid #ddd",
                position: "fixed",
                bottom: "70px",
                left: 0,
                width: "100%",
                zIndex: 1030,
              }}
            >
              <Container>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Товары</span>
                  <span>{subtotal.toLocaleString()} ₽</span>
                </div>

                {promoData && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-success">
                      <i className="bi bi-tag-fill me-1"></i>
                      Скидка (Промокод: {promoData.name})
                    </span>
                    <span className="text-success">
                      -{discount.toLocaleString()} ₽
                    </span>
                  </div>
                )}

                <div className="d-flex justify-content-between fw-bold mb-3">
                  <span>Итого</span>
                  <span style={{ color: "#ff4da6" }}>
                    {totalPrice.toLocaleString()} ₽
                  </span>
                </div>
                <Button
                  className="w-100"
                  style={{
                    backgroundColor: "#ff4da6",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  onClick={() =>
                    navigate("/make-order", {
                      state: {
                        cartItems,
                        promoData,
                      },
                    })
                  }
                >
                  Оформить заказ
                </Button>
              </Container>
            </div>
          </>
        )}
      </Container>

      {showPromoModal && (
        <>
          <div
            onClick={handleCloseModal}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 1040,
            }}
          ></div>

          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              backgroundColor: "#fff",
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
              padding: "1rem 1.5rem",
              zIndex: 1050,
              animation: "slideUp 0.3s ease-out",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "5px",
                backgroundColor: "#ccc",
                borderRadius: "10px",
                margin: "0 auto 1rem auto",
              }}
            ></div>

            <h6 className="mb-3 text-center">Активировать промокод</h6>

            <Form.Control
              type="text"
              placeholder="Введите промокод"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="mb-3"
              disabled={promoLoading}
            />

            {promoError && (
              <div
                className="alert alert-danger py-2 mb-3"
                style={{ fontSize: "0.9rem" }}
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                {promoError}
              </div>
            )}

            {promoData && (
              <div
                className="alert alert-success py-2 mb-3"
                style={{ fontSize: "0.9rem" }}
              >
                <i className="bi bi-check-circle me-2"></i>
                Промокод активирован! Скидка: {promoData.value.toLocaleString()}{" "}
                ₽
              </div>
            )}

            <Button
              style={{
                backgroundColor: "#ff4da6",
                border: "none",
                borderRadius: "6px",
                width: "100%",
              }}
              className="mb-2"
              onClick={handlePromoSubmit}
              disabled={promoLoading}
            >
              {promoLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Активация...
                </>
              ) : (
                "Активировать"
              )}
            </Button>

            {promoData && (
              <Button
                variant="outline-danger"
                onClick={removePromoCode}
                style={{ width: "100%" }}
                className="mb-2"
              >
                Удалить промокод
              </Button>
            )}

            <Button
              variant="light"
              onClick={handleCloseModal}
              style={{ width: "100%" }}
            >
              Закрыть
            </Button>
          </div>

          <style>{`
            @keyframes slideUp {
              from {
                transform: translateY(100%);
              }
              to {
                transform: translateY(0);
              }
            }
            
            /* Custom styles for confirm alert */
            .overlay-custom-class-name {
              background-color: rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(2px);
            }
            
            .react-confirm-alert-body {
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
              border: none;
            }
            
            .react-confirm-alert-button-group {
              gap: 10px;
            }
            
            .react-confirm-alert-button-group button {
              border-radius: 8px;
              padding: 10px 20px;
              font-weight: 500;
              border: none;
              transition: all 0.2s ease;
            }
            
            .react-confirm-alert-button-group button:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
          `}</style>
        </>
      )}
    </>
  );
};

export default CartPage;
