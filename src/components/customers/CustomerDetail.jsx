import React, { useState, useEffect } from "react";
import { customerService } from "../../services/customerService";
import CustomerForm from "./CustomerForm";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import Modal from "../common/Modal";

const CustomerDetail = ({ customerId, onEdit, onClose }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadCustomer();
      loadCustomerSubscriptions();
    }
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getById(customerId);
      setCustomer(response.data || response);
    } catch (error) {
      console.error("Error loading customer:", error);
      setError("Failed to load customer details");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      const response = await customerService.getSubscriptions(customerId);
      setSubscriptions(response.data || response || []);
    } catch (error) {
      console.error("Error loading customer subscriptions:", error);
      // Don't show error for subscriptions, just log it
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      await customerService.update(customerId, customerData);
      alert("Customer updated successfully");
      handleCloseEditModal();
      loadCustomer(); // Reload customer data

      // If parent component provided onEdit callback, call it
      if (onEdit) {
        onEdit(customer);
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Error updating customer");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await customerService.delete(customerId);
        alert("Customer deleted successfully");
        if (onClose) {
          onClose();
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert("Error deleting customer");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <LoadingSpinner message="Loading customer..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadCustomer} />;
  if (!customer) return <div>Customer not found</div>;

  return (
    <div className="customer-detail">
      <div className="detail-header">
        <h2>Customer Detail</h2>
        {onClose && (
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        )}
      </div>

      <div className="detail-content">
        {/* Basic Information */}
        <div className="info-section">
          <h3>Basic Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{customer.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{customer.email}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{customer.phone || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status ${customer.status}`}>
                {customer.status}
              </span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="info-section">
          <h3>Address</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Address:</label>
              <span>{customer.address || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>City:</label>
              <span>{customer.city || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Country:</label>
              <span>{customer.country || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Postal Code:</label>
              <span>{customer.postal_code || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="info-section">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Created:</label>
              <span>{formatDate(customer.created_at)}</span>
            </div>
            <div className="info-item">
              <label>Last Updated:</label>
              <span>{formatDate(customer.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Subscriptions */}
        <div className="info-section">
          <h3>Subscriptions</h3>
          {loadingSubscriptions ? (
            <p>Loading subscriptions...</p>
          ) : subscriptions.length > 0 ? (
            <div className="subscriptions-list">
              {subscriptions.map((subscription, index) => (
                <div
                  key={subscription._id || index}
                  className="subscription-item"
                >
                  <span className="subscription-name">
                    {subscription.productName ||
                      subscription.product_name ||
                      "Unknown Product"}
                  </span>
                  <span className={`status ${subscription.status}`}>
                    {subscription.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No active subscriptions</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="detail-actions">
        <button onClick={handleEdit} className="btn-primary">
          Edit Customer
        </button>
        <button onClick={handleDelete} className="btn-danger">
          Delete Customer
        </button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit Customer"
        size="medium"
      >
        <CustomerForm
          customer={customer}
          onSubmit={handleSaveCustomer}
          onCancel={handleCloseEditModal}
        />
      </Modal>
    </div>
  );
};

export default CustomerDetail;
