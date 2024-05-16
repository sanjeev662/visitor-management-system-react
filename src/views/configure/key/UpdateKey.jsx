import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import { url } from "../../../utils/Constants.jsx";
import Notification from "../../../components/notification";

const UpdateKey = ({ open, onClose, fetchData, keyData }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setFormData(keyData);
    }, [keyData]);

    useEffect(() => {
        const filledFields = Object.values(formData).filter(value => value !== null && value.toString().trim() !== '').length;
        setProgress((filledFields / 1) * 100);
    }, [formData]);

    const validate = () => {
        const newErrors = {};
        if (!formData.RFID_key || !formData.RFID_key.trim()) {
            newErrors.RFID_key = 'RFID key is required';
        }
        if (!formData.blacklisted.trim()) { newErrors.blacklisted = 'Blacklisted status is required'; }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: null });
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            const response = await fetch(`${url}/key/key-info/${keyData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                Notification.showSuccessMessage("Success", "Key updated successfully");
                fetchData();
                onClose();
            } else {
                const json = await response.json();
                Notification.showErrorMessage("Error", json.error);
            }
        } catch (error) {
            Notification.showErrorMessage("Error", "Server error");
        }
    };

    const handleClose = () => {
        onClose();
        setErrors({});
        setFormData({});
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <div className="bg-white p-5">
                <DialogTitle as="h2" className="text-lg font-bold leading-6 text-gray-900 text-center">
                    Update Key Details
                </DialogTitle>
                <div className='px-5'>
                    <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                            className="bg-green-500 h-full"
                            style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
                        ></div>
                    </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="RFID_key" className="text-sm font-medium text-gray-700">RFID Key</label>
                        <input
                            type="text"
                            className={`border-2 p-3 rounded-lg ${errors.RFID_key ? 'border-red-500' : 'border-gray-300'}`}
                            id="RFID_key"
                            name="RFID_key"
                            placeholder="Enter RFID Key"
                            value={formData.RFID_key}
                            onChange={handleInputChange}
                        />
                        {errors.RFID_key && <div className="text-red-500 text-xs">{errors.RFID_key}</div>}

                        <label htmlFor="blacklisted" className="text-sm font-medium text-gray-700">Blacklisted</label>
                        <select
                            className={`border-2 p-3 rounded-lg ${errors.blacklisted ? 'border-red-500' : 'border-gray-300'}`}
                            id="blacklisted"
                            name="blacklisted"
                            value={formData.blacklisted}
                            onChange={handleInputChange}
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                        {errors.blacklisted && <div className="text-red-500 text-xs">{errors.blacklisted}</div>}
                    </div>
                    <div className="flex justify-end mt-8">
                        <button
                            className="py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-customGreen hover:bg-green-500"
                            onClick={handleSubmit}
                        >
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default UpdateKey;
