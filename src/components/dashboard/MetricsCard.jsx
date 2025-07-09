import React from "react";

const MetricsCard = ({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
}) => {
  return (
    <div className="metrics-card">
      <div className="metrics-header">
        {icon && <span className="metrics-icon">{icon}</span>}
        <h3 className="metrics-title">{title}</h3>
      </div>
      <div className="metrics-value">{value}</div>
      {description && <div className="metrics-description">{description}</div>}
      {trend && (
        <div className={`metrics-trend ${trend}`}>
          <span className="trend-indicator">
            {trend === "up" ? "↗️" : "↘️"}
          </span>
          <span className="trend-value">{trendValue}</span>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;
