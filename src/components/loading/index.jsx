import React from "react";
import { CircularProgress, Grid } from "@mui/material";
import footerwave from "../../assets/images/footer-wave.png";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-customGreen w-full">
      <CircularProgress color="inherit" />
      <div className="absolute bottom-0 left-0 right-0">
        <img src={footerwave} alt="Wave" className="w-full" />
      </div>
    </div>
  );
};

export default Loading;
