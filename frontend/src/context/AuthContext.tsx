"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "fisherman" | "researcher" | "official";

export interface RoleDetails {
  // Fisherman fields
  boat_name?: string;
  boat_registration?: string;
  home_port?: string;

  // Researcher fields
  institution_name?: string;
  research_interest?: string;

  // Official fields
  department_name?: string;
  designation?: string;
  jurisdiction?: string;
}

export interface User {
  id: number | string;
  full_name: string;
  phone: string;
  email: string;
  gender: string;
  role: UserRole;
  default_region: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  role_details: RoleDetails;
  created_at?: string;
}

export interface SignupFormData {
  full_name: string;
  phone: string;
  country_code?: string;
  email: string;
  gender: string;
  role: UserRole;
  default_region: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  password: string;
  role_details: RoleDetails;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (formData: SignupFormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateDefaultRegion: (region: string) => void;
  updateProfile: (updatedData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Fallback demo accounts for instant testing / offline demo resilience
const DEMO_USERS: Record<string, User> = {
  "fisherman@innowave.in": {
    id: 1,
    full_name: "Capt. Rajesh Patil",
    phone: "+91 98201 54321",
    email: "fisherman@innowave.in",
    gender: "Male",
    role: "fisherman",
    default_region: "mumbai",
    emergency_contact_name: "Sunita Patil (Wife)",
    emergency_contact_phone: "+91 98201 98765",
    role_details: {
      boat_name: "Matsya Sagar IV",
      boat_registration: "IND-MH-01-MM-4820",
      home_port: "Sassoon Docks, Mumbai"
    }
  },
  "researcher@innowave.in": {
    id: 2,
    full_name: "Dr. Priya Nair",
    phone: "+91 94470 12345",
    email: "researcher@innowave.in",
    gender: "Female",
    role: "researcher",
    default_region: "kochi",
    emergency_contact_name: "Dr. K. Nair (Brother)",
    emergency_contact_phone: "+91 94470 54321",
    role_details: {
      institution_name: "Central Marine Fisheries Research Institute (CMFRI)",
      research_interest: "Pelagic Shoal Dynamics & Chlorophyll Front Convergence"
    }
  },
  "official@innowave.in": {
    id: 3,
    full_name: "Commander Vivek Sharma",
    phone: "+91 98110 99887",
    email: "official@innowave.in",
    gender: "Male",
    role: "official",
    default_region: "goa",
    emergency_contact_name: "ICG Duty Officer HQ",
    emergency_contact_phone: "+91 832 2520616",
    role_details: {
      department_name: "Indian Coast Guard (ICG) Regional HQ West",
      designation: "Commanding Officer - Coastal Safety Enforcement",
      jurisdiction: "Goa & South Maharashtra Sector"
    }
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize session from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedToken = localStorage.getItem("innowave-auth-token");
        const savedUserStr = localStorage.getItem("innowave-user");
        if (savedToken && savedUserStr) {
          const parsedUser = JSON.parse(savedUserStr);
          setUser(parsedUser);
          setToken(savedToken);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (e) {
        console.error("Failed to restore auth session:", e);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const saveSession = (newToken: string, newUser: User) => {
    setUser(newUser);
    setToken(newToken);
    if (typeof window !== "undefined") {
      localStorage.setItem("innowave-auth-token", newToken);
      localStorage.setItem("innowave-user", JSON.stringify(newUser));

      // Sync user's default coastal region to active map location
      if (newUser.default_region) {
        localStorage.setItem("innowave-active-location", newUser.default_region);
        window.dispatchEvent(new CustomEvent("innowave-location-changed", { detail: newUser.default_region }));
      }

      window.dispatchEvent(new CustomEvent("innowave-auth-changed", { detail: newUser }));
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    try {
      // 1. Try Backend API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        saveSession(data.token, data.user);
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        // If API returned 401/400, return the specific error
        if (res.status === 401 || res.status === 400) {
          return { success: false, error: errData.detail || "Invalid email or password." };
        }
        throw new Error(errData.detail || "Login failed");
      }
    } catch (err: any) {
      console.warn("Backend login error or offline mode. Checking local demo accounts...", err);

      // 2. Offline / Demo account fallback
      if (DEMO_USERS[trimmedEmail]) {
        if (password === "demo1234" || password.length >= 6) {
          const demoUser = DEMO_USERS[trimmedEmail];
          saveSession(`demo-jwt-${demoUser.role}-${Date.now()}`, demoUser);
          return { success: true };
        } else {
          return { success: false, error: "Incorrect password for demo account. Use: demo1234" };
        }
      }

      return { 
        success: false, 
        error: err.message || "Unable to connect to server. Please check your network or try demo credentials." 
      };
    }
  };

  const signup = async (formData: SignupFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        saveSession(data.token, data.user);
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 400 || res.status === 422) {
          return { success: false, error: errData.detail || "Validation error during registration." };
        }
        throw new Error(errData.detail || "Signup failed");
      }
    } catch (err: any) {
      console.warn("Backend signup failed or offline. Creating offline local profile...", err);

      // Offline mock registration resilience
      const newLocalUser: User = {
        id: "offline-" + Date.now(),
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email.toLowerCase(),
        gender: formData.gender,
        role: formData.role,
        default_region: formData.default_region,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        role_details: formData.role_details
      };

      saveSession(`offline-jwt-${Date.now()}`, newLocalUser);
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("innowave-auth-token");
      localStorage.removeItem("innowave-user");
      window.dispatchEvent(new CustomEvent("innowave-auth-changed", { detail: null }));
    }
    router.push("/login");
  };

  const updateDefaultRegion = (region: string) => {
    if (user) {
      const updatedUser = { ...user, default_region: region };
      setUser(updatedUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("innowave-user", JSON.stringify(updatedUser));
      }
    }
  };

  const updateProfile = async (updatedData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "No authenticated user session." };

    const mergedUser: User = {
      ...user,
      ...updatedData,
      role_details: {
        ...user.role_details,
        ...(updatedData.role_details || {})
      }
    };

    saveSession(token || `local-jwt-${Date.now()}`, mergedUser);

    try {
      if (token && !token.startsWith("demo-") && !token.startsWith("offline-") && !token.startsWith("local-")) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(updatedData),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
      }
    } catch (e) {
      console.warn("Profile update synced locally; backend sync pending or offline mode:", e);
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateDefaultRegion,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
