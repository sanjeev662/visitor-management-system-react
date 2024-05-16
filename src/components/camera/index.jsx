import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import Notification from '../notification';
import Webcam from 'react-webcam';

const CameraModal = ({ open, onClose, onCaptured }) => {
    const webcamRef = useRef(null);
    const [image, setImage] = useState(null);
    const [hasCameraError, setHasCameraError] = useState(false);

    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
    };

    const confirm = () => {
        if (image) {
            const base64Data = image.replace(/^data:image\/(?:png|jpg|jpeg);base64,/, '');
            onCaptured(base64Data);
            resetState();
        }
    };

    const resetState = () => {
        setImage(null);
        onClose();
    };

    const handleCameraError = (error) => {
        console.error('Webcam error:', error);
        setHasCameraError(true);

        Notification.showErrorMessage("Info", 'Unable to access the webcam.');
        resetState();
    };

    const videoConstraints = {
        width: 200,
        height: 200,
        facingMode: "user"
    };

    if (!open) return null;

    return (
        <Dialog open={open} onClose={resetState} maxWidth="sm">
            <DialogTitle style={{ paddingBottom: 0, textAlign: 'center', fontWeight: 'bold' }}>
                Capture Image
            </DialogTitle>
            <div className="p-3">
                <div className='p-2'>
                    {image ? (
                        <img src={image} alt="Captured" className="w-full max-w-xs max-h-xs m-auto" />
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full max-w-xs max-h-xs m-auto"
                            onUserMediaError={handleCameraError}
                        />
                    )}
                </div>
                <div className="flex justify-between mt-4 space-x-3">
                    {!image && (
                        <button className="flex items-center bg-customGreen hover:bg-green-700 text-white py-1 px-4 rounded-3xl" onClick={capture}>
                            Capture
                        </button>
                    )}
                    {image && (
                        <button className="flex items-center bg-gray-500 hover:bg-gray-700 text-white py-1 px-4 rounded-3xl" onClick={() => setImage(null)}>
                            Retake
                        </button>
                    )}
                    {image && (
                        <button className="flex items-center bg-green-500 hover:bg-green-700 text-white py-1 px-4 rounded-3xl" onClick={confirm} disabled={!image}>
                            Confirm
                        </button>
                    )}
                    <button className="flex items-center bg-red-500 hover:bg-red-700 text-white px-4 rounded-3xl" onClick={resetState}>
                        Close
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default CameraModal;
