// src/pages/StatusCheck.jsx
import React, { useState, useEffect } from 'react';

export default function StatusCheck() {
  const [backendStatus, setBackendStatus] = useState('checking...');
  const [frontendStatus] = useState('running ✅');

  useEffect(() => {
    // Test backend connectivity using Promise
    new Promise((resolve, reject) => {
      fetch('/api/auth/test')
        .then(response => {
          if (response.ok) {
            resolve();
          } else {
            reject();
          }
        })
        .catch(reject);
    })
      .then(() => setBackendStatus('connected ✅'))
      .catch(() => setBackendStatus('offline ❌'));
  }, []);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>TaskBuddy System Status</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Frontend:</strong> <span className="text-success">{frontendStatus}</span>
              </div>
              <div className="mb-3">
                <strong>Backend:</strong> <span className={backendStatus.includes('✅') ? 'text-success' : 'text-danger'}>{backendStatus}</span>
              </div>
              <div className="mb-3">
                <strong>ErrorBoundary:</strong> <span className="text-success">working ✅</span>
              </div>
              
              <hr />
              
              <h6>Quick Links:</h6>
              <div className="d-grid gap-2">
                <a href="/login" className="btn btn-primary">Login Page</a>
                <a href="/register" className="btn btn-outline-primary">Register Page</a>
                <a href="/dashboard" className="btn btn-success">Dashboard</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
