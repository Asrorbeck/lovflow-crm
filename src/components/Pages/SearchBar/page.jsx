import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Fetch all products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/product/`);
        const productsData = response.data.Response || [];
        setProducts(productsData);
      } catch (error) {
        console.error("Mahsulotlarni olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_BASE]);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleProductClick = (product) => {
    // Add to search history
    const newHistory = [
      product.name,
      ...searchHistory.filter((item) => item !== product.name),
    ].slice(0, 10); // Keep only last 10 searches

    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    // Navigate to product page
    navigate(`/product/${product.id}`);
  };

  const handleHistoryItemClick = (item) => {
    setSearchTerm(item);
    // Filter products for this history item
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(item.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleCancel = () => {
    setSearchTerm("");
    setFilteredProducts([]);
    navigate("/");
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  return (
    <Container className="mt-3">
      <div className="position-relative mb-3 d-flex align-items-center">
        <i
          className="bi bi-search position-absolute text-muted"
          style={{ left: "12px", fontSize: "1rem" }}
        ></i>

        <input
          type="text"
          placeholder="Найти..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="form-control rounded-pill ps-5 bg-light border-0 shadow-sm"
        />

        <Button
          variant="light"
          size="sm"
          onClick={handleCancel}
          className="position-absolute"
          style={{ right: "10px", fontSize: "0.875rem" }}
        >
          Отмена
        </Button>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className="mb-3">
          {loading ? (
            <div className="text-center py-3">
              <div
                className="spinner-border spinner-border-sm"
                role="status"
              ></div>
              <span className="ms-2">Поиск...</span>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div>
              <h6 className="text-muted mb-2">Результаты поиска:</h6>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="d-flex align-items-center py-2 ps-1"
                  style={{
                    borderRadius: "0.5rem",
                    transition: "background-color 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  onClick={() => handleProductClick(product)}
                >
                  <i className="bi bi-box text-muted me-2"></i>
                  <span>{product.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-muted">Ничего не найдено</div>
          )}
        </div>
      )}

      {/* Search History */}
      {!searchTerm && searchHistory.length > 0 && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="text-muted mb-0">История поиска:</h6>
            <Button
              variant="link"
              size="sm"
              className="text-muted p-0"
              onClick={clearHistory}
            >
              Очистить
            </Button>
          </div>
          {searchHistory.map((item, index) => (
            <div
              key={index}
              className="d-flex align-items-center py-2 ps-1"
              style={{
                borderRadius: "0.5rem",
                transition: "background-color 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f8f9fa")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              onClick={() => handleHistoryItemClick(item)}
            >
              <i className="bi bi-clock text-muted me-2"></i>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default SearchPage;
