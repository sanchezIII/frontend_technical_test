import React from "react";

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <p className="error-text">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          Intentar de nuevo
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
