import { Store } from "react-notifications-component";

const showErrorMessage = (title, message, duration=2000) => {
  Store.addNotification({
    title: title,
    message: message,
    type: "danger",
    insert: "bottom",
    container: "bottom-right",
    animationIn: ["animated", "fadeIn"],
    animationOut: ["animated", "fadeOut"],
    dismiss: {
      duration: duration,
      onScreen: true,
      showIcon: true,
    },
  });
};

const showSuccessMessage = (title, message) => {
  Store.addNotification({
    title: title,
    message: message,
    type: "success",
    insert: "bottom",
    container: "bottom-right",
    animationIn: ["animated", "fadeIn"],
    animationOut: ["animated", "fadeOut"],
    dismiss: {
      duration: 2000,
      onScreen: true,
      showIcon: true,
    },
  });
};


const Notification = {
  showErrorMessage,
  showSuccessMessage,
};

export default Notification;
