import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/dashboard/Dashboard";
import CustomerList from "./components/customers/CustomerList";
import ProductList from "./components/products/ProductList";
import SubscriptionList from "./components/subscriptions/SubscriptionList";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            Subscription Manager
          </Link>
          <div className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/customers">Customers</Link>
            <Link to="/products">Products</Link>
            <Link to="/subscriptions">Subscriptions</Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/subscriptions" element={<SubscriptionList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
