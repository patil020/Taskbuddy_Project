import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/roleUtils';

export default function RoleGuard({ children, requiredRole, fallback = null }) {
  const { user } = useAuth();
  
  if (!hasPermission(user, requiredRole)) {
    return fallback;
  }
  
  return children;
}