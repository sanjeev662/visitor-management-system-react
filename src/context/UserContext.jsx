import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../components/notification";
import { url } from "../utils/Constants";

export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState();
  const [username, setUsername] = useState("");
  const [islogin, setIslogin] = useState(false);
  const [loggedUser, setLoggedUser] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`${url}/accounts/validate-token/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            token: localStorage.getItem("token"),
          }),
        });
        const json = await response.json();

        if (!response.ok) {
          Notification.showErrorMessage("Sorry", "Session has Expired!");
          localStorage.clear();
          setUser();
          navigate("/login");
        }
      } catch (err) {
        Notification.showErrorMessage("Error", "Server error!");
      }
    };
    verifyToken();
  }, []);

  return (
    <UserContext.Provider value={{
      isAuthenticated,
      user,
      setUser,
      username,
      setUsername,
      islogin,
      setIslogin,
      loggedUser,
      setLoggedUser
    }}>
      {children}
    </UserContext.Provider>
  );
}
