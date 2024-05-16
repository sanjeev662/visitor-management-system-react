import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import { url } from "../../../utils/Constants.jsx";
import Notification from "../../../components/notification";

const UpdateZone = ({ open, onClose, fetchData, zoneData }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setFormData(zoneData);
    }, [zoneData]);

    useEffect(() => {
        const filledFields = Object.values(formData).filter(value => value !== null && value.toString().trim() !== '').length;
        setProgress((filledFields / 2) * 100);
    }, [formData]);

    const validate = () => {
        const newErrors = {};
        if (!formData.zone_name.trim()) {
            newErrors.zone_name = 'Zone name is required';
        }
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
            const response = await fetch(`${url}/zone/zone-info/${zoneData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                Notification.showSuccessMessage("Success", "Zone updated successfully");
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
                    Update Zone Details
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
                        <label htmlFor="zone_name" className="text-sm font-medium text-gray-700">Zone Name</label>
                        <input
                            type="text"
                            className={`border-2 p-3 rounded-lg ${errors.zone_name ? 'border-red-500' : 'border-gray-300'}`}
                            id="zone_name"
                            name="zone_name"
                            placeholder="E.g., Zone A"
                            value={formData.zone_name}
                            onChange={handleInputChange}
                        />
                        {errors.zone_name && <div className="text-red-500 text-xs">{errors.zone_name}</div>}

                        <label htmlFor="allow_re_entry" className="text-sm font-medium text-gray-700">Allow Re-Entry</label>
                        <select
                            className={`border-2 p-3 rounded-lg ${errors.allow_re_entry ? 'border-red-500' : 'border-gray-300'}`}
                            id="allow_re_entry"
                            name="allow_re_entry"
                            value={formData.allow_re_entry}
                            onChange={handleInputChange}
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>

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

export default UpdateZone
