import React, { useState } from "react";

const ProductForm = ({ product = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    currency: product?.currency || "USD",
    billing_cycle: product?.billing_cycle || "monthly",
    is_active: product?.is_active ?? true,
    trial_period_days: product?.trial_period_days || product?.trial_days || 0,
    customizable: product?.customizable || false,
    customizable_fields: product?.customizable_fields || [],
    default_settings: product?.default_settings || {},
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Available customizable fields
  const availableCustomFields = [
    { value: "topBarColor", label: "Top Bar Color" },
    { value: "topBarBackgroundColor", label: "Top Bar Background Color" },
    { value: "defaultLang", label: "Default Language" },
    { value: "theme", label: "Theme" },
    { value: "logo", label: "Logo" },
  ];

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Price validation
    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = "Price must be a positive number";
    }

    // Trial period validation
    if (formData.trial_period_days < 0 || formData.trial_period_days > 365) {
      newErrors.trial_period_days =
        "Trial period must be between 0 and 365 days";
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
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        currency: formData.currency,
        billing_cycle: formData.billing_cycle,
        trial_period_days: parseInt(formData.trial_period_days),
        is_active: formData.is_active,
        customizable: formData.customizable,
        customizable_fields: formData.customizable_fields,
        default_settings: formData.default_settings,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error saving product");
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

  const handleCustomFieldChange = (field, checked) => {
    setFormData((prev) => {
      const newCustomizableFields = checked
        ? [...prev.customizable_fields, field]
        : prev.customizable_fields.filter((f) => f !== field);

      const newDefaultSettings = { ...prev.default_settings };

      if (checked) {
        // Add field with empty default value if not exists
        if (!newDefaultSettings[field]) {
          newDefaultSettings[field] = "";
        }
      } else {
        // Remove field from default_settings when unchecked
        delete newDefaultSettings[field];
      }

      return {
        ...prev,
        customizable_fields: newCustomizableFields,
        default_settings: newDefaultSettings,
      };
    });
  };

  const handleDefaultSettingChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      default_settings: {
        ...prev.default_settings,
        [key]: value,
      },
    }));
  };

  const removeDefaultSetting = (key) => {
    // Check if this is a predefined field
    const isPredefined = availableCustomFields.some(
      (field) => field.value === key
    );

    if (isPredefined) {
      // For predefined fields, just uncheck them (remove from customizable_fields and default_settings)
      setFormData((prev) => ({
        ...prev,
        customizable_fields: prev.customizable_fields.filter(
          (field) => field !== key
        ),
        default_settings: (() => {
          const newSettings = { ...prev.default_settings };
          delete newSettings[key];
          return newSettings;
        })(),
      }));
    } else {
      // For custom fields, remove them completely
      const newSettings = { ...formData.default_settings };
      delete newSettings[key];

      // Also remove from customizable_fields
      const newCustomizableFields = formData.customizable_fields.filter(
        (field) => field !== key
      );

      setFormData((prev) => ({
        ...prev,
        default_settings: newSettings,
        customizable_fields: newCustomizableFields,
      }));
    }
  };

  const addDefaultSetting = () => {
    const fieldName = prompt(
      "Enter the field name (e.g., topBarColor, theme, logo):"
    );
    if (!fieldName || !fieldName.trim()) {
      return;
    }

    const trimmedFieldName = fieldName.trim();

    // Check if field already exists
    if (formData.customizable_fields.includes(trimmedFieldName)) {
      alert("This field already exists!");
      return;
    }

    const defaultValue =
      prompt(`Enter default value for "${trimmedFieldName}" (optional):`) || "";

    setFormData((prev) => ({
      ...prev,
      default_settings: {
        ...prev.default_settings,
        [trimmedFieldName]: defaultValue,
      },
      customizable_fields: [...prev.customizable_fields, trimmedFieldName],
    }));
  };

  // Get all available fields (predefined + additional)
  const getAllAvailableFields = () => {
    // Only show fields that are currently selected or have default settings
    const activeFields = [];

    // Add fields that are in customizable_fields or default_settings
    const allFieldKeys = new Set([
      ...formData.customizable_fields,
      ...Object.keys(formData.default_settings),
    ]);

    allFieldKeys.forEach((key) => {
      // Check if it's a predefined field
      const predefinedField = availableCustomFields.find(
        (field) => field.value === key
      );

      if (predefinedField) {
        activeFields.push({
          value: predefinedField.value,
          label: predefinedField.label,
          isPredefined: true,
        });
      } else {
        // Custom field
        activeFields.push({
          value: key,
          label: key,
          isPredefined: false,
        });
      }
    });

    return activeFields;
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="product-form">
      <h2>{product ? "Edit Product" : "New Product"}</h2>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-group">
            <label htmlFor="name">Name: *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
              placeholder="Enter product name"
              required
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description (optional)"
              rows="3"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Active product
            </label>
          </div>
        </div>

        {/* Pricing */}
        <div className="form-section">
          <h3>Pricing</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price: *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? "error" : ""}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              {errors.price && (
                <span className="error-message">{errors.price}</span>
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

          <div className="form-row">
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

            <div className="form-group">
              <label htmlFor="trial_period_days">Trial Period (days):</label>
              <input
                type="number"
                id="trial_period_days"
                name="trial_period_days"
                value={formData.trial_period_days}
                onChange={handleChange}
                className={errors.trial_period_days ? "error" : ""}
                min="0"
                max="365"
              />
              {errors.trial_period_days && (
                <span className="error-message">
                  {errors.trial_period_days}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Customization */}
        <div className="form-section">
          <h3>Customization</h3>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="customizable"
                checked={formData.customizable}
                onChange={handleChange}
              />
              Allow customization for this product
            </label>
          </div>

          {formData.customizable && (
            <div className="customization-options">
              <h4>Available Custom Fields</h4>

              <div className="unified-custom-fields">
                {getAllAvailableFields().map((field) => (
                  <div key={field.value} className="unified-custom-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.customizable_fields.includes(
                          field.value
                        )}
                        onChange={(e) =>
                          handleCustomFieldChange(field.value, e.target.checked)
                        }
                      />
                      {field.label}
                    </label>
                    <button
                      type="button"
                      className="btn-remove-field"
                      onClick={() => removeDefaultSetting(field.value)}
                      title="Remove this custom field"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="add-custom-field">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={addDefaultSetting}
                >
                  Add Custom Field
                </button>
              </div>

              {/* Default Values Configuration */}
              {formData.customizable_fields.length > 0 && (
                <div className="default-values-section">
                  <h4>Default Values</h4>
                  <p className="form-help">
                    Configure the default values for your customizable fields.
                    Users can override these when creating subscriptions.
                  </p>

                  <div className="default-values-grid">
                    {formData.customizable_fields.map((fieldKey) => {
                      const fieldLabel =
                        getAllAvailableFields().find(
                          (f) => f.value === fieldKey
                        )?.label || fieldKey;
                      return (
                        <div key={fieldKey} className="form-group">
                          <label htmlFor={`default_${fieldKey}`}>
                            {fieldLabel} (default):
                          </label>
                          <input
                            type="text"
                            id={`default_${fieldKey}`}
                            value={formData.default_settings[fieldKey] || ""}
                            onChange={(e) =>
                              handleDefaultSettingChange(
                                fieldKey,
                                e.target.value
                              )
                            }
                            placeholder={`Enter default value for ${fieldLabel}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading
              ? "Saving..."
              : product
              ? "Update Product"
              : "Create Product"}
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

export default ProductForm;
