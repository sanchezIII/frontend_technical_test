import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <header className="header">
        <h1>Mi App</h1>
        <nav>{/* Navigation will be implemented here */}</nav>
      </header>
      <main className="main-content">{children}</main>
      <footer className="footer">{/* Footer content */}</footer>
    </div>
  );
};

export default Layout;
