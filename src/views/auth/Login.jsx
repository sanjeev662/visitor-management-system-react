import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { url } from "../../utils/Constants";
import { UserContext } from "../../context/UserContext.jsx";
import Notification from "../../components/notification";
import modlogo from "../../assets/images/web-logo.png";
import footerwave from "../../assets/images/footer-wave.png";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Loading from "../../components/loading";

const Login = () => {
  let navigate = useNavigate();

  const { setUser } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${url}/accounts/login-user/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      const json = await response.json();

      if (response.ok) {
        Notification.showSuccessMessage("Welcome", "Logged in Successfully");

        localStorage.setItem("user_id", json.id);
        localStorage.setItem("user_name", json.username);
        localStorage.setItem("user_type", json.user_type);
        localStorage.setItem("image", json.image);
        localStorage.setItem("token", json.token.access);
        localStorage.setItem("refresh_token", json.token.refresh);
        localStorage.setItem("userInfo", JSON.stringify(json));

        setUser(json);
        setUsername("");
        setPassword("");
        navigate("/");
      } else {
        setIsLoading(false);
        Notification.showErrorMessage("Login Failed", json.error || "Invalid credentials");
      }
    } catch (err) {
      setIsLoading(false);
      Notification.showErrorMessage("Error", "Server error!");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loading/></div>;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-customGreen w-full">
      {/* <form className="p-8 min-w-[440px] border border-gray-300 rounded-lg shadow-md" onSubmit={handleSubmit} > */}
      <form className="p-8 min-w-[440px] rounded-lg" style={{ 'border': "1px solid #567763", "boxShadow": "rgba(0, 0, 0, 0.24) 0px 3px 8px" }} onSubmit={handleSubmit} >
        <div className="flex justify-center mb-1">
          <img src={modlogo} alt="Ministry of Defence" className="h-26" />
        </div>
        <div className="flex justify-center mb-1 text-white text-lg md:text-xl">
          {/* Ministry Of Defence, India */}
          Visitor Management System
        </div>
        <div className="flex justify-center mb-4 text-white text-lg md:text-xl">
          {/* रक्षा मंत्रालय, भारत */}
          विज़िटर प्रबंधन प्रणाली
        </div>
        <div className="mb-4">
          <label htmlFor="username" className="sr-only">Username</label>
          <input
            type="text"
            id="username"
            className="w-full p-2 rounded-lg bg-customFieldGreen text-white"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-6 relative">
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            className="w-full p-2 rounded-lg bg-customFieldGreen text-white pr-10"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={handleTogglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex text-white items-center text-sm leading-5"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </button>
        </div>

        {/* <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg"> */}
        <button type="submit" className="w-full text-white p-2 rounded-lg" style={{ backgroundColor: "rgb(15 70 37)" }}>
          Login
        </button>
      </form>
      <div className="absolute bottom-0 left-0 right-0">
        <img src={footerwave} alt="Wave" className="w-full" />
      </div>
    </div>
  );
};

export default Login;



