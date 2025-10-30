import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "./config";


const TokenTrackerContext = createContext();

export function useTokenTracker() {
  return useContext(TokenTrackerContext);
}

export default function TokenTrackerProvider({ user, setUser, children }) {
  const [showDialog, setShowDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  

  useEffect(() => {
    if (!user?.accessToken) return;

    const interval = setInterval(() => {
      try {
        const { exp } = jwtDecode(user.accessToken);
        if (Date.now() >= exp * 1000) {
          setShowDialog(true);
          setTimeLeft(0);
        }
      } catch {
        setShowDialog(true);
        setTimeLeft(0);
      }
    }, 5000); // check every 5 sec

    return () => clearInterval(interval);
  }, [user?.accessToken]);

  const refreshToken = async () => {
  try {
      const res = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (res.ok && data.accessToken) {
      setUser((prev) => {
        if (!prev) return null;
        const updated = { ...prev, accessToken: data.accessToken };
        localStorage.setItem("user", JSON.stringify(updated));
        return updated;
      });
      setShowDialog(false);
    } else {
      // Refresh failed → logout user
      setShowDialog(false);
      setUser(null);
      localStorage.removeItem("user");
      window.location.href = "/login"; // redirect to login
    }
  } catch {
    setShowDialog(false);
    setUser(null);
    localStorage.removeItem("user");
    window.location.href = "/login"; // redirect to login
  }
};


  return (
    <TokenTrackerContext.Provider value={{ showDialog, timeLeft, refreshToken }}>
      {children}
    </TokenTrackerContext.Provider>
  );
}
