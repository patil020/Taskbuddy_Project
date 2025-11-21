import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, me } from "../api/auth";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("tb_token");
    if (!token) { 
      setLoading(false); 
      return; 
    }
    
    me()
      .then((response) => {
        if (response.data?.success && response.data?.data) {
          setUser(response.data.data);
        }
      })
      .catch(() => {
        localStorage.removeItem("tb_token");
        localStorage.removeItem("tb_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiLogin({ username, password });
      if (response.data?.success && response.data?.data) {
        const auth = response.data.data;
        localStorage.setItem("tb_token", auth.token);
        const userData = {
          id: auth.userId,
          username: auth.username,
          email: auth.email,
          role: auth.role
        };
        localStorage.setItem("tb_user", JSON.stringify(userData));
        setUser(userData);
      }
      return response;
    } catch (error) {
      localStorage.removeItem("tb_token");
      localStorage.removeItem("tb_user");
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("tb_token");
    localStorage.removeItem("tb_user");
    setUser(null);
    window.location.replace("/login");
  };

  const updateUserInfo = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("tb_user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUserInfo,
    isAuthenticated: !!user && !!localStorage.getItem("tb_token"),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
