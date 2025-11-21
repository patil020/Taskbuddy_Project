export const USER_ROLES = {
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER'
};

export const isManager = (user) => {
  return user?.role === USER_ROLES.MANAGER;
};

export const isMember = (user) => {
  return user?.role === USER_ROLES.MEMBER;
};

export const hasPermission = (user, requiredRole) => {
  if (!user || !user.role) return false;
  
  if (requiredRole === USER_ROLES.MANAGER) {
    return user.role === USER_ROLES.MANAGER;
  }
  
  return true;
};

export const getRoleDisplayName = (role) => {
  switch (role) {
    case USER_ROLES.MANAGER:
      return 'Manager';
    case USER_ROLES.MEMBER:
      return 'Member';
    default:
      return 'Unknown';
  }
};