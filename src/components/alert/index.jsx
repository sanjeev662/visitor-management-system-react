import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Alert = ({
  open,
  onClose,
  title,
  message,
  buttonText,
  buttonColor,
  onButtonClick,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle className="mb-3 ms-1 text-xl font-bold" fontWeight={"bold"}>
        {title}
      </DialogTitle>
      <DialogContent className="px-2 my-4">{message}</DialogContent>
      <DialogActions>
        <Button
          onClick={onButtonClick}
          style={{
            backgroundColor: buttonColor,
            color: "white",
            width: "100%",
            padding: "3px",
            margin: "2px",
          }}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Alert;
