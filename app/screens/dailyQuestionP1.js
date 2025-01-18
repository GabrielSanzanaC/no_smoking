import React, { useState } from "react";

const DailyQuestions = () => {
  const [step, setStep] = useState(2); // Paso actual
  const [cigarettes, setCigarettes] = useState(8); // Número de cigarrillos

  const handleIncrement = () => {
    setCigarettes((prev) => Math.min(prev + 1, 99));
  };

  const handleDecrement = () => {
    setCigarettes((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="daily-questions-container">
      <div className="header">
        <h2>Daily Questions</h2>
        <div className="steps">
          <span className={`step ${step === 1 ? "active" : ""}`}>01</span>
          <span className={`step ${step === 2 ? "active" : ""}`}>02</span>
          <span className={`step ${step === 3 ? "active" : ""}`}>03</span>
        </div>
      </div>

      <div className="question">
        <h3>How many cigarettes did you smoke yesterday?</h3>
      </div>

      <div className="cigarette-counter">
        <button className="counter-button" onClick={handleDecrement}>-</button>
        <div className="cigarette-display">
          <div className="cigarette-visual">
            <div
              className="cigarette-fill"
              style={{ height: `${(cigarettes / 10) * 100}%` }}
            ></div>
          </div>
          <span className="cigarette-count">{cigarettes.toString().padStart(2, '0')}</span>
        </div>
        <button className="counter-button" onClick={handleIncrement}>+</button>
      </div>

      <button className="next-button">Next</button>
    </div>
  );
};

export default DailyQuestions;
