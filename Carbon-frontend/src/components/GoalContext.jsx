import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

// Create the context
const GoalContext = createContext();

// Custom hook to use the GoalContext
export const useGoal = () => useContext(GoalContext);

// Provider component
export const GoalProvider = ({ children }) => {
  const [goal, setGoal] = useState(null);

  // Fetch the goal from backend
  const fetchGoal = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setGoal(null);
        return;
      }
      const res = await axios.get(`${API_BASE_URL}/api/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoal(res.data.weeklyGoal);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 401) {
        setGoal(null);
        return;
      }
      console.error("Failed to fetch goal", err);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, []);

  return (
    <GoalContext.Provider value={{ goal, setGoal, fetchGoal }}>
      {children}
    </GoalContext.Provider>
  );
};
