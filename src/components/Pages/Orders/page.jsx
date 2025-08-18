import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { Container, Card, Badge, Button } from "react-bootstrap";
import axios from "axios";
import { useUser } from "../../../context/UserContext";
import empty from "../../../images/13_FOLDER_empty.json";
import image1 from "../../../images/1.jpg";

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flowerDetails, setFlowerDetails] = useState({});
  const { userId } = useUser();
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/order/${userId}/`);
        const ordersData = response.data.Response || [];
        setOrders(ordersData);

        // Fetch flower details for all order items
        const flowerIds = new Set();
        ordersData.forEach((order) => {
          order.order_items?.forEach((item) => {
            flowerIds.add(item.flower);
          });
        });

        // Fetch flower details for each unique flower ID
        const flowerDetailsMap = {};
        for (const flowerId of flowerIds) {
          try {
            const flowerResponse = await axios.get(
              `${API_BASE}/product/${flowerId}`
            );
            const flowerData = flowerResponse.data.Response;
            flowerDetailsMap[flowerId] = flowerData;
          } catch (error) {
            console.error(`Error fetching flower ${flowerId}:`, error);
          }
        }
        setFlowerDetails(flowerDetailsMap);
      } catch (error) {
        console.error("Buyurtmalarni olishda xatolik:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, API_BASE]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: {
        text: "Успешно",
        icon: "bi-check-circle-fill",
        bgColor: "#d4edda",
        textColor: "#155724",
      },
      pending: {
        text: "В обработке",
        icon: "bi-clock-fill",
        bgColor: "#fff3cd",
        textColor: "#856404",
      },
      cancelled: {
        text: "Отменен",
        icon: "bi-x-circle-fill",
        bgColor: "#f8d7da",
        textColor: "#721c24",
      },
      delivered: {
        text: "Доставлен",
        icon: "bi-truck-fill",
        bgColor: "#d1ecf1",
        textColor: "#0c5460",
      },
    };

    const config = statusConfig[status] || {
      text: status,
      icon: "bi-question-circle-fill",
      bgColor: "#e2e3e5",
      textColor: "#383d41",
    };

    return (
      <span
        style={{
          backgroundColor: config.bgColor,
          color: config.textColor,
          border: "none",
          padding: "6px 10px",
          borderRadius: "15px",
          fontSize: "0.75rem",
          fontWeight: "500",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <i className={`bi ${config.icon}`}></i>
        {config.text}
      </span>
    );
  };

  const getDeliveryType = (isDelivery) => {
    return isDelivery ? (
      <span className="d-flex align-items-center gap-1">
        <i className="bi bi-truck text-primary"></i>
        Доставка курьером
      </span>
    ) : (
      <span className="d-flex align-items-center gap-1">
        <i className="bi bi-shop text-success"></i>
        Самовывоз
      </span>
    );
  };

  if (loading) {
    return (
      <Container
        className="py-4"
        style={{ minHeight: "85vh", paddingBottom: "140px" }}
      >
        <div className="mb-4">
          <h4 className="fw-semi-bold fs-3 m-0">Мои заказы</h4>
        </div>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="text-center">
            <div
              className="spinner-border"
              role="status"
              style={{
                width: "3rem",
                height: "3rem",
                borderWidth: "3px",
                borderColor: "#ff4da6",
                borderRightColor: "transparent",
              }}
            ></div>
            <p className="mt-3 text-muted">Загрузка заказов...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container
      className="py-4"
      style={{ minHeight: "85vh", paddingBottom: "140px" }}
    >
      <div className="mb-4">
        <h4 className="fw-semi-bold fs-3 m-0">Мои заказы</h4>
        {orders.length > 0 && (
          <p className="text-muted mt-2">Всего заказов: {orders.length}</p>
        )}
      </div>

      {orders.length === 0 ? (
        <div
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ minHeight: "60vh" }}
        >
          <div style={{ maxWidth: 150, margin: "0 auto" }}>
            <Lottie animationData={empty} loop={true} />
          </div>
          <h5 className="mt-4">Заказов нет</h5>
          <p className="text-muted">Вы еще не сделали заказ</p>
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
        <div className="mt-4">
          {orders.map((order) => (
            <Card key={order.id} className="mb-4 shadow-sm border-0">
              <Card.Body className="p-0">
                {/* Order Header */}
                <div
                  className="p-3"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff4da6 0%, #ff6b9d 100%)",
                    color: "white",
                    borderTopLeftRadius: "0.375rem",
                    borderTopRightRadius: "0.375rem",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1 fw-bold">
                        <i className="bi bi-hash me-1"></i>
                        Заказ #{order.id}
                      </h6>
                      <small className="opacity-75">
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatDate(order.created_at)}
                      </small>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold fs-5">
                        {order.total_price?.toLocaleString()} ₽
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="p-3">
                    <h6 className="fw-bold mb-3 text-primary">
                      <i className="bi bi-box-seam me-2"></i>
                      Товары в заказе
                    </h6>
                    {order.order_items.map((item, index) => {
                      const flower = flowerDetails[item.flower];
                      return (
                        <div
                          key={index}
                          className="d-flex p-2 rounded mb-3 bg-light"
                          style={{ alignItems: "flex-start" }}
                        >
                          {/* Flower Image */}
                          <img
                            src={flower?.images?.[0]?.image || image1}
                            alt={flower?.name || `Товар ${item.flower}`}
                            style={{
                              width: 70,
                              height: 70,
                              borderRadius: "8px",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                            className="me-3"
                          />

                          {/* Flower Info */}
                          <div className="flex-grow-1 d-flex flex-column">
                            <div style={{ marginBottom: "0.4rem" }}>
                              <div
                                style={{
                                  color: "#ff4da6",
                                  fontWeight: 500,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {flower?.name || `Товар #${item.flower}`}
                              </div>
                              <div
                                style={{ fontSize: "0.8rem", color: "#999" }}
                              >
                                {flower?.subtitle || "Описание недоступно"}
                              </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <span className="text-muted me-2">
                                  Количество:
                                </span>
                                <Badge bg="primary" className="rounded-pill">
                                  {item.quantity}
                                </Badge>
                              </div>
                              <div
                                className="fw-bold"
                                style={{ fontSize: "0.95rem" }}
                              >
                                {(
                                  flower?.price * item.quantity
                                )?.toLocaleString()}{" "}
                                ₽
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Order Details */}
                <div className="px-3 pb-3">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <h6 className="fw-bold mb-2 text-primary">
                          <i className="bi bi-person-circle me-2"></i>
                          Получатель
                        </h6>
                        <div className="mb-1">
                          <strong>Имя:</strong> {order.name}
                        </div>
                        <div className="mb-1">
                          <strong>Телефон:</strong> {order.phone_number}
                        </div>
                        {order.receiver_phone_number && (
                          <div className="mb-1">
                            <strong>Телефон получателя:</strong>{" "}
                            {order.receiver_phone_number}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <h6 className="fw-bold mb-2 text-primary">
                          <i className="bi bi-truck me-2"></i>
                          Доставка
                        </h6>
                        <div className="mb-1">
                          <strong>Тип:</strong>{" "}
                          {getDeliveryType(order.is_delivery)}
                        </div>
                        {order.delivery_time && (
                          <div className="mb-1">
                            <strong>Время:</strong> {order.delivery_time}
                          </div>
                        )}
                        {order.reason && (
                          <div className="mb-1">
                            <strong>Повод:</strong> {order.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(order.comment || order.postcard) && (
                    <div className="mt-3 p-3 bg-light rounded-3">
                      <h6 className="fw-bold mb-2 text-primary">
                        <i className="bi bi-chat-dots me-2"></i>
                        Дополнительно
                      </h6>
                      {order.comment && (
                        <div className="mb-1">
                          <strong>Комментарий:</strong> {order.comment}
                        </div>
                      )}
                      {order.postcard && (
                        <div className="mb-1">
                          <strong>Открытка:</strong> {order.postcard}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Promo Code */}
                  {order.promo_code && (
                    <div className="mt-3 text-center">
                      <Badge
                        bg="info"
                        className="px-3 py-2 rounded-pill"
                        style={{ fontSize: "0.9rem" }}
                      >
                        <i className="bi bi-tag-fill me-1"></i>
                        Промокод:{" "}
                        {typeof order.promo_code === "object"
                          ? order.promo_code.name || order.promo_code.id
                          : order.promo_code}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}

export default Order;
