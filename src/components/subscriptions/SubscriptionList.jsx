import React, { useState, useEffect } from "react";
import { subscriptionService } from "../../services/subscriptionService";
import { customerService } from "../../services/customerService";
import { productService } from "../../services/productService";
import SubscriptionForm from "./SubscriptionForm";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";

const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);

  useEffect(() => {
    loadSubscriptions();
  }, [currentPage]);

  const enrichSubscriptionData = async (subscriptions) => {
    const enrichedSubscriptions = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          const enrichedData = { ...subscription };

          // Fetch customer details
          if (subscription.customer_id) {
            const customerRes = await customerService.getById(
              subscription.customer_id
            );
            const customer = customerRes.data || customerRes;
            enrichedData.customer_name = customer.name;
            enrichedData.customer_email = customer.email;
          }

          // Fetch product details
          if (subscription.product_id) {
            const productRes = await productService.getById(
              subscription.product_id
            );
            const product = productRes.data || productRes;
            enrichedData.product_name = product.name;
          }

          return enrichedData;
        } catch (error) {
          console.error("Error enriching subscription data:", error);
          return subscription;
        }
      })
    );

    return enrichedSubscriptions;
  };

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 10,
      };
      const response = await subscriptionService.getAll(params);
      const rawSubscriptions = response.data.subscriptions || [];
      const enrichedSubscriptions = await enrichSubscriptionData(
        rawSubscriptions
      );
      setSubscriptions(enrichedSubscriptions);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      alert("Error loading subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = () => {
    setEditingSubscription(null);
    setShowModal(true);
  };

  const handleEditSubscription = (subscription) => {
    setEditingSubscription(subscription);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSubscription(null);
  };

  const handleSaveSubscription = async (subscriptionData) => {
    try {
      if (editingSubscription) {
        alert("Subscription updated successfully");
      } else {
        alert("Subscription created successfully");
      }
      handleCloseModal();
      loadSubscriptions();
    } catch (error) {
      console.error("Error saving subscription:", error);
      alert("Error saving subscription");
    }
  };

  const handleDeleteSubscription = async (id) => {
    if (window.confirm("Delete this subscription?")) {
      try {
        await subscriptionService.delete(id);
        alert("Subscription deleted successfully");
        loadSubscriptions();
      } catch (error) {
        console.error("Error deleting subscription:", error);
        alert("Error deleting subscription");
      }
    }
  };

  const formatPrice = (amount, currency) => {
    const symbols = { EUR: "€", USD: "$", GBP: "£" };
    return `${symbols[currency] || currency} ${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "active",
      inactive: "inactive",
      paused: "paused",
      cancelled: "inactive",
      expired: "inactive",
    };
    return colors[status] || "inactive";
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getModalTitle = () => {
    return editingSubscription ? "Edit Subscription" : "New Subscription";
  };

  if (loading) return <LoadingSpinner message="Loading subscriptions..." />;

  return (
    <div className="subscription-list">
      <div className="list-header">
        <h2>Subscriptions</h2>
        <button className="btn-primary" onClick={handleCreateSubscription}>
          New Subscription
        </button>
      </div>

      {/* Subscriptions Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Amount</th>
            <th>Billing</th>
            <th>Status</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((subscription) => (
            <tr key={subscription._id}>
              <td>
                <div className="customer-info">
                  <strong>{subscription.customer_name || "N/A"}</strong>
                  {subscription.customer_email && (
                    <div className="customer-email">
                      {subscription.customer_email}
                    </div>
                  )}
                </div>
              </td>
              <td>
                <div className="product-info">
                  <strong>{subscription.product_name || "Custom"}</strong>
                  {subscription.custom_settings &&
                    Object.keys(subscription.custom_settings).length > 0 && (
                      <div className="custom-indicator">Customized</div>
                    )}
                </div>
              </td>
              <td>{formatPrice(subscription.amount, subscription.currency)}</td>
              <td>
                <span className="billing-cycle">
                  {subscription.billing_cycle}
                </span>
              </td>
              <td>
                <span
                  className={`status ${getStatusColor(subscription.status)}`}
                >
                  {subscription.status}
                </span>
              </td>
              <td>{formatDate(subscription.end_date)}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-icon edit"
                    onClick={() => handleEditSubscription(subscription)}
                    title="Edit subscription"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDeleteSubscription(subscription._id)}
                    title="Delete subscription"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="btn-secondary"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      {/* No subscriptions message */}
      {subscriptions.length === 0 && !loading && (
        <div className="empty-state">
          No subscriptions found. Create your first subscription!
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={getModalTitle()}
        size="large"
      >
        <SubscriptionForm
          subscription={editingSubscription}
          onSubmit={handleSaveSubscription}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default SubscriptionList;
