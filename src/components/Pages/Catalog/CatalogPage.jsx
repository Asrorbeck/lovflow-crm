import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Form,
  InputGroup,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import { useTelegramBackButton } from "../../../hooks/useTelegramBackButton";

const CatalogPage = () => {
  useTelegramBackButton();

  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState("");
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/categories/?ctg_id=${categoryId}`
        );
        const categoryData = response.data.Response || {};
        const productsData = categoryData.products || [];
        console.log("Fetched products:", productsData);
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategoryName(categoryData.name || "");
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, API_BASE]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const sortProducts = (sortType) => {
    let sortedProducts = [...products];

    switch (sortType) {
      case "price-low":
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case "new":
        sortedProducts.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "alphabet-az":
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "alphabet-za":
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredProducts(sortedProducts);
  };

  const handleApplySort = () => {
    sortProducts(selectedSort);
    setShowSortModal(false);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-3">Загрузка...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-3">
      {/* Category Title */}
      {categoryName && (
        <div className="mb-3">
          <h4 className="fw-bold">{categoryName}</h4>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <Row className="g-2">
          <Col xs={10}>
            <InputGroup
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/search")}
            >
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Найти..."
                readOnly
                style={{ borderRadius: "12px", cursor: "pointer" }}
              />
            </InputGroup>
          </Col>
          <Col xs={2}>
            <Button
              variant="outline-secondary"
              className="w-100"
              style={{
                borderRadius: "12px",
                borderColor: "#e9ecef",
                color: "#6c757d",
              }}
              onClick={() => setShowSortModal(true)}
              onMouseEnter={(e) => {
                e.target.style.color = "#6c757d";
                e.target.style.borderColor = "#e9ecef";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#6c757d";
                e.target.style.borderColor = "#e9ecef";
              }}
              onMouseDown={(e) => {
                e.target.style.color = "#6c757d";
                e.target.style.borderColor = "#e9ecef";
              }}
              onMouseUp={(e) => {
                e.target.style.color = "#6c757d";
                e.target.style.borderColor = "#e9ecef";
              }}
            >
              <i className="bi bi-sort-down"></i>
            </Button>
          </Col>
        </Row>
      </div>

      {/* Products Grid */}
      <Row className="g-3">
        {filteredProducts.map((product) => (
          <Col xs={6} key={product.id}>
            <Card
              className="shadow-sm h-100"
              style={{
                borderRadius: "16px",
                cursor: "pointer",
                border: "none",
              }}
              onClick={() => handleProductClick(product.id)}
            >
              <div style={{ position: "relative" }}>
                <Card.Img
                  variant="top"
                  src={
                    product.images && product.images.length > 0
                      ? product.images[0].image
                      : "/placeholder.jpg"
                  }
                  style={{
                    height: "200px",
                    objectFit: "cover",
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                  }}
                />

                {/* BADGES */}
                {product.tags?.length > 0 && (
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
                    {product.tags.some((tag) => tag.name === "хит продаж") && (
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
                    {product.tags.some((tag) => tag.name === "новинка") && (
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
                  {product.price} ₽
                </Card.Title>
                <Card.Text className="text-truncate">{product.name}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredProducts.length === 0 && (
        <div className="text-center mt-5">
          <p className="text-muted">Товары не найдены</p>
        </div>
      )}

      {/* Sort Modal */}
      <Modal
        show={showSortModal}
        onHide={() => setShowSortModal(false)}
        centered
        style={{ zIndex: 1055 }}
      >
        <Modal.Body
          style={{
            padding: "24px",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <h5 className="fw-bold mb-4">Сортировка</h5>

          <div className="mb-4">
            <Form.Check
              type="radio"
              id="price-low"
              name="sort"
              label="Сначала подешевле"
              value="price-low"
              checked={selectedSort === "price-low"}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="mb-3"
            />
            <Form.Check
              type="radio"
              id="price-high"
              name="sort"
              label="Сначала подороже"
              value="price-high"
              checked={selectedSort === "price-high"}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="mb-3"
            />
            <Form.Check
              type="radio"
              id="new"
              name="sort"
              label="Сначала новинки"
              value="new"
              checked={selectedSort === "new"}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="mb-3"
            />
            <Form.Check
              type="radio"
              id="alphabet-az"
              name="sort"
              label="По алфавиту А-Я"
              value="alphabet-az"
              checked={selectedSort === "alphabet-az"}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="mb-3"
            />
            <Form.Check
              type="radio"
              id="alphabet-za"
              name="sort"
              label="По алфавиту Я-А"
              value="alphabet-za"
              checked={selectedSort === "alphabet-za"}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="mb-3"
            />
          </div>

          <Button
            variant="primary"
            className="w-100"
            onClick={handleApplySort}
            disabled={!selectedSort}
            style={{
              backgroundColor: "#ff4da6",
              border: "none",
              borderRadius: "12px",
              padding: "12px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Применить
            <i className="bi bi-lock ms-2"></i>
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CatalogPage;
