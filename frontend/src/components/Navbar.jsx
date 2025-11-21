// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="fas fa-tasks me-2 text-primary"></i>
          TaskBuddy
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {user && (
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">
                  <i className="fas fa-home me-1"></i>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/projects')}`} to="/projects">
                  <i className="fas fa-project-diagram me-1"></i>
                  Projects
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/notifications')}`} to="/notifications">
                  <i className="fas fa-bell me-1"></i>
                  Notifications
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/invites')}`} to="/invites">
                  <i className="fas fa-envelope me-1"></i>
                  Invites
                </Link>
              </li>
            </ul>
          )}

          <ul className="navbar-nav">
            {user ? (
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle d-flex align-items-center" 
                  href="#" 
                  id="navbarDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown"
                >
                  <div className="avatar me-2">
                    <i className="fas fa-user-circle fa-lg text-primary"></i>
                  </div>
                  {user.username || user.name}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text">
                      <small className="text-muted">{user.email}</small>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="fas fa-user-cog me-2"></i>
                      Profile Settings
                    </Link>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={logout}>
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-primary" to="/login">
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
