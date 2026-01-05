import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user/token on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.text();

      if (!response.ok) {
        try {
            const jsonError = JSON.parse(data);
            throw new Error(jsonError.body || jsonError.message || data);
        } catch (e) {
            throw new Error(data);
        }
      }

      const userData = JSON.parse(data);
      // Assuming the API returns { user: { ... }, token: "..." }
      // We'll store the whole object or just the user info as needed.
      // For now, let's assume userData.user is the user object.
      const userToStore = userData.user || userData; 
      
      setUser(userToStore);
      localStorage.setItem('user', JSON.stringify(userToStore));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (email, password, username, isEmailSubscribed) => {
    try {
      const response = await fetch('/api/Register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username, isEmailSubscribed }),
      });

      const data = await response.text();

      if (!response.ok) {
        try {
            const jsonError = JSON.parse(data);
            throw new Error(jsonError.body || jsonError.message || data);
        } catch (e) {
            throw new Error(data);
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
