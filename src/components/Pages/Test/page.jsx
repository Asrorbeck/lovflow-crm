import React from "react";
import { Container, Card } from "react-bootstrap";
import { useTelegramBackButton } from "../../../hooks/useTelegramBackButton";

const TestPage = () => {
  // Enable Telegram back button
  useTelegramBackButton();

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h4>Telegram WebApp Back Button Test</h4>
        </Card.Header>
        <Card.Body>
          <p>
            Bu sahifa Telegram WebApp back button funksiyasini test qilish uchun
            yaratilgan.
          </p>
          <p>
            <strong>Test qilish uchun:</strong>
          </p>
          <ol>
            <li>Bu sahifani Telegram bot orqali oching</li>
            <li>Developer Tools (F12) ni oching</li>
            <li>Console tab-ini tanlang</li>
            <li>Debug ma'lumotlarini ko'ring</li>
            <li>
              Agar Telegram WebApp back button ko'rinsa, uni bosib ko'ring
            </li>
          </ol>

          <div className="mt-3 p-3 bg-light rounded">
            <h6>Debug Ma'lumotlari:</h6>
            <p>Console-da quyidagi ma'lumotlarni ko'rishingiz kerak:</p>
            <ul>
              <li>✅ Telegram WebApp detected!</li>
              <li>Platform, Version, User ma'lumotlari</li>
              <li>✅ BackButton.show() called successfully</li>
              <li>BackButton isVisible: true</li>
            </ul>
          </div>

          <div className="mt-3 p-3 bg-warning rounded">
            <h6>⚠️ Muhim:</h6>
            <p>
              Telegram WebApp back button faqat Telegram bot ichida ishlaydi.
              Oddiy brauzerda ochsangiz, back button ko'rinmaydi.
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TestPage;

