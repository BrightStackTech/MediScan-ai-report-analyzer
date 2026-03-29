import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
  healthProfile?: {
    dateOfBirth?: string;
    gender?: string;
    weight?: number;
    height?: number;
  };
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("mediscan_user");
    const storedToken = localStorage.getItem("mediscan_token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_URL}/users/login`, { email, password });
    const data = res.data;
    setUser(data);
    setToken(data.token);
    localStorage.setItem("mediscan_user", JSON.stringify(data));
    localStorage.setItem("mediscan_token", data.token);
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const res = await axios.post(`${API_URL}/users/register`, { name, email, phone, password });
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("mediscan_user");
    localStorage.removeItem("mediscan_token");
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem("mediscan_user", JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
