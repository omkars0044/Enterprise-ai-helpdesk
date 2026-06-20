import React, { createContext, useContext, useState, useCallback } from "react";

export type Role = "Admin" | "Employee" | "Manager" | "Agent";
export interface User {
  username: string;
  role: Role;
  displayName: string;
  email: string;
}

const USERS: Record<string, { password: string; role: Role; displayName: string; email: string }> = {
  admin: { password: "bpa2024", role: "Admin", displayName: "Admin User", email: "admin@helpdesk.com" },
  emp001: { password: "emp123", role: "Employee", displayName: "Employee 001", email: "emp001@helpdesk.com" },
  emp002: { password: "emp456", role: "Employee", displayName: "Employee 002", email: "emp002@helpdesk.com" },
  manager: { password: "mgr456", role: "Manager", displayName: "Department Manager", email: "manager@helpdesk.com" },
  agent001: { password: "agt789", role: "Agent", displayName: "Support Agent", email: "agent001@helpdesk.com" },
};

interface AuthCtx {
  user: User | null;
  login: (username: string, password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({ user: null, login: () => "error", logout: () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem("cd_user");
    return s ? JSON.parse(s) : null;
  });

  const login = useCallback((username: string, password: string): string | null => {
    const u = USERS[username.toLowerCase()];
    if (!u || u.password !== password) return "Invalid credentials";
    const userData: User = { username: username.toLowerCase(), role: u.role, displayName: u.displayName, email: u.email };
    setUser(userData);
    localStorage.setItem("cd_user", JSON.stringify(userData));
    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("cd_user");
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
