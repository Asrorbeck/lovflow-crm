import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import image1 from "../../../images/1.jpg";
import { useTelegramBackButton } from "../../../hooks/useTelegramBackButton";

const CatalogPage = () => {
  // Enable Telegram back button
  useTelegramBackButton();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products
        const productsResponse = await axios.get(`${API_BASE}/product/`);
        const productsData = productsResponse.data.Response || [];
        setProducts(productsData);

        // Fetch categories
        const categoriesResponse = await axios.get(`${API_BASE}/categories/`);
        const categoriesData = categoriesResponse.data.Response || [];
        setCategories(categoriesData);
      } catch (error) {
        // Error handling
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE]);

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get top 6 products for display
  const topProducts = filteredProducts.slice(0, 6);

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/catalog/${category.id}`);
  };

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
    <Container className="p-3">
      {/* Search Bar */}
      <div
        className="bg-white pb-2 pt-2"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <InputGroup>
          <InputGroup.Text className="bg-white border-end-0">
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="search"
            placeholder="Найти..."
            className="border-start-0 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Products Section */}
      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h5>Весь ассортимент</h5>
        <Button variant="light" size="sm" onClick={() => navigate("/")}>
          Смотреть все
        </Button>
      </div>

      {/* Product Cards */}
      {topProducts.length > 0 ? (
        <div
          className="d-flex overflow-auto gap-3 pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {topProducts.map((product) => (
            <Card
              key={product.id}
              style={{ width: "200px", flex: "0 0 auto", cursor: "pointer" }}
              className="shadow-sm"
              onClick={() => handleProductClick(product)}
            >
              <Card.Img
                variant="top"
                src={product.images?.[0]?.image || image1}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderTopLeftRadius: "0.375rem",
                  borderTopRightRadius: "0.375rem",
                }}
              />
              <Card.Body>
                <Card.Title className="text-black fw-bold">
                  {product.price?.toLocaleString()} ₽
                </Card.Title>
                <Card.Text className="text-truncate">{product.name}</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted">
          {searchTerm ? "Ничего не найдено" : "Товары не найдены"}
        </div>
      )}

      {/* Categories Section */}
      <div className="mt-4">
        <h5 className="mb-3">Категории</h5>
        <Row>
          {categories.map((category) => (
            <Col
              xs={4}
              sm={3}
              md={2}
              key={category.id}
              className="text-center mb-4"
            >
              <div
                className="d-flex flex-column align-items-center justify-content-center p-3 bg-light rounded shadow-sm"
                style={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                }}
                onClick={() => handleCategoryClick(category)}
              >
                <i
                  className="bi bi-grid mb-2"
                  style={{ fontSize: "24px", color: "#ff4da6" }}
                ></i>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>
                  {category.name}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
};

export default CatalogPage;
