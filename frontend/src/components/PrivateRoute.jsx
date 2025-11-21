import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const token = localStorage.getItem("tb_token");
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height:"100vh"}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (token && user) ? children : <Navigate to="/login" replace />;
}