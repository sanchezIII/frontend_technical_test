import React, { useState, useEffect } from "react";
import { subscriptionService } from "../../services/subscriptionService";
import { customerService } from "../../services/customerService";
import { productService } from "../../services/productService";

const SubscriptionForm = ({ subscription = null, onSubmit, onCancel }) => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [useAdvancedMode, setUseAdvancedMode] = useState(true); // Use /api/subscribe by default

  const [formData, setFormData] = useState({
    customer_id: subscription?.customer_id || "",
    product_id: subscription?.product_id || "",
    amount: subscription?.amount || "",
    currency: subscription?.currency || "USD",
    billing_cycle: subscription?.billing_cycle || "monthly",
    status: subscription?.status || "active",
    custom_settings: subscription?.custom_settings || {},
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.product_id && products.length > 0) {
      const product = products.find((p) => p._id === formData.product_id);
      if (product) {
        setSelectedProduct(product);
        // Auto-inherit product values if in advanced mode and creating new subscription
        if (useAdvancedMode && !subscription) {
          setFormData((prev) => ({
            ...prev,
            amount: product.price,
            currency: product.currency,
            billing_cycle: product.billing_cycle,
          }));
        }
      }
    }
  }, [formData.product_id, products, useAdvancedMode, subscription]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [customersRes, productsRes] = await Promise.all([
        customerService.getAll({ per_page: 100 }),
        productService.getAll({ per_page: 100, is_active: true }),
      ]);
      setCustomers(customersRes.data.customers || []);
      setProducts(productsRes.data.products || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
      alert("Error loading customers and products");
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }

    if (useAdvancedMode) {
      // Advanced mode - only customer_id and product_id required
      if (!formData.product_id) {
        newErrors.product_id = "Product is required in advanced mode";
      }
    } else {
      // Basic mode - require amount, currency, billing_cycle
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = "Amount must be a positive number";
      }
      if (!formData.currency) {
        newErrors.currency = "Currency is required";
      }
      if (!formData.billing_cycle) {
        newErrors.billing_cycle = "Billing cycle is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...(formData.amount && { amount: parseFloat(formData.amount) }),
        ...(formData.currency && { currency: formData.currency }),
        ...(formData.billing_cycle && {
          billing_cycle: formData.billing_cycle,
        }),
        ...(formData.status && { status: formData.status }),
        custom_settings: formData.custom_settings,
      };

      // Only include customer_id and product_id for new subscriptions
      if (!subscription) {
        submitData.customer_id = formData.customer_id;
        if (formData.product_id) {
          submitData.product_id = formData.product_id;
        }
      }

      if (subscription) {
        // Update existing subscription
        await subscriptionService.update(subscription._id, submitData);
      } else {
        // Create new subscription
        if (useAdvancedMode) {
          await subscriptionService.subscribe(submitData);
        } else {
          await subscriptionService.create(submitData);
        }
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error saving subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCustomSettingChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      custom_settings: {
        ...prev.custom_settings,
        [key]: value,
      },
    }));
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const getFieldLabel = (key) => {
    // Mapping of predefined field keys to user-friendly labels
    const fieldLabels = {
      topBarColor: "Top Bar Color",
      topBarBackgroundColor: "Top Bar Background Color",
      defaultLang: "Default Language",
      theme: "Theme",
      logo: "Logo",
    };

    // Return the friendly label if it exists, otherwise format the key
    return (
      fieldLabels[key] ||
      key
        .split(/(?=[A-Z])/)
        .join(" ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    );
  };

  if (loadingData) {
    return (
      <div className="loading-form">Loading customers and products...</div>
    );
  }

  return (
    <div className="subscription-form">
      <h2>{subscription ? "Edit Subscription" : "New Subscription"}</h2>

      {!subscription && (
        <div className="mode-selector">
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={useAdvancedMode}
                onChange={(e) => setUseAdvancedMode(e.target.checked)}
              />
              Use advanced mode (inherit from product)
            </label>
            <small>
              Advanced mode automatically inherits price, currency, and billing
              cycle from the selected product.
            </small>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customer_id">Customer: *</label>
              <select
                id="customer_id"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                className={errors.customer_id ? "error" : ""}
                disabled={!!subscription}
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
              {errors.customer_id && (
                <span className="error-message">{errors.customer_id}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="product_id">
                Product: {useAdvancedMode && "*"}
              </label>
              <select
                id="product_id"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                className={errors.product_id ? "error" : ""}
                disabled={!!subscription}
                required={useAdvancedMode}
              >
                <option value="">Select a product (optional)</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - {product.currency} {product.price}/
                    {product.billing_cycle}
                  </option>
                ))}
              </select>
              {errors.product_id && (
                <span className="error-message">{errors.product_id}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="canceled">Canceled</option>
              <option value="expired">Expired</option>
              <option value="trial">Trial</option>
            </select>
          </div>
        </div>

        {/* Pricing - Show if not using advanced mode or if overriding */}
        {(!useAdvancedMode || subscription) && (
          <div className="form-section">
            <h3>Pricing {useAdvancedMode && "(Override Product Defaults)"}</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount: *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className={errors.amount ? "error" : ""}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required={!useAdvancedMode}
                />
                {errors.amount && (
                  <span className="error-message">{errors.amount}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="currency">Currency:</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="billing_cycle">Billing Cycle:</label>
              <select
                id="billing_cycle"
                name="billing_cycle"
                value={formData.billing_cycle}
                onChange={handleChange}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        )}

        {/* Custom Settings */}
        {selectedProduct?.customizable &&
          selectedProduct?.customizable_fields &&
          selectedProduct.customizable_fields.length > 0 && (
            <div className="form-section">
              <h3>Custom Settings</h3>

              <div className="custom-settings-grid">
                {selectedProduct.customizable_fields.map((fieldKey) => {
                  const defaultValue =
                    selectedProduct.default_settings?.[fieldKey] || "";
                  const currentValue =
                    formData.custom_settings[fieldKey] || defaultValue;

                  return (
                    <div key={fieldKey} className="form-group">
                      <label htmlFor={`custom_${fieldKey}`}>
                        {getFieldLabel(fieldKey)}:
                      </label>
                      <input
                        type="text"
                        id={`custom_${fieldKey}`}
                        value={currentValue}
                        onChange={(e) =>
                          handleCustomSettingChange(fieldKey, e.target.value)
                        }
                        placeholder={
                          defaultValue
                            ? `Default: ${defaultValue}`
                            : `Enter ${getFieldLabel(fieldKey)}`
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Show message if product is customizable but has no fields defined */}
        {selectedProduct?.customizable &&
          (!selectedProduct?.customizable_fields ||
            selectedProduct.customizable_fields.length === 0) && (
            <div className="form-section">
              <h3>Custom Settings</h3>
              <p className="no-custom-settings">
                This product allows customization but has no specific fields
                defined.
              </p>
            </div>
          )}

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading
              ? "Saving..."
              : subscription
              ? "Update Subscription"
              : "Create Subscription"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubscriptionForm;
