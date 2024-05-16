import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import { url } from "../../../utils/Constants.jsx";
import Notification from "../../../components/notification";

const UpdateAdam = ({ open, onClose, fetchData, adamData }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setFormData(adamData);
    }, [adamData]);

    useEffect(() => {
        const filledFields = Object.values(formData).filter(value => String(value).trim() !== '').length;
        setProgress((filledFields / 5) * 100);
    }, [formData]);

    const validate = () => {
        const newErrors = {};

        if (!String(formData.ip).trim()) { newErrors.ip = 'IP address is required'; }
        else if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(formData.ip.trim())) { newErrors.ip = 'Invalid IP address'; }

        if (!String(formData.port).trim()) { newErrors.port = 'Port number is required'; }
        else if (!/^\d{3}$/.test(String(formData.port).trim())) { newErrors.port = 'Port must be exactly three digits'; }

        if (!String(formData.address).trim()) { newErrors.address = 'Address is required'; }
        if (!String(formData.name).trim()) { newErrors.name = 'Name is required'; }

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
            const response = await fetch(`${url}/gadgets/update-adam/${adamData.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                Notification.showSuccessMessage("Success", "Adam updated successfully");
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
                    Update Adam Detail
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
                        <label htmlFor="ip" className="text-sm font-medium text-gray-700">IP Address</label>
                        <input
                            type="text"
                            className={`border-2 p-3 rounded-lg ${errors.ip ? 'border-red-500' : 'border-gray-300'}`}
                            id="ip"
                            name="ip"
                            placeholder="Eg. 192.168.1.1"
                            value={formData.ip}
                            onChange={handleInputChange}
                        />
                        {errors.ip && <div className="text-red-500 text-xs">{errors.ip}</div>}

                        <label htmlFor="port" className="text-sm font-medium text-gray-700">Port</label>
                        <input
                            type="text"
                            className={`border-2 p-3 rounded-lg ${errors.port ? 'border-red-500' : 'border-gray-300'}`}
                            id="port"
                            name="port"
                            placeholder="Eg. 123"
                            value={formData.port}
                            onChange={handleInputChange}
                        />
                        {errors.port && <div className="text-red-500 text-xs">{errors.port}</div>}

                        <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
                        <select
                            className={`border-2 p-3 rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Address</option>
                            {[16, 17, 18, 19, 20, 21, 22].map(addr => (
                                <option key={addr} value={addr}>{addr}</option>
                            ))}
                        </select>
                        {errors.address && <div className="text-red-500 text-xs">{errors.address}</div>}

                        <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            className={`border-2 p-3 rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            id="name"
                            name="name"
                            placeholder="Eg. Gate-01 Entry"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                        {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
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

export default UpdateAdam;
