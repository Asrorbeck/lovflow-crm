import React from "react";
import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Agreement() {
  const navigate = useNavigate();
  return (
    <Container>
      <Container>
        <Button
          className="w-100"
          style={{
            backgroundColor: "#ff4da6",
            border: "none",
            borderRadius: "8px",
            marginTop: "20px",
          }}
          onClick={() => navigate("/profile")}
        >
          Закрыть
        </Button>
      </Container>
    </Container>
  );
}

export default Agreement;
