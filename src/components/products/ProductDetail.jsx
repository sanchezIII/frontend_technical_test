import React, { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import ProductForm from "./ProductForm";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import Modal from "../common/Modal";

const ProductDetail = ({ productId, onEdit, onClose }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getById(productId);
      setProduct(response.data || response);
    } catch (error) {
      console.error("Error loading product:", error);
      setError("Failed to load product details");
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

  const handleSaveProduct = async (productData) => {
    try {
      await productService.update(productId, productData);
      alert("Product updated successfully");
      handleCloseEditModal();
      loadProduct(); // Reload product data

      // If parent component provided onEdit callback, call it
      if (onEdit) {
        onEdit(product);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product");
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? Note: Products with active subscriptions cannot be deleted."
      )
    ) {
      try {
        await productService.delete(productId);
        alert("Product deleted successfully");
        if (onClose) {
          onClose();
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product. It may have active subscriptions.");
      }
    }
  };

  const handleToggleActive = async () => {
    try {
      if (product.is_active) {
        await productService.deactivate(productId);
        alert("Product deactivated successfully");
      } else {
        await productService.activate(productId);
        alert("Product activated successfully");
      }
      loadProduct(); // Reload to get updated status
    } catch (error) {
      console.error("Error toggling product status:", error);
      alert("Error changing product status");
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

  const formatBillingCycle = (cycle) => {
    const cycles = {
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly",
    };
    return cycles[cycle] || cycle;
  };

  const hasFeatures = () => {
    return product?.features && product.features.length > 0;
  };

  const hasCustomizableFields = () => {
    return (
      product?.customizable_fields && product.customizable_fields.length > 0
    );
  };

  const hasDefaultSettings = () => {
    return (
      product?.default_settings &&
      Object.keys(product.default_settings).length > 0
    );
  };

  const getTrialPeriod = () => {
    // Handle both new field name and legacy field name
    const trialDays = product?.trial_period_days ?? product?.trial_days ?? 0;
    return trialDays;
  };

  if (loading) return <LoadingSpinner message="Loading product..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadProduct} />;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      <div className="detail-header">
        <h2>Product Detail</h2>
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
              <span>{product.name}</span>
            </div>
            <div className="info-item">
              <label>Description:</label>
              <span>{product.description || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span
                className={`status ${
                  product.is_active ? "active" : "inactive"
                }`}
              >
                {product.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="info-item">
              <label>Customizable:</label>
              <span
                className={`customizable-badge ${
                  product.customizable ? "yes" : "no"
                }`}
              >
                {product.customizable ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="info-section">
          <h3>Pricing</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Price:</label>
              <span className="price-display">
                {formatPrice(product.price, product.currency)}
              </span>
            </div>
            <div className="info-item">
              <label>Currency:</label>
              <span>{product.currency}</span>
            </div>
            <div className="info-item">
              <label>Billing Cycle:</label>
              <span className="billing-cycle-display">
                {formatBillingCycle(product.billing_cycle)}
              </span>
            </div>
            <div className="info-item">
              <label>Trial Period:</label>
              <span>
                {getTrialPeriod() > 0 ? `${getTrialPeriod()} days` : "No trial"}
              </span>
            </div>
          </div>
        </div>

        {/* Features */}
        {hasFeatures() && (
          <div className="info-section">
            <h3>Features</h3>
            <div className="features-list">
              {product.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-bullet">•</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customization */}
        {hasCustomizableFields() && (
          <div className="info-section">
            <h3>Customizable Fields</h3>
            <div className="custom-fields-list">
              {product.customizable_fields.map((field, index) => (
                <span key={index} className="custom-field-tag">
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Default Settings */}
        {hasDefaultSettings() && (
          <div className="info-section">
            <h3>Default Settings</h3>
            <div className="default-settings">
              {Object.entries(product.default_settings).map(([key, value]) => (
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
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="info-section">
          <h3>System Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Created:</label>
              <span>{formatDate(product.created_at)}</span>
            </div>
            <div className="info-item">
              <label>Last Updated:</label>
              <span>{formatDate(product.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="detail-actions">
        <button onClick={handleEdit} className="btn-primary">
          Edit Product
        </button>
        <button
          onClick={handleToggleActive}
          className={`btn-${product.is_active ? "secondary" : "primary"}`}
        >
          {product.is_active ? "Deactivate" : "Activate"}
        </button>
        <button onClick={handleDelete} className="btn-danger">
          Delete Product
        </button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit Product"
        size="large"
      >
        <ProductForm
          product={product}
          onSubmit={handleSaveProduct}
          onCancel={handleCloseEditModal}
        />
      </Modal>
    </div>
  );
};

export default ProductDetail;
