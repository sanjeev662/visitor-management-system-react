import React, { useEffect } from "react";
import {
  STPadServerLibDefault,
  STPadServerLibCommons,
} from "./STPadServerLib-3.3.0";
import "./CanvasModal.css";
import Notification from "../notification";

function CanvasModal({
  open,
  liveImageData,
  setOpenModal,
  sendDatatoMain,
  clearCanvas,
  scaleFactorhorizontal,
  scaleFactorvertical,
}) {
  const canvasRef = React.useRef(null);

  function drawStrokeStartPoint(canvasContext, softCoordX, softCoordY) {
    canvasContext.beginPath();
    canvasContext.arc(softCoordX, softCoordY, 0.1, 0, 2 * Math.PI, true);
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.moveTo(softCoordX, softCoordY);
  }

  function isCanvasEmpty() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 3; i < imageData.length; i += 4) {
      if (imageData[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  function drawStrokePoint(canvasContext, softCoordX, softCoordY) {
    canvasContext.lineTo(softCoordX, softCoordY);
    canvasContext.stroke();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (liveImageData !== null) {
      const x = liveImageData.x;
      const y = liveImageData.y;
      const p = liveImageData.p;
      const scaleFactorX = scaleFactorhorizontal;
      const scaleFactorY = scaleFactorvertical;
      ctx.fillStyle = "#fff";
      ctx.lineWidth = 1.5;

      ctx.strokeStyle = "#FF0000";
      if (p === 0) {
        drawStrokeStartPoint(ctx, x * 0.25, y * 0.25);
      } else {
        drawStrokePoint(ctx, x * 0.25, y * 0.25);
      }
    }
  }, [liveImageData]);

  useEffect(() => {
    if (clearCanvas) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [clearCanvas]);

  const handleRetry = async () => {
    await STPadServerLibDefault.retrySignature();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleConfirm = async () => {
    if (isCanvasEmpty()) {
      Notification.showErrorMessage("Info", "Please draw a signature");
    } else {
      try {
        var awaitConfirmSignature = await STPadServerLibDefault.confirmSignature();

        var params = new STPadServerLibDefault.Params.getSignatureImage();
        var params2 = new STPadServerLibDefault.Params.closePad(0);
        params.setFileType(STPadServerLibDefault.FileType.PNG);
        params.setPenWidth(5);
        var awaitgetSignatureImage = await STPadServerLibDefault.getSignatureImage(params);

        const base64 = awaitgetSignatureImage.file;
        sendDatatoMain(base64);

        await STPadServerLibDefault.closePad(params2);
        await STPadServerLibCommons.destroyConnection();
      } catch (error) {
        console.error(error);
      }
      setOpenModal(false);
    }
  };

  const handleCancel = async () => {
    setOpenModal(false);
    try {
      await STPadServerLibDefault.cancelSignature();
      var params2 = new STPadServerLibDefault.Params.closePad(0);
      await STPadServerLibDefault.closePad(params2);
      await STPadServerLibCommons.destroyConnection();
    } catch (error) {
      console.error(error);
    }
  };

  if (!open) return null;

  return (
    <div className="modalBackground">
      <div className="modalContainer">
        <div className="titleCloseBtn">
          <button type="button" onClick={handleCancel}>
            X
          </button>
        </div>
        <div className="title">
          <h1>Please sign on the pad</h1>
        </div>
        <div className="body">
          <canvas ref={canvasRef} width={300} height={200} />
        </div>
        <div className="footer">
          <button onClick={handleCancel} type="button" id="cancelBtn">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm}>
            Confirm
          </button>
          <button type="button" onClick={handleRetry}>
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

export default CanvasModal;
