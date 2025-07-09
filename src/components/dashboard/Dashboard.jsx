import React, { useState, useEffect } from "react";
import { analyticsService } from "../../services/analyticsService";
import MetricsCard from "./MetricsCard";
import LoadingSpinner from "../common/LoadingSpinner";

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(12);

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getFinancialMetrics(period);
      setMetrics(response.data);
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatMetricValue = (metric) => {
    if (!metric) return "N/A";

    const { value, unit } = metric;

    if (unit === "USD") {
      return `$${value.toFixed(2)}`;
    }
    if (unit === "percentage") {
      return `${(value * 100).toFixed(2)}%`;
    }
    return value;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Metrics Dashboard</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="period-selector"
        >
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
          <option value={24}>Last 24 months</option>
        </select>
      </div>

      {metrics && (
        <>
          <div className="metrics-grid">
            {Object.entries(metrics.metrics)
              .filter(([key]) => !["churn_rate", "rpr"].includes(key))
              .map(([key, metricData]) => (
                <MetricsCard
                  key={key}
                  title={key.toUpperCase()}
                  value={formatMetricValue(metricData)}
                  description={metricData.description}
                />
              ))}
          </div>

          <div className="summary-stats">
            <h3>Summary</h3>
            <p>
              Total Subscriptions:{" "}
              {metrics?.summary?.total_subscriptions ?? "N/A"}
            </p>
            <p>
              Active Subscriptions:{" "}
              {metrics?.summary?.total_active_subscriptions ?? "N/A"}
            </p>
            <p>Total Customers: {metrics?.summary?.total_customers ?? "N/A"}</p>
            <p>
              Active Customers: {metrics?.summary?.active_customers ?? "N/A"}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
