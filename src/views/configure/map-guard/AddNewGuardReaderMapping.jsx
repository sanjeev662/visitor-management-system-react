import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import { url } from "../../../utils/Constants.jsx";
import Notification from "../../../components/notification";

const AddNewGuardReaderMapping = ({ open, onClose, fetchData }) => {
    const initialValues = {
        user_id: '',
        reader_id: ''
    };

    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [progress, setProgress] = useState(0);
    const [userList, setUserList] = useState([]);
    const [readerList, setReaderList] = useState([]);

    const getUserList = async () => {
        try {
            const response = await fetch(`${url}/accounts/get-all-user/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const json = await response.json();
            if (response.ok) {
                setUserList(json);
            } else {
                Notification.showErrorMessage("Try Again!", json.error);
            }
        } catch (err) {
            Notification.showErrorMessage("Error", "Server error!");
        }
    };

    const getReaderList = async () => {
        try {
            const response = await fetch(`${url}/gadgets/register-reader/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const json = await response.json();
            if (response.ok) {
                setReaderList(json);
            } else {
                Notification.showErrorMessage("Try Again!", json.error);
            }
        } catch (err) {
            Notification.showErrorMessage("Error", "Server error!");
        }
    };

    useEffect(() => {
        getUserList();
        getReaderList();
    }, []);

    useEffect(() => {
        const filledFields = Object.values(formData).filter(value => value.trim() !== '').length;
        setProgress((filledFields / 2) * 100);
    }, [formData]);

    const validate = () => {
        const newErrors = {};
        if (!formData.user_id) {
            newErrors.user_id = 'User is required';
        }
        if (!formData.reader_id) {
            newErrors.reader_id = 'Reader is required';
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
            const response = await fetch(`${url}/guard-reader-mappings/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                Notification.showSuccessMessage("Success", "Mapping added successfully");
                setFormData(initialValues);
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

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <div className="bg-white p-5">
                <DialogTitle as="h2" className="text-lg font-bold leading-6 text-gray-900 text-center">
                    Add New Guard Reader Mapping
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
                        <label htmlFor="user_id" className="text-sm font-medium text-gray-700">User</label>
                        <select
                            className={`border-2 p-3 rounded-lg ${errors.user_id ? 'border-red-500' : 'border-gray-300'}`}
                            id="user_id"
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleInputChange}
                        >
                            <option value="">Select user</option>
                            {userList.map((user, index) => (
                                <option key={index} value={user.id}>{user.username}</option>
                            ))}
                        </select>
                        {errors.user_id && <div className="text-red-500 text-xs">{errors.user_id}</div>}

                        <label htmlFor="reader_id" className="text-sm font-medium text-gray-700">Reader</label>
                        <select
                            className={`border-2 p-3 rounded-lg ${errors.reader_id ? 'border-red-500' : 'border-gray-300'}`}
                            id="reader_id"
                            name="reader_id"
                            value={formData.reader_id}
                            onChange={handleInputChange}
                        >
                            <option value="">Select reader</option>
                            {readerList.map((reader, index) => (
                                <option key={index} value={reader.id}>{reader.name}</option>
                            ))}
                        </select>
                        {errors.reader_id && <div className="text-red-500 text-xs">{errors.reader_id}</div>}
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

export default AddNewGuardReaderMapping;
