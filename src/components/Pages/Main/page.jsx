import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Carousel, Card, Button, Container } from "react-bootstrap";
import image1 from "../../../images/1.jpg";
import image3 from "../../../images/3.jpg";
import image7 from "../../../images/7.jpg";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${baseURL}/categories/`);
        setCategories(res.data.Response || []);
      } catch (err) {
        console.error("Ошибка при загрузке категорий:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  console.log(categories);

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border"
            role="status"
            style={{
              width: "3rem",
              height: "3rem",
              borderWidth: "5px",
              borderColor: "#ff4da6",
              borderRightColor: "transparent",
            }}
          ></div>
          <p className="mt-3">Загрузка...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-3">
      {/* Slider */}
      <Carousel fade interval={3000}>
        <Carousel.Item>
          <img
            className="d-block w-100 rounded"
            src={image7}
            alt="First slide"
          />
          <Carousel.Caption>
            <h3>LABUBU ИЗ ЦВЕТОВ</h3>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 rounded"
            src={image1}
            alt="Second slide"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 rounded"
            src={image3}
            alt="Third slide"
          />
        </Carousel.Item>
      </Carousel>

      {/* Catalog Sections */}
      {categories.map((section) => (
        <div key={section.id} className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>{section.name}</h5>
            <Button variant="light" size="sm">
              Смотреть все
            </Button>
          </div>

          <div className="d-flex overflow-auto gap-3 pb-2">
            {section.products.map((item) => (
              <Card
                key={item.id}
                style={{
                  width: "200px",
                  flex: "0 0 auto",
                  cursor: "pointer",
                  position: "relative",
                }}
                className="shadow-sm"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <div style={{ position: "relative" }}>
                  <Card.Img
                    variant="top"
                    src={item.images[0]?.image || image1}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderTopLeftRadius: "0.375rem",
                      borderTopRightRadius: "0.375rem",
                    }}
                  />

                  {/* BADGES */}
                  {item.tags?.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        display: "flex",
                        gap: "4px",
                        flexWrap: "wrap",
                      }}
                    >
                      {item.tags.some((tag) => tag.name === "хит продаж") && (
                        <span
                          style={{
                            backgroundColor: "#f72585",
                            color: "white",
                            padding: "2px 6px",
                            fontSize: "12px",
                            borderRadius: "10px",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <i className="bi bi-rocket-takeoff"></i> хит продаж
                        </span>
                      )}
                      {item.tags.some((tag) => tag.name === "новинка") && (
                        <span
                          style={{
                            backgroundColor: "#4361ee",
                            color: "white",
                            padding: "2px 6px",
                            fontSize: "12px",
                            borderRadius: "10px",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <i className="bi bi-stars"></i> новинка
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Card.Body>
                  <Card.Title className="text-black fw-bold">
                    {item.price} ₽
                  </Card.Title>
                  <Card.Text className="text-truncate">{item.name}</Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </Container>
  );
};

export default HomePage;
