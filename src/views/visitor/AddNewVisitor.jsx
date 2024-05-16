import React, { useState } from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import Notification from "../../components/notification";
import { url } from "../../utils/Constants";
import CameraModal from "../../components/camera";
import SignatureCapture from "../../components/SignatureCapture/SignatureCapture";

const steps = ['Personal Details', 'Contact Information', 'Identification', 'Documents'];

const AddNewVisitor = ({ open, onClose, fetchData, onActionClick }) => {
  const initialValues = {
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    email: '',
    blood_group: '',
    visitor_type: '',
    gov_id_type: '',
    gov_id_no: '',
    signature: '',
    image: ''
  }

  const [activeStep, setActiveStep] = useState(0);
  const [visitorData, setVisitorData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [imageData, setImageData] = useState('');
  const [signatureData, setSignatureData] = useState('');

  const validate = () => {
    const newErrors = {};
    switch (activeStep) {
      case 0:
        if (!visitorData.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!visitorData.last_name.trim()) newErrors.last_name = 'Last name is required';
        if (!visitorData.phone || !visitorData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else {
          const cleanPhone = visitorData.phone.trim().replace(/\D/g, '');
          if (cleanPhone.length !== 10) {
            newErrors.phone = 'Phone number should be 10 digits';
          } else if (!/^\d{10}$/.test(cleanPhone)) {
            newErrors.phone = 'Phone number should be numeric';
          }
        }
        break;
      case 1:
        if (!visitorData.address.trim()) newErrors.address = 'Address is required';
        if (visitorData.email.trim()) {
          if (!/^[\w!#$%&'*+/=?^`{|}~-]+(?:\.[\w!#$%&'*+/=?^`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[a-zA-Z]{2,}$/.test(visitorData.email)) {
            newErrors.email = 'Invalid email format';
          }
        }

        break;
      case 2:
        if (!visitorData.visitor_type.trim()) newErrors.visitor_type = 'Visitor type is required';
        if (!visitorData.gov_id_type.trim()) newErrors.gov_id_type = 'Government ID type is required';
        if (!visitorData.gov_id_no.trim()) newErrors.gov_id_no = 'Government ID number is required';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      if (activeStep < steps.length - 1) {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
      } else {
        handleSave();
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prevActiveStep => prevActiveStep - 1);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVisitorData({ ...visitorData, [name]: value });
    setErrors({ ...errors, [name]: null });
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      visitorData.image = imageData;
      visitorData.signature = signatureData;
      const response = await fetch(`${url}/visitor/visitor-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(visitorData),
      });
      const json = await response.json();
      if (response.ok) {
        Notification.showSuccessMessage("Success", "Visitor Added Successfully");
        onActionClick('view', json);
        // setVisitorCreated(json);
        handleClose();
        fetchData();
      } else {
        const json = await response.json();
        Notification.showErrorMessage("Error", json.error);
      }
    } catch (error) {
      Notification.showErrorMessage("Error", "Server error");
    }
  };

  const handleImageCapture = (base64Image) => {
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
    setImageData("");
    setSignatureData("");
    setVisitorData(initialValues);
  }

  const stepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col space-y-2">
            <label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name</label>
            <input
              className={`border-2 p-3 rounded-lg ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
              id="first_name"
              name="first_name"
              placeholder="First Name"
              value={visitorData.first_name}
              onChange={handleInputChange}
            />
            {errors.first_name && <div className="text-red-500 text-xs">{errors.first_name}</div>}

            <label htmlFor="last_name" className="text-sm font-medium text-gray-700">Last Name</label>
            <input
              className={`border-2 p-3 rounded-lg ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
              id="last_name"
              name="last_name"
              placeholder="Last Name"
              value={visitorData.last_name}
              onChange={handleInputChange}
            />
            {errors.last_name && <div className="text-red-500 text-xs">{errors.last_name}</div>}

            <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</label>
            <input
              className={`border-2 p-3 rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              id="phone"
              name="phone"
              placeholder="Phone"
              value={visitorData.phone}
              onChange={handleInputChange}
            />
            {errors.phone && <div className="text-red-500 text-xs">{errors.phone}</div>}
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
            <input
              className={`border-2 p-3 rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
              id="address"
              name="address"
              placeholder="Address"
              value={visitorData.address}
              onChange={handleInputChange}
            />
            {errors.address && <div className="text-red-500 text-xs">{errors.address}</div>}

            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <input
              className={`border-2 p-3 rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              id="email"
              name="email"
              placeholder="Email"
              value={visitorData.email}
              onChange={handleInputChange}
            />
            {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}

            <label htmlFor="blood_group" className="text-sm font-medium text-gray-700">Blood Group</label>
            <select
              className={`border-2 p-3 rounded-lg ${errors.blood_group ? 'border-red-500' : 'border-gray-300'}`}
              id="blood_group"
              name="blood_group"
              value={visitorData.blood_group}
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
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col space-y-2">
            <label htmlFor="visitor_type" className="text-sm font-medium text-gray-700">Visitor Type</label>
            <select
              className={`border-2 p-3 rounded-lg ${errors.visitor_type ? 'border-red-500' : 'border-gray-300'}`}
              id="visitor_type"
              name="visitor_type"
              value={visitorData.visitor_type}
              onChange={handleInputChange}
            >
              <option value="">Select Visitor Type</option>
              <option value="civilian">civilian</option>
              <option value="serving-service">serving-service</option>
              <option value="foreigner">foreigner</option>
              <option value="ex-serviceman">ex-serviceman</option>
            </select>
            {errors.visitor_type && <div className="text-red-500 text-xs">{errors.visitor_type}</div>}

            <label htmlFor="gov_id_type" className="text-sm font-medium text-gray-700">Government ID Type</label>
            <select
              className={`border-2 p-3 rounded-lg ${errors.gov_id_type ? 'border-red-500' : 'border-gray-300'}`}
              id="gov_id_type"
              name="gov_id_type"
              value={visitorData.gov_id_type}
              onChange={handleInputChange}
            >
              <option value="">Select ID Type</option>
              <option value="aadhar_card">Aadhar Card</option>
              <option value="passport">Passport</option>
              <option value="driver_license">Driver's License</option>
              <option value="national_id">National Id</option>
              <option value="other">Other</option>
            </select>
            {errors.gov_id_type && <div className="text-red-500 text-xs">{errors.gov_id_type}</div>}

            <label htmlFor="gov_id_no" className="text-sm font-medium text-gray-700">Government ID Number</label>
            <input
              className={`border-2 p-3 rounded-lg ${errors.gov_id_no ? 'border-red-500' : 'border-gray-300'}`}
              id="gov_id_no"
              name="gov_id_no"
              placeholder="Government ID Number"
              value={visitorData.gov_id_no}
              onChange={handleInputChange}
            />
            {errors.gov_id_no && <div className="text-red-500 text-xs">{errors.gov_id_no}</div>}
          </div>
        );
      case 3:
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
              {/* <button className="flex items-center bg-customGreen hover:bg-green-700 text-white py-1 px-4 rounded-3xl" onClick={() => setSignatureModalOpen(true)}>
                Capture Signature
              </button>
              <CameraModal open={signatureModalOpen} onClose={() => setSignatureModalOpen(false)} onCaptured={handleSignatureCapture} /> */}
              <SignatureCapture onCapture={handleSignatureCapture} />
            </div>
          </div>

        );
      default:
        return 'Unknown step';
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
        <DialogTitle as="h2" className="text-lg font-bold leading-6 text-gray-900 text-center">
          Add New Visitor
        </DialogTitle>
        <div className="flex items-center justify-between p-3">
          {steps.map((label, index) => (
            <div key={label} className={`flex-1 ${index <= activeStep ? 'bg-green-500' : 'bg-gray-200'} h-2 mx-2 rounded-full transition duration-500 ease-in-out`}></div>
          ))}
        </div>
        <div className="px-4 py-5 sm:p-6">
          {stepContent(activeStep)}
          <div className="flex justify-between mt-8">
            <button
              className={`py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${activeStep === 0 ? 'bg-gray-300' : 'bg-red-500 hover:bg-red-700'}`}
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

export default AddNewVisitor;

