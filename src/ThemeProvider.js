import React, { createContext, useState, useContext, useEffect } from "react";
import { createTheme } from "@mui/material/styles";

const ThemeContext = createContext();

// Light mode theme
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#17a2b8",
    },
    secondary: {
      main: "#757575",
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800",
    },
    info: {
      main: "#2196f3",
    },
    success: {
      main: "#4caf50",
    },
    background: {
      default: "#ffffff",
      main: "#17a2b8",
      header: "#f4f4f5",
    },
    text: {
      main: "#ffffff",
      primary: "#000000",
      secondary: "#757575",
    },
    border: {
      main: "#e0e0e0",
    },
  },
});

// Dark mode theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#011638",
    },
    secondary: {
      main: "#3b82f6",
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800",
    },
    info: {
      main: "#2196f3",
    },
    success: {
      main: "#4caf50",
    },
    background: {
      default: "#ffffff",
      main: "#011638",
      header: "#f4f4f5",
    },
    text: {
      main: "#ffffff",
      primary: "#000000",
      secondary: "#3b82f6",
    },
    border: {
      main: "#616161",
    },
  },
});

// Default mode theme
const defaultTheme = createTheme({
  palette: {
    mode: "default",
    primary: {
      main: "#364b24",
    },
    secondary: {
      main: "#eb8a2b",
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800",
    },
    info: {
      main: "#2196f3",
    },
    success: {
      main: "#4caf50",
    },
    background: {
      default: "#ffffff",
      main: "#364b24",
      header: "#f4f4f5",
    },
    text: {
      main: "#ffffff",
      primary: "#333333",
      secondary: "#697e57",
    },
    border: {
      main: "#616161",
    },
  },
});

// Custom mode theme
const customTheme = createTheme({
  palette: {
    mode: "custom",
    primary: {
      main: "#eb8a2b",
    },
    secondary: {
      main: "#17a2b8",
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800",
    },
    info: {
      main: "#2196f3",
    },
    success: {
      main: "#4caf50",
    },
    background: {
      default: "#ffffff",
      main: "#eb8a2b",
      header: "#f4f4f5",
    },
    text: {
      main: "#ffffff",
      primary: "#333333",
      secondary: "#757575",
    },
    border: {
      main: "#e0e0e0",
    },
  },
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(darkTheme);

  const toggleTheme = (newTheme) => {
    switch (newTheme) {
      case "light":
        setTheme(lightTheme);
        break;
      case "dark":
        setTheme(darkTheme);
        break;
      case "default":
        setTheme(defaultTheme);
        break;
      case "custom":
        setTheme(customTheme);
        break;
      default:
        setTheme(lightTheme);
        break;
    }
  };

  useEffect(() => {
    console.log(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
