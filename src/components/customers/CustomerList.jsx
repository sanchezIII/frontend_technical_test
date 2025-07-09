import React, { useState, useEffect } from "react";
import { customerService } from "../../services/customerService";
import CustomerForm from "./CustomerForm";
import LoadingSpinner from "../common/LoadingSpinner";
import Modal from "../common/Modal";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, [currentPage]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 10,
      };
      const response = await customerService.getAll(params);
      setCustomers(response.data.customers || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error("Error loading customers:", error);
      alert("Error loading customers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer._id, customerData);
        alert("Customer updated successfully");
      } else {
        await customerService.create(customerData);
        alert("Customer created successfully");
      }
      handleCloseModal();
      loadCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("Error saving customer");
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (
      window.confirm(
        "Delete this customer? Note: Customers with active subscriptions cannot be deleted."
      )
    ) {
      try {
        await customerService.delete(id);
        alert("Customer deleted successfully");
        loadCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
        alert(
          "Error deleting customer. Customer may have active subscriptions."
        );
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getModalTitle = () => {
    return editingCustomer ? "Edit Customer" : "New Customer";
  };

  if (loading) return <LoadingSpinner message="Loading customers..." />;

  return (
    <div className="customer-list">
      <div className="list-header">
        <h2>Customers</h2>
        <button className="btn-primary" onClick={handleCreateCustomer}>
          New Customer
        </button>
      </div>

      {/* Customers Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer._id}>
              <td>
                <strong>{customer.name}</strong>
              </td>
              <td>{customer.email}</td>
              <td>{customer.phone || "N/A"}</td>
              <td>
                {customer.city && customer.country
                  ? `${customer.city}, ${customer.country}`
                  : customer.city || customer.country || "N/A"}
              </td>
              <td>
                <span
                  className={`status ${
                    customer.status === "active" ? "active" : "inactive"
                  }`}
                >
                  {customer.status}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-icon edit"
                    onClick={() => handleEditCustomer(customer)}
                    title="Edit customer"
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
                    onClick={() => handleDeleteCustomer(customer._id)}
                    title="Delete customer"
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

      {/* No customers message */}
      {customers.length === 0 && !loading && (
        <div className="empty-state">
          No customers found. Create your first customer!
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={getModalTitle()}
        size="medium"
      >
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleSaveCustomer}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default CustomerList;
