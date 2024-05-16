import React, { useState, useEffect } from 'react';
import { Dialog, Paper, Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import BlockIcon from '@mui/icons-material/Block';
import LockResetIcon from '@mui/icons-material/LockReset';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ResetPassword from './ResetPassword';

const Profile = ({ open, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onActionClick = (action) => {
    if (action === "resetPassword") {
      setResetPasswordModalOpen(true);
      handleClose();
    }
  };

  useEffect(() => {
    const userDataJSON = localStorage.getItem('userInfo');
    setUserData(JSON.parse(userDataJSON));
  }, []);

  if (!userData) return <div>Loading...</div>;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={true}
      maxWidth="sm"
      PaperProps={{ className: "w-1/2 mx-auto" }}
    >
      <Paper className="p-6 bg-white rounded-lg shadow">
        <div className="text-center border-2 border-gray-300 p-10 rounded-lg shadow-sm">
          <div className="relative">
            <div className="absolute right-0 top-0 p-2">
              <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handleClick}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => onActionClick("resetPassword")}>
                  <ListItemIcon>
                    <LockResetIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Reset Password" />
                </MenuItem>
              </Menu>
            </div>
            <div className="flex justify-center mb-4 mt-2">
              <div className="inline-block h-24 w-24 border-2 border-gray-300 rounded-full overflow-hidden bg-customGreen">
                {userData.image ? (
                  <img src={`data:image/jpeg;base64,${userData.image}`} alt="User" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white bg-customGreen">
                    {userData.first_name ? userData.first_name.charAt(0).toUpperCase() : "N"}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-2 font-bold text-xl">
              {`${userData.first_name} ${userData.last_name}`}
            </div>
            <div className="divide-y divide-gray-300">
              <InfoItem icon={<PersonIcon color="primary" />} label="User Type" value={userData.user_type} />
              <InfoItem icon={<HomeIcon color="secondary" />} label="Address" value={userData.address} />
              <InfoItem icon={<PhoneIcon color="action" />} label="Phone" value={userData.phone} />
              <InfoItem icon={<EmailIcon color="error" />} label="Email" value={userData.email} />
              <InfoItem icon={<BadgeIcon color="info" />} label="Employee Code" value={userData.employee_code} />
              <InfoItem icon={<BloodtypeIcon color="warning" />} label="Blood Group" value={userData.blood_group} />
              <InfoItem icon={<BlockIcon color="error" />} label="Is Active" value={userData.is_active ? "Yes" : "No"} />
              <InfoItem icon={<VpnKeyIcon color="primary" />} label="Is Staff" value={userData.is_staff ? "Yes" : "No"} />
            </div>
          </div>
        </div>
        <ResetPassword
          open={resetPasswordModalOpen}
          onClose={() => setResetPasswordModalOpen(false)}
        />
      </Paper>
    </Dialog>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="py-2 flex items-center">
    {icon}
    <span className="ml-1 font-bold">{label}</span>
    <span className="ml-2">{value}</span>
  </div>
);

export default Profile;

