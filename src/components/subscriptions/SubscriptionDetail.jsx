import React, { useState, useEffect } from "react";
import { subscriptionService } from "../../services/subscriptionService";
import SubscriptionForm from "./SubscriptionForm";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import Modal from "../common/Modal";

const SubscriptionDetail = ({ subscriptionId, onEdit, onClose }) => {
  const [subscription, setSubscription] = useState(null);
  const [settings, setSettings] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (subscriptionId) {
      loadSubscriptionData();
    }
  }, [subscriptionId]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load subscription, settings, and status in parallel
      const [subscriptionRes, settingsRes, statusRes] = await Promise.all([
        subscriptionService.getById(subscriptionId),
        subscriptionService.getSettings(subscriptionId).catch(() => null),
        subscriptionService.getStatus(subscriptionId).catch(() => null),
      ]);

      setSubscription(subscriptionRes.data || subscriptionRes);
      setSettings(settingsRes?.data || settingsRes);
      setStatus(statusRes?.data || statusRes);
    } catch (error) {
      console.error("Error loading subscription data:", error);
      setError("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleSaveSubscription = async (subscriptionData) => {
    try {
      await subscriptionService.update(subscriptionId, subscriptionData);
      alert("Subscription updated successfully");
      handleCloseEditModal();
      loadSubscriptionData(); // Reload subscription data

      // If parent component provided onEdit callback, call it
      if (onEdit) {
        onEdit(subscription);
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Error updating subscription");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      try {
        await subscriptionService.delete(subscriptionId);
        alert("Subscription deleted successfully");
        if (onClose) {
          onClose();
        }
      } catch (error) {
        console.error("Error deleting subscription:", error);
        alert("Error deleting subscription");
      }
    }
  };

  const handleExtendSubscription = async () => {
    const days = prompt("Enter number of days to extend:");
    if (days && !isNaN(days) && parseInt(days) > 0) {
      try {
        await subscriptionService.extend(subscriptionId, {
          extension_days: parseInt(days),
        });
        alert(`Subscription extended by ${days} days`);
        loadSubscriptionData(); // Reload data
      } catch (error) {
        console.error("Error extending subscription:", error);
        alert("Error extending subscription");
      }
    }
  };

  const handleExtendToDate = async () => {
    const dateStr = prompt("Enter end date (YYYY-MM-DD):");
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      try {
        await subscriptionService.extend(subscriptionId, {
          end_date: new Date(dateStr).toISOString(),
        });
        alert(`Subscription extended to ${dateStr}`);
        loadSubscriptionData();
      } catch (error) {
        console.error("Error extending subscription:", error);
        alert("Error extending subscription");
      }
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm("Are you sure you want to cancel this subscription?")) {
      try {
        await subscriptionService.cancel(subscriptionId);
        alert("Subscription cancelled successfully");
        loadSubscriptionData();
      } catch (error) {
        console.error("Error cancelling subscription:", error);
        alert("Error cancelling subscription");
      }
    }
  };

  const handleRenewSubscription = async () => {
    if (window.confirm("Are you sure you want to renew this subscription?")) {
      try {
        await subscriptionService.renew(subscriptionId);
        alert("Subscription renewed successfully");
        loadSubscriptionData();
      } catch (error) {
        console.error("Error renewing subscription:", error);
        alert("Error renewing subscription");
      }
    }
  };

  const handleApplyDefaults = async () => {
    if (
      window.confirm(
        "Apply product default settings? This will override current custom settings."
      )
    ) {
      try {
        await subscriptionService.applyDefaults(subscriptionId);
        alert("Product defaults applied successfully");
        loadSubscriptionData();
      } catch (error) {
        console.error("Error applying defaults:", error);
        alert("Error applying product defaults");
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
      month: "long",
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

  const hasCustomSettings = () => {
    return (
      subscription?.custom_settings &&
      Object.keys(subscription.custom_settings).length > 0
    );
  };

  const hasEffectiveSettings = () => {
    return (
      settings?.effective_settings &&
      Object.keys(settings.effective_settings).length > 0
    );
  };

  if (loading) return <LoadingSpinner message="Loading subscription..." />;
  if (error)
    return <ErrorMessage message={error} onRetry={loadSubscriptionData} />;
  if (!subscription) return <div>Subscription not found</div>;

  return (
    <div className="subscription-detail">
      <div className="detail-header">
        <h2>Subscription Detail</h2>
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
              <label>Customer:</label>
              <span>{subscription.customer_name || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Customer Email:</label>
              <span>{subscription.customer_email || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Product:</label>
              <span>{subscription.product_name || "Custom Subscription"}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status ${getStatusColor(subscription.status)}`}>
                {subscription.status}
              </span>
            </div>
            <div className="info-item">
              <label>Auto Renew:</label>
              <span
                className={`auto-renew ${
                  subscription.auto_renew ? "yes" : "no"
                }`}
              >
                {subscription.auto_renew ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="info-section">
          <h3>Pricing</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Amount:</label>
              <span className="price-display">
                {formatPrice(subscription.amount, subscription.currency)}
              </span>
            </div>
            <div className="info-item">
              <label>Currency:</label>
              <span>{subscription.currency}</span>
            </div>
            <div className="info-item">
              <label>Billing Cycle:</label>
              <span className="billing-cycle-display">
                {subscription.billing_cycle === "monthly"
                  ? "Monthly"
                  : "Yearly"}
              </span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="info-section">
          <h3>Important Dates</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Start Date:</label>
              <span>{formatDate(subscription.start_date)}</span>
            </div>
            <div className="info-item">
              <label>End Date:</label>
              <span>{formatDate(subscription.end_date)}</span>
            </div>
            <div className="info-item">
              <label>Trial End Date:</label>
              <span>{formatDate(subscription.trial_end_date)}</span>
            </div>
            <div className="info-item">
              <label>Created:</label>
              <span>{formatDate(subscription.created_at)}</span>
            </div>
            <div className="info-item">
              <label>Last Updated:</label>
              <span>{formatDate(subscription.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Status Information */}
        {status && (
          <div className="info-section">
            <h3>Current Status</h3>
            <div className="status-info">
              <div className="status-item">
                <label>Is Active:</label>
                <span className={status.is_active ? "status-yes" : "status-no"}>
                  {status.is_active ? "Yes" : "No"}
                </span>
              </div>
              <div className="status-item">
                <label>Is Expired:</label>
                <span
                  className={status.is_expired ? "status-yes" : "status-no"}
                >
                  {status.is_expired ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Custom Settings */}
        {hasCustomSettings() && (
          <div className="info-section">
            <h3>Custom Settings</h3>
            <div className="settings-display">
              {Object.entries(subscription.custom_settings).map(
                ([key, value]) => (
                  <div key={key} className="setting-item">
                    <label>{key}:</label>
                    <span className="setting-value">
                      {key.toLowerCase().includes("color") ? (
                        <div className="color-preview">
                          <div
                            className="color-swatch"
                            style={{ backgroundColor: value }}
                          ></div>
                          {value}
                        </div>
                      ) : (
                        value
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Effective Settings (from API) */}
        {hasEffectiveSettings() && (
          <div className="info-section">
            <h3>Effective Settings</h3>
            <div className="settings-display">
              {Object.entries(settings.effective_settings).map(
                ([key, value]) => (
                  <div key={key} className="setting-item">
                    <label>{key}:</label>
                    <span className="setting-value">
                      {key.toLowerCase().includes("color") ? (
                        <div className="color-preview">
                          <div
                            className="color-swatch"
                            style={{ backgroundColor: value }}
                          ></div>
                          {value}
                        </div>
                      ) : (
                        value
                      )}
                    </span>
                  </div>
                )
              )}
            </div>

            {subscription.product_id && (
              <div className="settings-actions">
                <button onClick={handleApplyDefaults} className="btn-secondary">
                  Apply Product Defaults
                </button>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        {subscription.metadata &&
          Object.keys(subscription.metadata).length > 0 && (
            <div className="info-section">
              <h3>Metadata</h3>
              <div className="metadata-display">
                {Object.entries(subscription.metadata).map(([key, value]) => (
                  <div key={key} className="metadata-item">
                    <label>{key}:</label>
                    <span>
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Actions */}
      <div className="detail-actions">
        <button onClick={handleEdit} className="btn-primary">
          Edit Subscription
        </button>

        {subscription.status === "active" && (
          <>
            <button
              onClick={handleExtendSubscription}
              className="btn-secondary"
            >
              Extend (Days)
            </button>
            <button onClick={handleExtendToDate} className="btn-secondary">
              Extend (Date)
            </button>
            <button
              onClick={handleCancelSubscription}
              className="btn-secondary"
            >
              Cancel
            </button>
          </>
        )}

        {(subscription.status === "cancelled" ||
          subscription.status === "expired") && (
          <button onClick={handleRenewSubscription} className="btn-primary">
            Renew
          </button>
        )}

        <button onClick={handleDelete} className="btn-danger">
          Delete Subscription
        </button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit Subscription"
        size="large"
      >
        <SubscriptionForm
          subscription={subscription}
          onSubmit={handleSaveSubscription}
          onCancel={handleCloseEditModal}
        />
      </Modal>
    </div>
  );
};

export default SubscriptionDetail;
