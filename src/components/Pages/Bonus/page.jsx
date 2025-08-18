import Lottie from "lottie-react";
import React from "react";
import { Container } from "react-bootstrap";
import empty from "../../../images/13_FOLDER_empty.json"; // path moslab yoz

function Bonus() {
  return (
    <Container
      className="py-4"
      style={{ minHeight: "85vh", paddingBottom: "140px" }}
    >
      <div className=" mb-4">
        <h4 className="fw-semi-bold fs-3 m-0">Бонусы</h4>

        <div
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ minHeight: "60vh" }} // yoki 80vh qilsa ham bo'ladi
        >
          <div style={{ maxWidth: 150, margin: "0 auto" }}>
            <Lottie animationData={empty} loop={true} />
          </div>
          <h5 className="mt-4">Бонусов нет</h5>
          <p>Вы не получали бонусы</p>
        </div>
      </div>
    </Container>
  );
}

export default Bonus;
