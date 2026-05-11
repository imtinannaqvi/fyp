import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Read synchronously so loading is false immediately if data exists
const getInitialUser = () => {
  try {
    const storedUser  = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(getInitialUser);
  const [loading, setLoading] = useState(false);

  const login = (userData, tokenData) => {
    localStorage.setItem("token", tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAdmin: user?.role === "admin",
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);