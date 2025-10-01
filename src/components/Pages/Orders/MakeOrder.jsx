import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Modal,
  ListGroup,
} from "react-bootstrap";
import axios from "axios";
import { useCart } from "../../../context/CartContext";
import { useUser } from "../../../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function OrderForm() {
  const [tab, setTab] = useState("courier");
  const [cartItems, setCartItems] = useState([]); // API'dan kelgan cart ma'lumotlari
  const [loading, setLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPickupPoint, setSelectedPickupPoint] = useState("");
  const [map, setMap] = useState(null);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [apiPickupPoints, setApiPickupPoints] = useState([]);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const mapRef = useRef(null);
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const API_SHIP_TOKEN = process.env.REACT_APP_API_SHIP_TOKEN;
  const { setCartItems: setContextCartItems } = useCart();
  const { userId } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({});

  // Russian cities for suggestions
  const russianCities = [
    "Москва",
    "Санкт-Петербург",
    "Новосибирск",
    "Екатеринбург",
    "Казань",
    "Нижний Новгород",
    "Челябинск",
    "Омск",
    "Самара",
    "Ростов-на-Дону",
    "Уфа",
    "Красноярск",
    "Воронеж",
    "Пермь",
    "Волгоград",
    "Краснодар",
    "Тюмень",
    "Саратов",
    "Тольятти",
    "Махачкала",
    "Ижевск",
    "Барнаул",
    "Ульяновск",
    "Иркутск",
    "Хабаровск",
    "Ярославль",
    "Владивосток",
    "Томск",
    "Оренбург",
    "Кемерово",
    "Новокузнецк",
    "Рязань",
    "Набережные Челны",
    "Астрахань",
    "Пенза",
    "Липецк",
    "Киров",
    "Калининград",
    "Чебоксары",
    "Балашиха",
    "Тула",
    "Курск",
    "Ставрополь",
    "Улан-Удэ",
    "Тверь",
    "Магнитогорск",
    "Сочи",
    "Иваново",
    "Брянск",
    "Сургут",
    "Нижний Тагил",
    "Владимир",
    "Архангельск",
    "Чита",
    "Белгород",
    "Калуга",
    "Волжский",
    "Смоленск",
    "Саранск",
    "Череповец",
    "Вологда",
    "Якутск",
    "Курган",
    "Владикавказ",
    "Орёл",
    "Подольск",
    "Грозный",
    "Тамбов",
    "Стерлитамак",
    "Нижневартовск",
    "Петрозаводск",
    "Кострома",
    "Новороссийск",
    "Мурманск",
    "Йошкар-Ола",
    "Нальчик",
    "Энгельс",
    "Химки",
    "Таганрог",
    "Комсомольск-на-Амуре",
    "Сыктывкар",
    "Нижнекамск",
    "Шахты",
    "Братск",
    "Дзержинск",
    "Ногинск",
    "Орск",
    "Колпино",
    "Благовещенск",
    "Старый Оскол",
    "Ангарск",
    "Великий Новгород",
    "Королёв",
    "Мытищи",
    "Псков",
    "Люберцы",
    "Бийск",
    "Южно-Сахалинск",
    "Армавир",
    "Рыбинск",
    "Прокопьевск",
    "Балаково",
    "Абакан",
    "Норильск",
    "Красногорск",
    "Сызрань",
    "Волгодонск",
    "Уссурийск",
    "Каменск-Уральский",
    "Новочеркасск",
    "Златоуст",
    "Петропавловск-Камчатский",
    "Электросталь",
    "Северодвинск",
    "Альметьевск",
    "Салават",
    "Миасс",
    "Орехово-Борисово Южное",
    "Копейск",
    "Одинцово",
    "Пятигорск",
    "Коломна",
    "Находка",
    "Березники",
    "Хасавюрт",
    "Рубцовск",
    "Майкоп",
    "Ковров",
    "Кисловодск",
    "Нефтеюганск",
    "Домодедово",
    "Нефтекамск",
    "Батайск",
    "Новочебоксарск",
    "Серпухов",
    "Щёлково",
    "Новомосковск",
    "Каспийск",
    "Дербент",
    "Первоуральск",
    "Черкесск",
    "Орехово-Зуево",
    "Назрань",
    "Невинномысск",
    "Раменское",
    "Димитровград",
    "Кызыл",
    "Обнинск",
    "Октябрьский",
    "Новый Уренгой",
    "Ессентуки",
    "Камышин",
    "Муром",
    "Долгопрудный",
    "Новошахтинск",
    "Жуковский",
    "Северск",
    "Реутов",
    "Ноябрьск",
    "Артём",
    "Ханты-Мансийск",
    "Пушкино",
    "Ачинск",
    "Сергиев Посад",
    "Елец",
    "Арзамас",
    "Бердск",
    "Элиста",
    "Ногинск",
    "Новокуйбышевск",
    "Железногорск",
    "Зеленодольск",
    "Гатчина",
    "Магадан",
    "Великие Луки",
    "Лобня",
    "Бузулук",
    "Кинешма",
    "Кузнецк",
    "Юрга",
    "Ивантеевка",
    "Черногорск",
    "Биробиджан",
    "Кирово-Чепецк",
    "Георгиевск",
    "Ишим",
    "Буйнакск",
    "Гуково",
    "Горно-Алтайск",
    "Фрязино",
    "Лыткарино",
    "Прохладный",
    "Шуя",
    "Искитим",
    "Климовск",
    "Дзержинский",
    "Волжск",
    "Салехард",
    "Московский",
    "Нововятск",
    "Можга",
    "Кизляр",
    "Котельники",
    "Канаш",
    "Краснознаменск",
    "Сосновоборск",
    "Моршанск",
    "Переславль-Залесский",
    "Мценск",
    "Баксан",
    "Протвино",
    "Касимов",
    "Кохма",
    "Котовск",
    "Дагестанские Огни",
    "Шумерля",
    "Удомля",
    "Десногорск",
    "Лосино-Петровский",
    "Нарьян-Мар",
    "Красково",
    "Карачаевск",
    "Козьмодемьянск",
    "Кирсанов",
    "Анадырь",
    "Удельная",
    "Кудрово",
    "Пионерский",
    "Хасания",
    "Магас",
    "Кенже",
    "Молочное",
    "Солянка",
    "Тимофеевка",
    "Белая Речка",
    "Дзержинское",
    "Власиха",
  ];

  // City coordinates for Yandex Maps
  const cityCoordinates = {
    Москва: [55.7558, 37.6176],
    "Санкт-Петербург": [59.9311, 30.3609],
    Новосибирск: [55.0084, 82.9357],
    Екатеринбург: [56.8519, 60.6122],
    Казань: [55.8304, 49.0661],
    "Нижний Новгород": [56.2965, 43.9361],
    Челябинск: [55.1644, 61.4368],
    Самара: [53.2001, 50.15],
    Уфа: [54.7388, 55.9721],
    "Ростов-на-Дону": [47.2357, 39.7015],
    Краснодар: [45.0448, 38.976],
    Пермь: [58.0105, 56.2502],
    Воронеж: [51.672, 39.1843],
    Волгоград: [48.708, 44.5133],
    Красноярск: [56.0184, 92.8672],
    Саратов: [51.5924, 46.0347],
    Тюмень: [57.1526, 65.5272],
    Тольятти: [53.5078, 49.4204],
    Ижевск: [56.8519, 53.2324],
    Барнаул: [53.3548, 83.7698],
    Ульяновск: [54.3176, 48.3706],
    Иркутск: [52.2896, 104.2806],
    Хабаровск: [48.4802, 135.0719],
    Ярославль: [57.6261, 39.8875],
    Владивосток: [43.1198, 131.8869],
    Махачкала: [42.9849, 47.5047],
    Томск: [56.4977, 84.9744],
    Оренбург: [51.7727, 55.0988],
    Кемерово: [55.3904, 86.0468],
    Новокузнецк: [53.7945, 87.1848],
  };

  // Get promo data from navigation state
  const promoData = location.state?.promoData || null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickupPointClick = () => {
    if (!formData.city) {
      toast.warning("Сначала введите город доставки", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    setShowMapModal(true);
  };

  const handleCitySelect = (city) => {
    setFormData((prev) => ({ ...prev, city: city }));
    setSelectedCity(city);
    // Clear pickup point when city changes
    setFormData((prev) => ({ ...prev, pickup_point: "" }));
    setSelectedPickupPoint("");
    // Fetch delivery points for the selected city
    fetchDeliveryPoints(city);
  };

  // Function to fetch delivery points from API
  const fetchDeliveryPoints = async (city) => {
    if (!city) return;

    setLoadingPoints(true);
    try {
      const response = await axios.get(
        `https://api.apiship.ru/v1/lists/points?limit=100&filter=city=${encodeURIComponent(
          city
        )}`,
        {
          headers: {
            Authorization: API_SHIP_TOKEN,
          },
        }
      );

      if (response.data && response.data.rows) {
        setApiPickupPoints(response.data.rows);
      } else {
        setApiPickupPoints([]);
      }
    } catch (error) {
      setApiPickupPoints([]);
    } finally {
      setLoadingPoints(false);
    }
  };

  const handlePickupPointSelect = (point) => {
    // Extract only the address part (after the dash)
    const addressPart = point.split(" - ")[1] || point;

    setFormData((prev) => ({
      ...prev,
      pickup_point: addressPart, // Only the address part for pickup point field
      address: addressPart, // Only the address part
    }));
    setSelectedPickupPoint(point);
    setShowMapModal(false);
  };

  // Initialize Yandex Map
  const initMap = () => {
    if (window.ymaps && formData.city) {
      const coordinates = cityCoordinates[formData.city] || [55.7558, 37.6176]; // Default to Moscow

      const ymap = new window.ymaps.Map(mapRef.current, {
        center: coordinates,
        zoom: 10, // Reduced zoom to show more of the city
        controls: ["zoomControl", "fullscreenControl"],
      });

      setMap(ymap);

      // Create clusterer for grouping nearby points
      const clusterer = new window.ymaps.Clusterer({
        preset: "islands#blueClusterIcons",
        groupByCoordinates: false,
        clusterDisableClickZoom: false, // Enable zoom on cluster click
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
        // Configure cluster to zoom to maximum level when clicked
        clusterOpenBalloonOnClick: false,
        clusterBalloonContentLayout: null,
        // Set maximum zoom level for cluster expansion
        clusterMaxZoom: 19, // Maximum zoom level
      });

      // Use real API data if available, otherwise generate sample points
      const pointsToShow = apiPickupPoints.length > 0 ? apiPickupPoints : [];

      if (pointsToShow.length === 0) {
        // Generate sample pickup points around the city center if no API data
        const points = [];
        for (let i = 1; i <= 20; i++) {
          const latOffset = (Math.random() - 0.5) * 0.02; // ±0.01 degrees
          const lngOffset = (Math.random() - 0.5) * 0.02;
          const point = {
            id: i,
            name: `Пункт выдачи №${i}`,
            coordinates: [
              coordinates[0] + latOffset,
              coordinates[1] + lngOffset,
            ],
            address: `ул. Примерная, ${Math.floor(Math.random() * 100) + 1}`,
          };
          points.push(point);

          // Add marker to map
          const marker = new window.ymaps.Placemark(
            point.coordinates,
            {
              balloonContent: `<strong>${point.name}</strong><br>${point.address}`,
            },
            {
              preset: "islands#blueCircleDotIcon",
              iconColor: "#2196f3",
            }
          );

          // Add click handler
          marker.events.add("click", () => {
            handlePickupPointSelect(`${point.name} - ${point.address}`);
          });

          clusterer.add(marker);
        }
        setPickupPoints(points);
      } else {
        // Use real API data
        pointsToShow.forEach((point) => {
          if (point.lat && point.lng) {
            // Add marker to map
            const marker = new window.ymaps.Placemark(
              [point.lat, point.lng],
              {
                balloonContent: `
                   <div style="padding: 10px; max-width: 300px;">
                     <h6 style="margin: 0 0 8px 0; color: #333;">${
                       point.name
                     }</h6>
                     <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">${
                       point.address
                     }</p>
                     ${
                       point.phone
                         ? `<p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">📞 ${point.phone}</p>`
                         : ""
                     }
                     ${
                       point.timetable
                         ? `<p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">🕒 ${point.timetable}</p>`
                         : ""
                     }
                     <button id="select-btn-${point.id}" 
                             style="background: #ff4da6; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-top: 8px; width: 100%;">
                       Выбрать
                     </button>
                   </div>
                 `,
              },
              {
                preset: "islands#blueCircleDotIcon",
                iconColor: "#2196f3",
              }
            );

            // Add click handler for the select button inside balloon
            marker.events.add("balloonopen", () => {
              setTimeout(() => {
                const selectBtn = document.getElementById(
                  `select-btn-${point.id}`
                );
                if (selectBtn) {
                  selectBtn.addEventListener("click", () => {
                    handlePickupPointSelect(`${point.name} - ${point.address}`);
                    ymap.balloon.close();
                  });
                }
              }, 100);
            });

            clusterer.add(marker);
          }
        });
        setPickupPoints(pointsToShow);
      }

      // Add clusterer to map
      ymap.geoObjects.add(clusterer);
    }
  };

  // Initialize map when modal opens
  useEffect(() => {
    if (showMapModal && formData.city) {
      // Fetch delivery points if not already loaded
      if (apiPickupPoints.length === 0) {
        fetchDeliveryPoints(formData.city);
      }

      setTimeout(() => {
        initMap();
      }, 100);
    }

    // Cleanup map when modal closes
    return () => {
      if (map) {
        map.destroy();
        setMap(null);
      }
    };
  }, [showMapModal, formData.city, apiPickupPoints]);

  useEffect(() => {
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
                ...item,
                flower: {
                  ...item.flower,
                  extra_items: productData.extra_items || [],
                },
              };
            } catch (error) {
              // Fallback if product fetch fails
              return {
                ...item,
                flower: {
                  ...item.flower,
                  extra_items: [],
                },
              };
            }
          })
        );

        setCartItems(itemsWithExtras);
      } catch (error) {
        // Error handling
      }
    };

    fetchCart();
  }, [API_BASE, userId]);

  // Clear all cart items function
  const clearCart = async () => {
    try {
      // Delete all cart items from API
      for (const item of cartItems) {
        await axios.delete(`${API_BASE}/cart-item/${item.id}/`);
      }

      // Clear cart context
      setContextCartItems([]);

      // Update localStorage cart quantity
      localStorage.setItem("cartQuantity", "0");

      // Cart cleared successfully
    } catch (error) {
      // Error handling
    }
  };

  // Check if any cart item has "открытка" extra item selected
  const hasPostcardExtra = () => {
    return cartItems.some((item) => {
      const selectedExtras = item.extras || [];
      const extraItems = item.flower?.extra_items || [];

      // Check if any selected extra has "открытка" in its name (case insensitive)
      return selectedExtras.some((selectedExtra) => {
        const extraId =
          typeof selectedExtra === "object" ? selectedExtra.id : selectedExtra;
        const extraItem = extraItems.find((extra) => extra.id === extraId);
        return extraItem && extraItem.name.toLowerCase().includes("открытка");
      });
    });
  };

  const isFormValid = () => {
    if (cartItems.length === 0) return false; // savat bo'sh bo'lsa ishlamasin

    if (tab === "courier") {
      return (
        formData.name?.trim() &&
        formData.phone_number?.trim() &&
        formData.address?.trim() &&
        formData.reason?.trim() &&
        formData.receiver_phone_number?.trim() &&
        formData.delivery_time?.trim()
      );
    } else {
      return (
        formData.name?.trim() &&
        formData.phone_number?.trim() &&
        formData.city?.trim() &&
        formData.pickup_point?.trim()
      );
    }
  };

  const handleOrderSubmit = async () => {
    setLoading(true);
    try {
      // Calculate subtotal including extras
      const subtotal = cartItems.reduce((total, item) => {
        const basePrice = item.flower?.price || 0;
        const extras = item.flower?.extra_items || [];
        const selectedExtras = item.extras || [];

        // Handle case where selectedExtras contains full objects instead of just IDs
        let extrasTotal = 0;

        if (
          selectedExtras.length > 0 &&
          typeof selectedExtras[0] === "object"
        ) {
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

        return total + (basePrice + extrasTotal) * item.quantity;
      }, 0);

      const discount = promoData ? promoData.value : 0;
      const totalPrice = Math.max(0, subtotal - discount);

      const payload = {
        order_items: cartItems.map((item) => ({
          quantity: item?.quantity,
          flower: item?.flower?.id,
          extras: item?.extras || [],
        })),
        user: userId,
        total_price: totalPrice,
        name: formData.name,
        phone_number: formData.phone_number,
        comment: formData.comment,
        postcard: formData.postcard,
        reason: formData.reason,
        receiver_phone_number: formData.receiver_phone_number,
        delivery_time: formData.delivery_time,
        latitude: "4",
        longitude: "-.11328",
        pickup_point: formData.pickup_point || "",
        is_delivery: tab !== "courier",
        status: "success",
        promo_code: promoData ? promoData.id : null, // Send promo code ID if exists
      };

      // Payload prepared

      await axios.post(`${API_BASE}/order/`, payload);

      // Clear cart after successful order
      await clearCart();

      toast.success("Заказ успешно отправлен!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Navigate to home page
      navigate("/");
    } catch (err) {
      toast.error(
        "Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.",
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const inputWrapperStyle = { position: "relative" };
  const inputIconStyle = {
    position: "absolute",
    top: "50%",
    left: "12px",
    transform: "translateY(-50%)",
    fontSize: "1.1rem",
    color: "#999",
  };
  const inputStyle = {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "10px 12px 10px 40px",
    fontSize: "0.95rem",
  };

  return (
    <Container style={{ maxWidth: "500px", padding: "20px 15px" }}>
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
      <style>
        {`
          @keyframes spin {
            from { transform: translateY(-50%) rotate(0deg); }
            to { transform: translateY(-50%) rotate(360deg); }
          }
        `}
      </style>
      <h4 className="mb-3 fw-semibold">Оформление заказа</h4>

      {/* Promo Code Display */}
      {promoData && (
        <div
          className="alert alert-success mb-3"
          style={{ fontSize: "0.9rem" }}
        >
          <i className="bi bi-tag-fill me-2"></i>
          <strong>Промокод активирован:</strong> {promoData.name}
          <br />
          <small>Скидка: {promoData.value.toLocaleString()} ₽</small>
        </div>
      )}

      {/* Tabs */}
      <div className="d-flex mb-3" style={{ gap: "8px" }}>
        <Button
          variant={tab === "courier" ? "light" : "outline-light"}
          onClick={() => setTab("courier")}
          style={{
            flex: 1,
            backgroundColor: tab === "courier" ? "#fff" : "#f7f7f7",
            border: "1px solid #ddd",
            borderRadius: "10px",
            fontWeight: 500,
            color: "#000",
          }}
        >
          Доставка курьером
        </Button>
        <Button
          variant={tab === "pickup" ? "light" : "outline-light"}
          onClick={() => setTab("pickup")}
          style={{
            flex: 1,
            backgroundColor: tab === "pickup" ? "#fff" : "#f7f7f7",
            border: "1px solid #ddd",
            borderRadius: "10px",
            fontWeight: 500,
            color: "#000",
          }}
        >
          Заберу в ПВЗ
        </Button>
      </div>

      {/* Postcard Extra Indicator */}
      {hasPostcardExtra() && (
        <div className="alert alert-info mb-3" style={{ fontSize: "0.9rem" }}>
          <i className="bi bi-file-earmark-text me-2"></i>
          <strong>Открытка включена в заказ</strong>
          <br />
          <small>Заполните поля для открытки ниже</small>
        </div>
      )}

      {/* Form */}
      <Form className="d-flex flex-column gap-3">
        {(() => {
          const baseFields = [
            {
              field: "name",
              icon: "bi-person",
              placeholder: "ФИО",
              required: true,
            },
            {
              field: "phone_number",
              icon: "bi-telephone",
              placeholder: "Телефон",
              required: true,
            },
            {
              field: "comment",
              icon: "bi-chat-dots",
              placeholder: "Комментарий",
              required: false,
            },
          ];

          // Add postcard fields only if "открытка" extra is selected
          const postcardFields = hasPostcardExtra()
            ? [
                {
                  field: "postcard",
                  icon: "bi-file-earmark-text",
                  placeholder: "Открытка",
                  isPostcard: true,
                },
                {
                  field: "postcard_text",
                  icon: "bi-pencil",
                  placeholder: "Напишите текст открытки",
                  isPostcard: true,
                },
              ]
            : [];

          const remainingFields = [
            { field: "reason", icon: "bi-gift", placeholder: "Повод" },
            {
              field: "receiver_phone_number",
              icon: "bi-telephone",
              placeholder: "Номер телефона получателя",
            },
            {
              field: "delivery_time",
              icon: "bi-clock",
              placeholder: "Время доставки",
              required: true,
            },
          ];

          return [...baseFields, ...postcardFields, ...remainingFields];
        })().map((item) => (
          <div style={inputWrapperStyle} key={item.field}>
            <i className={`bi ${item.icon}`} style={inputIconStyle}></i>
            <Form.Control
              placeholder={item.placeholder}
              style={inputStyle}
              value={formData[item.field] || ""}
              onChange={(e) => handleChange(item.field, e.target.value)}
            />
          </div>
        ))}

        {/* Address or Pickup fields */}
        {tab === "courier" ? (
          <div style={inputWrapperStyle}>
            <i className="bi bi-geo-alt" style={inputIconStyle}></i>
            <Form.Control
              placeholder="Адрес доставки"
              style={inputStyle}
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>
        ) : (
          <div>
            <Col className="mb-3">
              <div style={inputWrapperStyle}>
                <i className="bi bi-geo-alt" style={inputIconStyle}></i>
                <Form.Control
                  placeholder="Введите город доставки (например: Москва)"
                  style={inputStyle}
                  value={formData.city || ""}
                  list="cities-list"
                  onChange={(e) => {
                    const city = e.target.value;
                    handleChange("city", city);
                    if (city.trim()) {
                      fetchDeliveryPoints(city);
                    }
                  }}
                />
                <datalist id="cities-list">
                  {russianCities.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
            </Col>
            <Col>
              <div style={inputWrapperStyle}>
                <i className="bi bi-building" style={inputIconStyle}></i>
                <Form.Control
                  placeholder={
                    loadingPoints
                      ? "Загрузка пунктов выдачи..."
                      : "Пункт выдачи"
                  }
                  style={inputStyle}
                  value={formData.pickup_point || ""}
                  readOnly
                  onClick={handlePickupPointClick}
                  disabled={loadingPoints}
                />
                {loadingPoints && (
                  <div
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#999",
                    }}
                  >
                    <i
                      className="bi bi-arrow-clockwise"
                      style={{ animation: "spin 1s linear infinite" }}
                    ></i>
                  </div>
                )}
              </div>
            </Col>
          </div>
        )}

        <Button
          onClick={handleOrderSubmit}
          disabled={!isFormValid() || loading}
          style={{
            backgroundColor: isFormValid() ? "#ff4da6" : "#f5f5f5",
            border: "none",
            padding: "10px",
            borderRadius: "10px",
            color: isFormValid() ? "#fff" : "#999",
            fontWeight: 500,
          }}
        >
          {loading ? "Отправляется..." : "Рассчитать доставку"}
        </Button>
      </Form>

      {/* Pickup Point Map Modal - Full Screen */}
      <Modal
        show={showMapModal}
        onHide={() => setShowMapModal(false)}
        size="xl"
        fullscreen="lg-down"
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#f8f9fa" }}>
          <Modal.Title>Выберите пункт выдачи - {formData.city}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0, height: "80vh" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          >
            {/* Real Yandex Maps Container */}
            <div
              ref={mapRef}
              style={{
                width: "100%",
                height: "100%",
              }}
            ></div>

            {/* Close Button - Fixed at bottom center */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
              }}
            >
              <Button
                onClick={() => setShowMapModal(false)}
                style={{
                  backgroundColor: "#ff4da6",
                  border: "none",
                  padding: "12px 30px",
                  borderRadius: "25px",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "16px",
                  boxShadow: "0 4px 12px rgba(255, 77, 166, 0.3)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#ff3385";
                  e.target.style.transform = "translateX(-50%) scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#ff4da6";
                  e.target.style.transform = "translateX(-50%) scale(1)";
                }}
              >
                Закрыть
              </Button>
            </div>

            {/* Instructions overlay */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: "10px 15px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                maxWidth: "300px",
                zIndex: 1000,
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>
                <strong>Инструкция:</strong>
                <br />
                {loadingPoints
                  ? "Загрузка пунктов выдачи..."
                  : apiPickupPoints.length > 0
                  ? `Найдено ${apiPickupPoints.length} пунктов выдачи. Нажмите на любой синий маркер на карте, чтобы выбрать пункт выдачи.`
                  : "Пункты выдачи не найдены для данного города. Попробуйте другой город."}
              </p>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
