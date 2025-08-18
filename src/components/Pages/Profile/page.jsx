import React from "react";
import { Card, Container, ListGroup, Row, Col, Image } from "react-bootstrap";
import profilePic from "../../../images/1.jpg"; // profilingiz rasmi shu yerda
import { useUser } from "../../../context/UserContext";

const ProfilePage = () => {
  const { userData } = useUser();

  console.log(userData);

  return (
    <Container className="mt-4">
      {/* User Info */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs={3}>
              <Image
                src={userData.photo || profilePic}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px", // to'rtburchak (yumaloq emas)
                }}
              />
            </Col>
            <Col>
              <h6 className="mb-1 fw-bold">{userData.name}</h6>
              {userData.username && (
                <p className="mb-1 text-muted" style={{ fontSize: "0.9rem" }}>
                  @{userData.username}
                </p>
              )}
              <p className="mb-0 text-muted">
                Баланс: <strong>0.00 ₽</strong>
              </p>
              <p className="mb-0 text-muted">
                Бонусы: <strong>0 ₽</strong>
              </p>
              <p className="mb-0 text-muted">
                Персональная скидка: <strong>0%</strong>
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Menu List */}
      <Card className="mb-4 shadow-sm">
        <ListGroup variant="flush">
          {/* <ListGroup.Item action>
            <i className="bi bi-heart me-2" /> Избранное
          </ListGroup.Item>
          <ListGroup.Item action>
            <i className="bi bi-chat-dots me-2" /> Отзывы
          </ListGroup.Item> */}
          <ListGroup.Item href="/orders" action>
            <i className="bi bi-box-seam me-2" /> Мои заказы
          </ListGroup.Item>
          {/* <ListGroup.Item action>
            <i className="bi bi-credit-card me-2" /> Депозиты
          </ListGroup.Item> */}
          <ListGroup.Item href="/bonus" action>
            <i className="bi bi-gift me-2" /> Бонусы
          </ListGroup.Item>
          {/* <ListGroup.Item action>
            <i className="bi bi-plus-circle me-2" /> Пополнить счёт
          </ListGroup.Item> */}
        </ListGroup>
      </Card>

      {/* Policies */}
      <Card className="mb-2 shadow-sm">
        <ListGroup variant="flush">
          <ListGroup.Item href="/privacy-policy" action>
            <i className="bi bi-shield-lock me-2" /> Политика конфиденциальности
          </ListGroup.Item>
          <ListGroup.Item href="/agreement" action>
            <i className="bi bi-file-earmark-text me-2" /> Пользовательское
            соглашение
          </ListGroup.Item>
        </ListGroup>
      </Card>

      {/* Version */}
      <div
        className="text-center text-muted mt-3 mb-4"
        style={{ fontSize: "12px" }}
      >
        version 0.0.1
      </div>
    </Container>
  );
};

export default ProfilePage;
