// src/pages/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUser, changePassword } from "../api/user";
import { showSuccess, showError, showWarning } from "../utils/toastUtils";
import Alert from "../components/Alert";

export default function UserProfile() {
  const { user, updateUserInfo } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [validationError, setValidationError] = useState('');

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await updateUser(user.id, profileForm);
      if (response.data.success) {
        updateUserInfo(response.data.data);
        showSuccess('Profile updated successfully!');
      } else {
        showError(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setValidationError('New passwords do not match');
      showError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      showError('Password must be at least 6 characters long');
      return;
    }

    setValidationError('');

    setLoading(true);
    
    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response.data.success) {
        showSuccess('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showError(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <div className="profile-picture-container mb-3">
                <img
                  src={previewUrl || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=007bff&color=fff&size=150`}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                <div className="mt-2">
                  <label htmlFor="profilePicture" className="btn btn-outline-primary btn-sm">
                    <i className="fas fa-camera me-1"></i>
                    Change Photo
                  </label>
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              <h5>{user?.username}</h5>
              <p className="text-muted">{user?.email}</p>
              <span className={`badge ${user?.role === 'MANAGER' ? 'bg-primary' : 'bg-secondary'}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <i className="fas fa-user me-1"></i>
                    Profile Information
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                  >
                    <i className="fas fa-lock me-1"></i>
                    Change Password
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={profileForm.firstName}
                        onChange={handleProfileChange}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={profileForm.lastName}
                        onChange={handleProfileChange}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={profileForm.username}
                        onChange={handleProfileChange}
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i>
                          Update Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      minLength="6"
                      required
                    />
                    <div className="form-text">Password must be at least 6 characters long.</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      minLength="6"
                      required
                    />
                  </div>

                  {validationError && (
                    <Alert 
                      type="error" 
                      message={validationError} 
                      onClose={() => setValidationError('')} 
                      className="mb-3" 
                    />
                  )}

                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Changing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-key me-1"></i>
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}