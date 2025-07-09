import React, { useState, useEffect } from "react";
import { useCrud, usePagination, useApiForm } from "../hooks/useApi";
import {
  customerService,
  productService,
  subscriptionService,
  analyticsService,
  auth,
} from "../services";

// Example component showing clean service usage patterns
const ServiceUsageExample = () => {
  const [activeTab, setActiveTab] = useState("customers");

  return (
    <div className="service-examples">
      <h1>Clean API Service Examples</h1>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={activeTab === "customers" ? "active" : ""}
          onClick={() => setActiveTab("customers")}
        >
          Customers
        </button>
        <button
          className={activeTab === "products" ? "active" : ""}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={activeTab === "subscriptions" ? "active" : ""}
          onClick={() => setActiveTab("subscriptions")}
        >
          Subscriptions
        </button>
        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "customers" && <CustomerExample />}
      {activeTab === "products" && <ProductExample />}
      {activeTab === "subscriptions" && <SubscriptionExample />}
      {activeTab === "analytics" && <AnalyticsExample />}
    </div>
  );
};

// Customer service example with CRUD hook
const CustomerExample = () => {
  const {
    items: customers,
    loading,
    error,
    getAll,
    create,
    update,
    remove,
  } = useCrud(customerService, "customers");

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    getAll();
  }, [getAll]);

  const handleCreateCustomer = async () => {
    try {
      const newCustomer = {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
      };
      await create(newCustomer);
      console.log("Customer created successfully");
    } catch (error) {
      console.error("Failed to create customer:", error);
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await remove(id);
      console.log("Customer deleted successfully");
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  return (
    <div className="customer-example">
      <h2>Customer Service Example</h2>

      <div className="actions">
        <button onClick={handleCreateCustomer}>Create Sample Customer</button>
        <button onClick={() => getAll()}>Refresh Customers</button>
      </div>

      {loading && <p>Loading customers...</p>}
      {error && <p className="error">Error: {error}</p>}

      <div className="customer-list">
        {customers.map((customer) => (
          <div key={customer.id} className="customer-item">
            <span>
              {customer.name} - {customer.email}
            </span>
            <button onClick={() => setSelectedCustomer(customer)}>Edit</button>
            <button onClick={() => handleDeleteCustomer(customer.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {selectedCustomer && (
        <CustomerEditForm
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onUpdate={(id, data) => update(id, data)}
        />
      )}
    </div>
  );
};

// Product service example with pagination
const ProductExample = () => {
  const {
    data: products,
    pagination,
    loading,
    error,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
  } = usePagination(productService, 1, 10);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Load categories
    const loadCategories = async () => {
      try {
        const response = await productService.getCategories();
        setCategories(response.data || response);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="product-example">
      <h2>Product Service Example</h2>

      <div className="categories">
        <h3>Categories:</h3>
        {categories.map((category) => (
          <span key={category.id} className="category-tag">
            {category.name}
          </span>
        ))}
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="error">Error: {error}</p>}

      <div className="product-grid">
        {products?.map((product) => (
          <div key={product.id} className="product-card">
            <h4>{product.name}</h4>
            <p>{product.description}</p>
            <span className="price">${product.price}</span>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={prevPage} disabled={pagination.page <= 1}>
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          onClick={nextPage}
          disabled={pagination.page >= pagination.totalPages}
        >
          Next
        </button>
        <select
          value={pagination.limit}
          onChange={(e) => changeLimit(Number(e.target.value))}
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
        </select>
      </div>
    </div>
  );
};

// Subscription service example with direct API calls
const SubscriptionExample = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);

  useEffect(() => {
    loadSubscriptions();
    loadActiveSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await subscriptionService.getAll();
      setSubscriptions(response.data || response);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSubscriptions = async () => {
    try {
      const response = await subscriptionService.getActive();
      setActiveSubscriptions(response.data || response);
    } catch (error) {
      console.error("Failed to load active subscriptions:", error);
    }
  };

  const handlePauseSubscription = async (id) => {
    try {
      await subscriptionService.pause(id);
      console.log("Subscription paused");
      loadSubscriptions(); // Refresh list
    } catch (error) {
      console.error("Failed to pause subscription:", error);
    }
  };

  const handleResumeSubscription = async (id) => {
    try {
      await subscriptionService.resume(id);
      console.log("Subscription resumed");
      loadSubscriptions(); // Refresh list
    } catch (error) {
      console.error("Failed to resume subscription:", error);
    }
  };

  return (
    <div className="subscription-example">
      <h2>Subscription Service Example</h2>

      <div className="stats">
        <div className="stat-card">
          <h3>Total Subscriptions</h3>
          <span>{subscriptions.length}</span>
        </div>
        <div className="stat-card">
          <h3>Active Subscriptions</h3>
          <span>{activeSubscriptions.length}</span>
        </div>
      </div>

      {loading && <p>Loading subscriptions...</p>}

      <div className="subscription-list">
        {subscriptions.map((subscription) => (
          <div key={subscription.id} className="subscription-item">
            <div className="subscription-info">
              <span>Customer: {subscription.customerName}</span>
              <span>Product: {subscription.productName}</span>
              <span className={`status ${subscription.status}`}>
                {subscription.status}
              </span>
            </div>
            <div className="subscription-actions">
              {subscription.status === "active" && (
                <button
                  onClick={() => handlePauseSubscription(subscription.id)}
                >
                  Pause
                </button>
              )}
              {subscription.status === "paused" && (
                <button
                  onClick={() => handleResumeSubscription(subscription.id)}
                >
                  Resume
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Analytics service example
const AnalyticsExample = () => {
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load dashboard metrics
      const metricsResponse = await analyticsService.getDashboardMetrics();
      setDashboardMetrics(metricsResponse.data || metricsResponse);

      // Load revenue analytics
      const revenueResponse = await analyticsService.getRevenueAnalytics({
        period: "monthly",
        months: 12,
      });
      setRevenueData(revenueResponse.data || revenueResponse);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAnalytics = async (type) => {
    try {
      await analyticsService.exportAnalytics(type, "csv");
      console.log(`${type} analytics exported successfully`);
    } catch (error) {
      console.error("Failed to export analytics:", error);
    }
  };

  return (
    <div className="analytics-example">
      <h2>Analytics Service Example</h2>

      {loading && <p>Loading analytics...</p>}

      {dashboardMetrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Customers</h3>
            <span>{dashboardMetrics.totalCustomers}</span>
          </div>
          <div className="metric-card">
            <h3>Total Revenue</h3>
            <span>${dashboardMetrics.totalRevenue}</span>
          </div>
          <div className="metric-card">
            <h3>Active Subscriptions</h3>
            <span>{dashboardMetrics.activeSubscriptions}</span>
          </div>
        </div>
      )}

      {revenueData && (
        <div className="revenue-chart">
          <h3>Revenue Trend</h3>
          <div className="chart-placeholder">
            {/* Here you would integrate a chart library */}
            <p>Revenue data loaded: {revenueData.length} data points</p>
          </div>
        </div>
      )}

      <div className="export-actions">
        <button onClick={() => handleExportAnalytics("customers")}>
          Export Customer Analytics
        </button>
        <button onClick={() => handleExportAnalytics("revenue")}>
          Export Revenue Analytics
        </button>
        <button onClick={() => handleExportAnalytics("subscriptions")}>
          Export Subscription Analytics
        </button>
      </div>
    </div>
  );
};

// Customer edit form using useApiForm hook
const CustomerEditForm = ({ customer, onClose, onUpdate }) => {
  const { submit, submitting, error, success } = useApiForm(
    (data) => onUpdate(customer.id, data),
    {
      onSuccess: () => {
        console.log("Customer updated successfully");
        setTimeout(onClose, 1000); // Close form after success
      },
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      await submit(data);
    } catch (error) {
      // Error already handled by hook
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Customer</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input name="name" defaultValue={customer.name} required />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              name="email"
              type="email"
              defaultValue={customer.email}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone:</label>
            <input name="phone" defaultValue={customer.phone} />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? "Updating..." : "Update Customer"}
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">Customer updated!</p>}
        </form>
      </div>
    </div>
  );
};

export default ServiceUsageExample;
