import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Button, Spinner, Form } from "react-bootstrap";
import axios from "axios";
import { useUser } from "../../../context/UserContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const { userId } = useUser();
  const [cartId, setCartId] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  // Mahsulotni olish
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE}/product/${id}`);
        const productData = response.data.Response;
        setProduct(productData);

        if (productData.product_size?.length > 0) {
          setSelectedSizeId(productData.product_size[0].id);
        }
      } catch (error) {
        console.error("Mahsulotni olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, API_BASE]);

  // Savatda borligini tekshirish
  useEffect(() => {
    const checkCart = async () => {
      if (!userId || !product) return;
      try {
        const res = await axios.get(`${API_BASE}/carts/?tg_user=${userId}`);
        const cartItems = res.data.Response;
        const found = cartItems.find((item) => item.flower.id === product.id);
        if (found) {
          setCartId(found.id);
          setQuantity(found.quantity);

          // Handle extras - convert to IDs if they are objects
          const extrasIds = found.extras.map((extra) =>
            typeof extra === "object" ? extra.id : extra
          );
          setSelectedExtras(extrasIds);
        } else {
          setCartId(null);
          setQuantity(0);
          setSelectedExtras([]);
        }

        // Total quantity hisoblash
        const totalQty = cartItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setTotalQuantity(totalQty);
      } catch (err) {
        console.error("Savatni tekshirishda xatolik:", err);
      }
    };
    checkCart();
  }, [userId, product, API_BASE]);

  const fetchCartQuantity = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_BASE}/carts/?tg_user=${userId}`);
      const cartItems = res.data.Response || [];
      const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      setTotalQuantity(totalQty);
    } catch (err) {
      setTotalQuantity(0);
    }
  };

  const handleExtraToggle = (id) => {
    setSelectedExtras((prev) => {
      const newExtras = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      // If extras changed and item is already in cart, reset quantity to force new item
      if (cartId && quantity > 0) {
        setQuantity(0);
        setCartId(null);
      }

      return newExtras;
    });
  };

  const getTotalPrice = () => {
    const basePrice = product?.price || 0;
    const extras = product?.extra_items || [];

    const extrasTotal = extras
      .filter((item) => selectedExtras.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);

    return (basePrice + extrasTotal).toLocaleString("ru-RU");
  };

  const handleAddToCart = async () => {
    try {
      const res = await axios.post(`${API_BASE}/carts/`, {
        quantity: 1,
        flower: product.id,
        user: userId,
        extras: selectedExtras,
      });
      setCartId(res.data.Response.id);
      setQuantity(1);
      await fetchCartQuantity(); // Qo'shgandan keyin yangilash
    } catch (err) {
      console.error("Savatga qo‘shishda xatolik:", err);
    }
  };

  const updateQuantity = async (type) => {
    const newQty = type === "increment" ? quantity + 1 : quantity - 1;

    // If quantity is 0 (after extras change), add new item
    if (quantity === 0 && type === "increment") {
      await handleAddToCart();
      return;
    }

    if (newQty < 1) {
      try {
        await axios.delete(`${API_BASE}/cart-item/${cartId}/`);
        setQuantity(0);
        setCartId(null);
        await fetchCartQuantity(); // O'chirgandan keyin yangilash
      } catch (err) {
        console.error("Savatdan o'chirishda xatolik:", err);
      }
      return;
    }

    try {
      await axios.put(`${API_BASE}/cart-item/${cartId}/`, {
        quantity: newQty,
        flower: product.id,
        user: userId,
        extras: selectedExtras,
      });
      setQuantity(newQty);
      await fetchCartQuantity(); // Yangilagandan keyin yangilash
    } catch (err) {
      console.error("Miqdor yangilanishida xatolik:", err);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="dark" />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="text-center mt-5">
        <p>Mahsulot topilmadi</p>
      </Container>
    );
  }

  return (
    <>
      <Container className="pb-5 mt-4">
        <Card className="shadow-sm border-0">
          {product.images?.length > 0 && (
            <div style={{ position: "relative" }}>
              <Card.Img
                variant="top"
                src={product.images[0].image}
                style={{
                  objectFit: "cover",
                  maxHeight: "450px",
                  width: "100%",
                  borderTopLeftRadius: "0.375rem",
                  borderTopRightRadius: "0.375rem",
                }}
              />

              {/* Tag badges on image */}
              {product.tags?.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap",
                    zIndex: 2,
                  }}
                >
                  {product.tags.map((tag) => {
                    let icon;
                    let bgColor;

                    switch (tag.name.toLowerCase()) {
                      case "новинка":
                        icon = <i className="bi bi-stars"></i>;
                        bgColor = "#4361ee"; // ko‘k
                        break;
                      case "хит продаж":
                        icon = <i className="bi bi-rocket-takeoff"></i>;
                        bgColor = "#f72585"; // pushti
                        break;
                      case "популярный товар":
                        icon = <i className="bi bi-fire"></i>;
                        bgColor = "#ff9f1c"; // soft orange
                        break;
                      case "в наличии":
                        icon = <i className="bi bi-check2-circle"></i>;
                        bgColor = "#2ec4b6"; // pastel green-blue
                        break;
                      default:
                        icon = <i className="bi bi-tag"></i>;
                        bgColor = "#adb5bd"; // neutral soft gray
                    }

                    return (
                      <span
                        key={tag.id}
                        style={{
                          backgroundColor: bgColor,
                          color: "white",
                          padding: "4px 8px",
                          fontSize: "12px",
                          borderRadius: "10px",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {icon} {tag.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <Card.Body>
            <h5 className="fw-bold">{product.name}</h5>

            <hr style={{ height: "1px" }} />

            {/* Product Size (radio buttons) */}
            {product.product_size?.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 fw-bold">
                  Размер букета:{" "}
                  <span className="text-primary">
                    {
                      product.product_size.find((s) => s.id === selectedSizeId)
                        ?.size
                    }
                  </span>
                </div>

                <div className="d-flex gap-2 flex-wrap">
                  {product.product_size.map((size) => (
                    <Button
                      key={size.id}
                      variant={
                        selectedSizeId === size.id
                          ? "outline-danger"
                          : "outline-secondary"
                      }
                      onClick={() => setSelectedSizeId(size.id)}
                    >
                      {size.size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Items (checkboxes) */}
            {product.extra_items?.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 fw-bold">Для удобства:</div>
                {product.extra_items.map((item) => (
                  <Form.Check
                    key={item.id}
                    type="checkbox"
                    id={`extra-${item.id}`}
                    label={`${item.name}  + ${item.price.toLocaleString(
                      "ru-RU"
                    )}₽`}
                    checked={selectedExtras.includes(item.id)}
                    onChange={() => handleExtraToggle(item.id)}
                    className="mb-2"
                  />
                ))}
              </div>
            )}

            <Button variant="dark" size="sm" className="mb-3" disabled>
              Описание
            </Button>

            <Card.Text style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>
              {product.description}
            </Card.Text>
          </Card.Body>
        </Card>
      </Container>

      {/* Fixed bottom action bar */}
      <Container
        className="position-fixed bottom-0 start-0 end-0 bg-white border-top p-3 d-flex justify-content-between align-items-center"
        style={{ zIndex: 1050 }}
      >
        {quantity === 0 ? (
          <Button
            className="w-100 fw-bold"
            style={{
              fontSize: "1.1rem",
              backgroundColor: "#ff4da6",
              border: "none",
              borderRadius: "8px",
            }}
            onClick={handleAddToCart}
          >
            {cartId ? "Обновить корзину" : "В корзину"} — {getTotalPrice()} ₽
          </Button>
        ) : (
          <>
            {/* Quantity panel */}
            <div
              style={{
                backgroundColor: "#ff4da6",
                borderRadius: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 16px",
                color: "white",
                fontWeight: "bold",
                flex: 1, // to‘liq cho‘ziladi
                marginRight: "12px", // cart tugmasidan oldin bo‘sh joy
              }}
            >
              <Button
                variant="link"
                style={{
                  color: "white",
                  fontSize: "20px",
                  padding: "0",
                  lineHeight: 1,
                  textDecoration: "none",
                }}
                onClick={() => updateQuantity("decrement")}
              >
                −
              </Button>
              <span style={{ flex: 1, textAlign: "center" }}>
                {quantity} × {getTotalPrice()} ₽
              </span>
              <Button
                variant="link"
                style={{
                  color: "white",
                  fontSize: "20px",
                  padding: "0",
                  lineHeight: 1,
                  textDecoration: "none",
                }}
                onClick={() => updateQuantity("increment")}
              >
                +
              </Button>
            </div>

            {/* Cart icon */}
            <div
              className="d-flex gap-2 fs-4 text-muted position-relative"
              style={{
                cursor: "pointer",
                backgroundColor: "#f8f9fa",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
              onClick={() => (window.location.href = "/cart")}
            >
              <i className="bi bi-cart"></i>
              {totalQuantity > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
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
                  {totalQuantity}
                </span>
              )}
            </div>
          </>
        )}
      </Container>
    </>
  );
};

export default ProductDetailPage;
