import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import { url } from "../../../utils/Constants.jsx";
import Notification from "../../../components/notification";

const AddNewReader = ({ open, onClose, fetchData }) => {
    const initialValues = {
        name: '',
        reader_type: '',
        com_port: '',
        adam: '',
        zone: '',
        moxa_ip: ''
    };

    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [progress, setProgress] = useState(0);
    const [adamList, setAdamList] = useState([{}]);
    const [zoneList, setZoneList] = useState([{}]);

    const getAdamList = async () => {
        try {
            const response = await fetch(`${url}/gadgets/get-adam/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const json = await response.json();
            if (response.ok) {
                const adamDetails = json.map(adam => ({
                    id: adam.id,
                    ip: adam.ip,
                    name: adam.name
                }));
                setAdamList(adamDetails);
            } else {
                Notification.showErrorMessage("Try Again!", json.error);
            }
        } catch (err) {
            Notification.showErrorMessage("Error", "Server error!");
        }
    };
    const getZoneList = async () => {
        try {
            const response = await fetch(`${url}/zone/zone-info`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const json = await response.json();
            if (response.ok) {
                const zoneDetails = json.map(zone => ({
                    id: zone.id,
                    zoneName: zone.zone_name
                }));
                setZoneList(zoneDetails);
            } else {
                Notification.showErrorMessage("Try Again!", json.error);
            }
        } catch (err) {
            Notification.showErrorMessage("Error", "Server error!");
        }
    }

    useEffect(() => {
        getAdamList();
        getZoneList();
    }, []);

    useEffect(() => {
        const filledFields = Object.values(formData).filter(value => value.trim() !== '').length;
        setProgress((filledFields / 6) * 100);
    }, [formData]);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!["entry", "exit", "tracking"].includes(formData.reader_type)) {
            newErrors.reader_type = 'Reader type is required and must be valid';
        }
        if (!formData.com_port.match(/^[A-Z]+\d{1,4}$/) || formData.com_port.length < 4) {
            newErrors.com_port = 'COM port must be in the format XXXXXX (e.g., COM112)';
        }
        if (!formData.adam) {
            newErrors.adam = 'ADAM module is required';
        }
        if (!formData.zone) {
            newErrors.zone = 'Zone is required';
        }
        if (!formData.moxa_ip.match(/^\d{1,3}(\.\d{1,3}){3}$/)) {
            newErrors.moxa_ip = 'Invalid IP address format';
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
            const response = await fetch(`${url}/gadgets/register-reader/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                Notification.showSuccessMessage("Success", "Reader added successfully");
                setFormData(initialValues);
                fetchData();
                onClose();
            } else {
                const json = await response.json();
                console.log(json);
                Notification.showErrorMessage("Error", json.error);
            }
        } catch (error) {
            Notification.showErrorMessage("Error", "Server error");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <div className="bg-white p-5">
                <DialogTitle as="h2" className="text-lg font-bold leading-6 text-gray-900 text-center">
                    Add New Reader
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
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">Reader Name</label>
                        <input
                            type="text"
                            className={`border-2 p-3 rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            id="name"
                            name="name"
                            placeholder="Enter reader name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                        {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}

                        <label htmlFor="reader_type" className="text-sm font-medium text-gray-700">Reader Type</label>
                        <select
                            className={`border-2 p-3 rounded-lg ${errors.reader_type ? 'border-red-500' : 'border-gray-300'}`}
                            id="reader_type"
                            name="reader_type"
                            value={formData.reader_type}
                            onChange={handleInputChange}
                        >
                            <option value="">Select reader type</option>
                            <option value="entry">Entry</option>
                            <option value="exit">Exit</option>
                            <option value="tracking">Tracking</option>
                        </select>
                        {errors.reader_type && <div className="text-red-500 text-xs">{errors.reader_type}</div>}

                        <label htmlFor="com_port" className="text-sm font-medium text-gray-700">COM Port</label>
                        <input
                            type="text"
                            className={`border-2 p-3 rounded-lg ${errors.com_port ? 'border-red-500' : 'border-gray-300'}`}
                            id="com_port"
                            name="com_port"
                            placeholder="Enter COM port (e.g., COM112)"
                            value={(formData.com_port).toUpperCase()}
                            onChange={handleInputChange}
                        />
                        {errors.com_port && <div className="text-red-500 text-xs">{errors.com_port}</div>}

                        <label htmlFor="moxa_ip" className="text-sm font-medium text-gray-700">Moxa IP</label>
                        <input
                            type="text"
                            className={`border-2 p-3 rounded-lg ${errors.moxa_ip ? 'border-red-500' : 'border-gray-300'}`}
                            id="moxa_ip"
                            name="moxa_ip"
                            placeholder="192.168.1.1"
                            value={formData.moxa_ip}
                            onChange={handleInputChange}
                        />
                        {errors.moxa_ip && <div className="text-red-500 text-xs">{errors.moxa_ip}</div>}

                        <label htmlFor="adam" className="text-sm font-medium text-gray-700">ADAM Module</label>
                        <select
                            className={`border-2 p-3 rounded-lg ${errors.adam ? 'border-red-500' : 'border-gray-300'}`}
                            id="adam"
                            name="adam"
                            value={formData.adam}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Adam</option>
                            {adamList.map((adam, index) => (
                                <option value={adam.id}>{adam.name} ( {adam.ip} ) </option>
                            ))}
                        </select>
                        {errors.adam && <div className="text-red-500 text-xs">{errors.adam}</div>}

                        <label htmlFor="zone" className="text-sm font-medium text-gray-700">Zone</label>
                        <select
                            className={`border-2 p-3 rounded-lg ${errors.zone ? 'border-red-500' : 'border-gray-300'}`}
                            id="zone"
                            name="zone"
                            value={formData.zone}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Zone</option>
                            {zoneList.map((zone, index) => (
                                <option key={index} value={zone.id}>
                                    {zone.zoneName}
                                </option>
                            ))}
                            {/* {adamList.map((adam, index) => (
                                <option key={index} value={adam.id}>{adam.name}</option>
                            ))} */}
                        </select>
                        {errors.zone && <div className="text-red-500 text-xs">{errors.zone}</div>}
                    </div>
                    <div className="flex justify-end mt-8">
                        <button
                            className="py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-customGreen hover:bg-green-500"
                            onClick={handleSubmit}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default AddNewReader;
