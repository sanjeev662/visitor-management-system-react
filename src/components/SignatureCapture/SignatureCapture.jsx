import React, { useState, useEffect } from "react";
import { Grid } from "@mui/material";
import {
  STPadServerLibDefault,
  STPadServerLibCommons,
} from "./STPadServerLib-3.3.0";
import Notification from "../notification";
import CanvasModal from "./CanvasModal";

const SignatureCapture = ({ onCapture }) => {
  const [scaleFactorX, setScaleFactorX] = useState(0);
  const [scaleFactorY, setScaleFactorY] = useState(0);
  const [message, setMessage] = useState("");
  const [clearCanvas, setClearCanvas] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState(null);

  const handleDataFromCanvas = (data) => {
    setMessage(data);
  };

  const fetchData = async () => {
    function onOpen(connection) {
      let sampleRate = 0;
      STPadServerLibDefault.handleConfirmSignature = async function () {
        try {
          var awaitConfirmSignature =
            await STPadServerLibDefault.confirmSignature();
          const countedPoints = awaitConfirmSignature.countedPoints;

          const valueforSignature = countedPoints / sampleRate;
          var params = new STPadServerLibDefault.Params.getSignatureImage();
          params.setFileType(STPadServerLibDefault.FileType.PNG);
          params.setPenWidth(5);
          var awaitgetSignatureImage =
            await STPadServerLibDefault.getSignatureImage(params);
          const base64 = awaitgetSignatureImage.file;
          setMessage(base64);
          setModalOpen(false);

          await STPadServerLibDefault.closePad(params4);
          await STPadServerLibCommons.destroyConnection();
        } catch (error) {
          if (
            (error.errorMessage =
              "The function could not be executed because no signature capture process was started.")
          ) {
            Notification.showErrorMessage("Info", "Please draw a signature");
            return await STPadServerLibDefault.retrySignature();
          }
        }
      };

      STPadServerLibDefault.handleRetrySignature = async function () {
        await STPadServerLibDefault.retrySignature();
        setClearCanvas(true);
      };

      STPadServerLibDefault.handleCancelSignature = async function () {
        await STPadServerLibDefault.cancelSignature();
        var params = new STPadServerLibDefault.Params.closePad(0);
        await STPadServerLibDefault.closePad(params);
        await STPadServerLibCommons.destroyConnection();
        setModalOpen(false);
      };

      const signatureQueue = [];

      STPadServerLibCommons.handleNextSignaturePoint = async function (
        x,
        y,
        p
      ) {
        const signaturePoint = { x: x, y: y, p: p };
        setData(signaturePoint);
        signatureQueue.push({ x, y, p });
      };

      async function performOperations(
        params1,
        params2,
        params3,
        getSignatureDataParams
      ) {
        try {
          const result1 = await STPadServerLibDefault.searchForPads(params1);
          const result2 = await STPadServerLibDefault.openPad(params2);
          const result3 = await STPadServerLibDefault.startSignature(
            params3,
            STPadServerLibDefault.handleCancelSignature,
            STPadServerLibDefault.handleRetrySignature,
            STPadServerLibDefault.handleConfirmSignature,
            STPadServerLibCommons.handleNextSignaturePoint
          );

          const padHeight = result2.padInfo.displayHeight;
          const padWidth = result2.padInfo.displayWidth;
          const xResolution = result2.padInfo.xResolution;
          const yResolution = result2.padInfo.yResolution;
          sampleRate = result2.padInfo.samplingRate;
          setScaleFactorX(padWidth / xResolution);
          setScaleFactorY(padHeight / yResolution);
        } catch (error) {
          if (
            error.errorMessage ===
            "No compatible devices connected or the connection to a device has been cut."
          ) {
            Notification.showErrorMessage("Info", "Please connect a signing pad");
          }
          STPadServerLibCommons.destroyConnection();
          return "No Pad Found";
        }
      }

      var params1 = new STPadServerLibDefault.Params.searchForPads();
      var params2 = new STPadServerLibDefault.Params.openPad(0);
      var params4 = new STPadServerLibDefault.Params.closePad(0);
      var params3 = new STPadServerLibDefault.Params.startSignature();
      params3.setFieldName("Customer Sign");
      params3.setCustomText("Please sign");
      params1.setPadSubset("HID");
      var getSignatureDataParams =
        new STPadServerLibDefault.Params.getSignatureData();
      getSignatureDataParams.setRsaScheme("PSS");

      performOperations(params1, params2, params3, getSignatureDataParams);
    }

    function onClose(connection) {
      Notification.showErrorMessage("Info", "Signotec Sigma Pad disconnected");
    }

    function onError(connection, error) {
      // console.log("Signotec Sigma Pad error:", error);
    }

    try {
      await STPadServerLibCommons.createConnection(
        "wss://local.signotecwebsocket.de:49494/",
        onOpen,
        onClose,
        onError
      );
    } catch (e) {
      // console.log(e);
    }
  };

  useEffect(() => {
    STPadServerLibCommons.destroyConnection();
  }, []);

  useEffect(() => {
    if (message !== "") {
      onCapture(message);
    }
  }, [message]);

  const handleButtonClick = async () => {
    const result = await fetchData();
    if (result === "No Pad Found") {
      setModalOpen(false);
    } else {
      setModalOpen(true);
    }
  };

  const handleButtonClickRetake = () => {
    setMessage("");
    const result = fetchData();
    if (result === "No Pad Found") {
      setModalOpen(false);
    } else {
      setModalOpen(true);
    }
  };

  return (
    <div
      className="webcam-container"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {message !== "" ? (
            <button className="flex items-center bg-customGreen hover:bg-green-700 text-white py-1 px-4 rounded-3xl" onClick={() => handleButtonClickRetake()}>
              Retake Signature
            </button>
          ) : (
            <button className="flex items-center bg-customGreen hover:bg-green-700 text-white py-1 px-4 rounded-3xl" onClick={handleButtonClick}>
              Capture Signature
            </button>
          )}
        </Grid>
      </Grid>
      {modalOpen && (
        <CanvasModal
          open={modalOpen}
          liveImageData={data}
          setOpenModal={setModalOpen}
          sendDatatoMain={handleDataFromCanvas}
          clearCanvas={clearCanvas}
          scaleFactorhorizontal={scaleFactorX}
          scaleFactorvertical={scaleFactorY}
        />
      )}
    </div>
  );
};

export default SignatureCapture;
