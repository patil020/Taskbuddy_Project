import React from "react";
import { useAuth } from "../context/AuthContext";

export default function RoleBasedAccess({ 
  allowedRoles = [], 
  children, 
  fallback = null,
  showMessage = false 
}) {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!hasAccess) {
    if (showMessage) {
      return (
        <div className="alert alert-warning">
          <i className="fas fa-shield-alt me-2"></i>
          You don't have permission to access this feature. 
          {allowedRoles.includes('MANAGER') && ' Only managers can perform this action.'}
        </div>
      );
    }
    return fallback;
  }

  return children;
}

// Convenience components
export function ManagerOnly({ children, fallback = null, showMessage = false }) {
  return (
    <RoleBasedAccess 
      allowedRoles={['MANAGER']} 
      fallback={fallback}
      showMessage={showMessage}
    >
      {children}
    </RoleBasedAccess>
  );
}

export function MemberOnly({ children, fallback = null, showMessage = false }) {
  return (
    <RoleBasedAccess 
      allowedRoles={['MEMBER']} 
      fallback={fallback}
      showMessage={showMessage}
    >
      {children}
    </RoleBasedAccess>
  );
}

export function ManagerOrMember({ children, fallback = null, showMessage = false }) {
  return (
    <RoleBasedAccess 
      allowedRoles={['MANAGER', 'MEMBER']} 
      fallback={fallback}
      showMessage={showMessage}
    >
      {children}
    </RoleBasedAccess>
  );
}