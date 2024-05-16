import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle } from '@mui/material';
import Notification from "../../components/notification";
import { url } from "../../utils/Constants";

const ResetPasswordUser = ({ open, onClose, user }) => {
  const navigate = useNavigate();

  const initialValues = {
    newPassword: '',
    confirmPassword: ''
  };

  const [passwords, setPasswords] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const filledFields = Object.values(passwords).filter(value => value.trim() !== '').length;
    setProgress((filledFields / 2) * 100);
  }, [passwords]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
    setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!passwords.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords must match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const response = await fetch(`${url}/accounts/reset-password-by-admin/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: passwords.confirmPassword })
      });

      if (response.ok) {
        Notification.showSuccessMessage('Success', 'User Password Updated Successfully');
        navigate('/user');
      } else {
        const json = await response.json();
        Notification.showErrorMessage('Try Again!', json.error);
      }
    } catch (error) {
      Notification.showErrorMessage('Error', 'Server error!');
    } finally {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: "w-1/2 mx-auto my-6 p-6 overflow-hidden" }}
    >
      <div className="bg-white p-5">
        <DialogTitle as="h2" className="text-lg font-bold leading-6 text-gray-900 text-center">
          Reset Password
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
            <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Enter new password"
              value={passwords.newPassword}
              onChange={handleInputChange}
              className={`border-2 p-3 rounded-lg ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.newPassword && <div className="text-red-500 text-xs">{errors.newPassword}</div>}

            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={passwords.confirmPassword}
              onChange={handleInputChange}
              className={`border-2 p-3 rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.confirmPassword && <div className="text-red-500 text-xs">{errors.confirmPassword}</div>}
          </div>
          <div className="flex justify-end mt-8">
            <button
              className="py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-700"
              onClick={handleSubmit}
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ResetPasswordUser;
