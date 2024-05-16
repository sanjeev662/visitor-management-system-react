import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle } from "@mui/material";
import Notification from "../../components/notification";
import { url } from "../../utils/Constants";
import CameraModal from "../../components/camera";

const steps = ["Personal Details", "Work Information", "Additional Details"];

const UpdateUser = ({ open, onClose, user, fetchData }) => {
  const initialValues = {
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    user_type: "",
    blood_group: "",
    department: "",
    work_location: "",
    image: "",
    signature: "",
  };

  const [activeStep, setActiveStep] = useState(0);
  const [userData, setUserData] = useState({});
  const [errors, setErrors] = useState({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [imageData, setImageData] = useState('');
  const [signatureData, setSignatureData] = useState('');

  useEffect(() => {
    setImageData(user.image);
    setSignatureData(user.signature);
    setUserData(user);
  }, [open]);

  const validate = () => {
    const newErrors = {};
    switch (activeStep) {
      case 0:
        if (!userData.first_name.trim())
          newErrors.first_name = "First name is required";
        if (!userData.last_name.trim())
          newErrors.last_name = "Last name is required";
        if (!userData.phone || !userData.phone.trim()) {
          newErrors.phone = "Phone number is required";
        } else {
          const cleanPhone = userData.phone.trim().replace(/\D/g, "");
          if (cleanPhone.length !== 10) {
            newErrors.phone = "Phone number should be 10 digits";
          } else if (!/^\d{10}$/.test(cleanPhone)) {
            newErrors.phone = "Phone number should be numeric";
          }
        }
        if (!userData.address.trim()) newErrors.address = "Address is required";
        break;
      case 1:
        if (!userData.user_type.trim())
          newErrors.user_type = "User type is required";
        if (!userData.department.trim())
          newErrors.department = "Department is required";
        if (!userData.work_location.trim())
          newErrors.work_location = "Work location is required";
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      if (activeStep < steps.length - 1) {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else {
        handleSave();
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
    setErrors({ ...errors, [name]: null });
  };

  const handleSave = async () => {
    if (!validate()) return;

    const fieldsToSend = [
      "first_name",
      "last_name",
      "phone",
      "address",
      "user_type",
      "blood_group",
      "department",
      "work_location",
      "image",
      "signature",
    ];

    // Construct the payload by filtering out only the necessary fields
    const payload = Object.keys(userData)
      .filter((key) => fieldsToSend.includes(key))
      .reduce((obj, key) => {
        obj[key] = userData[key];
        return obj;
      }, {});

    try {
      payload.image = imageData;
      payload.signature = signatureData;
      const response = await fetch(
        `${url}/accounts/update-user/${userData.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        Notification.showSuccessMessage("Success", "User Updated Successfully");
        fetchData();
        setUserData(initialValues);
        handleClose();
      } else {
        const json = await response.json();
        Notification.showErrorMessage("Error", json.error);
      }
    } catch (error) {
      Notification.showErrorMessage("Error", "Server error");
    }
  };

  const handleImageCapture = (base64Image) => {
    console.log(base64Image);
    setImageData(base64Image);
    setImageModalOpen(false);
  };

  const handleSignatureCapture = (base64Image) => {
    setSignatureData(base64Image);
    setSignatureModalOpen(false);
  };

  const handleClose = () => {
    onClose();
    setActiveStep(0);
    setErrors({});
    setSignatureData("");
    setImageData("");
    setUserData(initialValues);
  };

  const stepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="first_name"
              className="text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              className={`border-2 p-3 rounded-lg ${errors.first_name ? "border-red-500" : "border-gray-300"
                }`}
              id="first_name"
              name="first_name"
              placeholder="First Name"
              value={userData.first_name}
              onChange={handleInputChange}
            />
            {errors.first_name && (
              <div className="text-red-500 text-xs">{errors.first_name}</div>
            )}

            <label
              htmlFor="last_name"
              className="text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              className={`border-2 p-3 rounded-lg ${errors.last_name ? "border-red-500" : "border-gray-300"
                }`}
              id="last_name"
              name="last_name"
              placeholder="Last Name"
              value={userData.last_name}
              onChange={handleInputChange}
            />
            {errors.last_name && (
              <div className="text-red-500 text-xs">{errors.last_name}</div>
            )}

            <label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              className={`border-2 p-3 rounded-lg ${errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              id="phone"
              name="phone"
              placeholder="Phone"
              value={userData.phone}
              onChange={handleInputChange}
            />
            {errors.phone && (
              <div className="text-red-500 text-xs">{errors.phone}</div>
            )}

            <label
              htmlFor="address"
              className="text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              className={`border-2 p-3 rounded-lg ${errors.address ? "border-red-500" : "border-gray-300"
                }`}
              id="address"
              name="address"
              placeholder="Address"
              value={userData.address}
              onChange={handleInputChange}
            />
            {errors.address && (
              <div className="text-red-500 text-xs">{errors.address}</div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="user_type"
              className="text-sm font-medium text-gray-700"
            >
              User Type
            </label>
            <select
              className={`border-2 p-3 rounded-lg ${errors.user_type ? "border-red-500" : "border-gray-300"
                }`}
              id="user_type"
              name="user_type"
              value={userData.user_type}
              onChange={handleInputChange}
            >
              <option value="">Select User Type</option>
              <option value="Admin">Admin</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Guard">Guard</option>
            </select>
            {errors.user_type && (
              <div className="text-red-500 text-xs">{errors.user_type}</div>
            )}

            <label
              htmlFor="blood_group"
              className="text-sm font-medium text-gray-700"
            >
              Blood Group
            </label>
            <select
              className={`border-2 p-3 rounded-lg ${errors.blood_group ? "border-red-500" : "border-gray-300"
                }`}
              id="blood_group"
              name="blood_group"
              value={userData.blood_group}
              onChange={handleInputChange}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>

            <label
              htmlFor="department"
              className="text-sm font-medium text-gray-700"
            >
              Department
            </label>
            <select
              className={`border-2 p-3 rounded-lg ${errors.department ? "border-red-500" : "border-gray-300"
                }`}
              id="department"
              name="department"
              value={userData.department}
              onChange={handleInputChange}
            >
              <option value="">Select Department</option>
              <option value="hr">Human Resources</option>
              <option value="it">Information Technology</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
            </select>
            {errors.department && (
              <div className="text-red-500 text-xs">{errors.department}</div>
            )}

            <label
              htmlFor="work_location"
              className="text-sm font-medium text-gray-700"
            >
              Work Location
            </label>
            <select
              className={`border-2 p-3 rounded-lg ${errors.work_location ? "border-red-500" : "border-gray-300"
                }`}
              id="work_location"
              name="work_location"
              value={userData.work_location}
              onChange={handleInputChange}
            >
              <option value="">Select Work Location</option>
              <option value="new_york">New York</option>
              <option value="san_francisco">San Francisco</option>
              <option value="chicago">Chicago</option>
              <option value="austin">Austin</option>
            </select>
            {errors.work_location && (
              <div className="text-red-500 text-xs">{errors.work_location}</div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="flex flex-row space-x-4 p-4">
            <div className="space-y-4 flex flex-col items-center">
              <label htmlFor="image" className="text-sm font-semibold text-gray-700">Image</label>
              <div className="border-2 border-gray-300 rounded-lg p-3 flex items-center justify-center relative" style={{ width: '200px', height: '200px' }}>
                {imageData ? (
                  <img src={`data:image/jpeg;base64,${imageData}`} alt="Captured Image" className="max-h-full max-w-full rounded" />
                ) : (
                  <span className="text-gray-500">No image captured</span>
                )}
              </div>
              <button className="flex items-center bg-customGreen hover:bg-green-700 text-white py-1 px-4 rounded-3xl" onClick={() => setImageModalOpen(true)}>
                Capture Image
              </button>
              <CameraModal open={imageModalOpen} onClose={() => setImageModalOpen(false)} onCaptured={handleImageCapture} />
            </div>

            <div className="space-y-4 flex flex-col items-center">
              <label htmlFor="signature" className="text-sm font-semibold text-gray-700">Signature</label>
              <div className="border-2 border-gray-300 rounded-lg p-3 flex items-center justify-center relative" style={{ width: '200px', height: '200px' }}>
                {signatureData ? (
                  <img src={`data:image/jpeg;base64,${signatureData}`} alt="Captured Signature" className="max-h-full max-w-full rounded" />
                ) : (
                  <span className="text-gray-500">No signature captured</span>
                )}
              </div>
              <button className="flex items-center bg-customGreen hover:bg-green-700 text-white py-1 px-4 rounded-3xl" onClick={() => setSignatureModalOpen(true)}>
                Capture Signature
              </button>
              <CameraModal open={signatureModalOpen} onClose={() => setSignatureModalOpen(false)} onCaptured={handleSignatureCapture} />
            </div>
          </div>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: "w-1/2 mx-auto my-8 p-8 overflow-hidden" }}
    >
      <div className="bg-white p-5">
        <DialogTitle
          as="h2"
          className="text-lg font-bold leading-6 text-gray-900 text-center"
        >
          Update User
        </DialogTitle>
        <div className="flex items-center justify-between p-3">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`flex-1 ${index <= activeStep ? "bg-green-500" : "bg-gray-200"
                } h-2 mx-2 rounded-full transition duration-500 ease-in-out`}
            ></div>
          ))}
        </div>
        <div className="px-4 py-5 sm:p-6">
          {stepContent(activeStep)}
          <div className="flex justify-between mt-8">
            <button
              className={`py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${activeStep === 0 ? "bg-gray-300" : "bg-red-500 hover:bg-red-700"
                }`}
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </button>
            {activeStep === steps.length - 1 ? (
              <button
                className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700"
                onClick={handleSave}
              >
                Save
              </button>
            ) : (
              <button
                className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-700"
                onClick={handleNext}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default UpdateUser;
