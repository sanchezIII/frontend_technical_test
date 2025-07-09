import React, { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import ProductForm from "./ProductForm";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 10,
      };
      const response = await productService.getAll(params);
      setProducts(response.data.products || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await productService.update(editingProduct._id, productData);
        alert("Product updated successfully");
      } else {
        await productService.create(productData);
        alert("Product created successfully");
      }
      handleCloseModal();
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (
      window.confirm(
        "Delete this product? Note: Products with active subscriptions cannot be deleted."
      )
    ) {
      try {
        await productService.delete(id);
        alert("Product deleted successfully");
        loadProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product. It may have active subscriptions.");
      }
    }
  };

  const formatPrice = (amount, currency) => {
    const symbols = { EUR: "€", USD: "$", GBP: "£" };
    return `${symbols[currency] || currency} ${parseFloat(amount).toFixed(2)}`;
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getModalTitle = () => {
    return editingProduct ? "Edit Product" : "New Product";
  };

  if (loading) return <LoadingSpinner message="Loading products..." />;

  return (
    <div className="product-list">
      <div className="list-header">
        <h2>Products</h2>
        <button className="btn-primary" onClick={handleCreateProduct}>
          New Product
        </button>
      </div>

      {/* Products Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Billing</th>
            <th>Trial</th>
            <th>Customizable</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                <div className="product-name">
                  <strong>{product.name}</strong>
                  {product.description && (
                    <div className="product-description">
                      {product.description}
                    </div>
                  )}
                </div>
              </td>
              <td>{formatPrice(product.price, product.currency)}</td>
              <td>
                <span className="billing-cycle">{product.billing_cycle}</span>
              </td>
              <td>
                {product.trial_period_days ?? product.trial_days ?? 0} days
              </td>
              <td>
                <span
                  className={`customizable-badge ${
                    product.customizable ? "yes" : "no"
                  }`}
                >
                  {product.customizable ? "Yes" : "No"}
                </span>
              </td>
              <td>
                <span
                  className={`status ${
                    product.is_active ? "active" : "inactive"
                  }`}
                >
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-icon edit"
                    onClick={() => handleEditProduct(product)}
                    title="Edit product"
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
                    onClick={() => handleDeleteProduct(product._id)}
                    title="Delete product"
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

      {/* No products message */}
      {products.length === 0 && !loading && (
        <div className="empty-state">
          No products found. Create your first product!
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={getModalTitle()}
        size="large"
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSaveProduct}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default ProductList;
