import React, { useState } from "react";
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BadgeIcon from '@mui/icons-material/Badge';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import BlockIcon from '@mui/icons-material/Block';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const VisitorProfile = ({ open, onClose, visitor, onActionClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentSelectedVisitor, setCurrentSelectedVisitor] = useState(visitor);

  const handleClick = (event, visitor) => {
    setAnchorEl(event.currentTarget);
    setCurrentSelectedVisitor(visitor);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="sm" PaperProps={{ className: "w-1/2 mx-auto" }}>
      <Paper className="p-6 bg-white rounded-lg shadow">
        <div className="text-center border-2 border-gray-300 p-10 rounded-lg shadow-sm">
          <div className="relative">
            <div className="absolute right-0 top-0 p-2">
              <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={(event) => handleClick(event, visitor)}
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
                <MenuItem onClick={() => { onActionClick('update', currentSelectedVisitor); handleClose(); }}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Update" />
                </MenuItem>
                <MenuItem onClick={() => { onActionClick('pass', currentSelectedVisitor); handleClose(); }}>
                  <ListItemIcon>
                    <CreditCardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Generate Pass" />
                </MenuItem>
              </Menu>
            </div>
            <div className="flex justify-center mb-4 mt-2">
              <div className="inline-block h-24 w-24 border-2 border-gray-300 rounded-full overflow-hidden bg-gray-200">
                {visitor.image ? (
                  <img src={`data:image/jpeg;base64,${visitor.image}`} alt="User" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white font-bold bg-customGreen">
                    {visitor.first_name ? visitor.first_name.charAt(0) : 'N'}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className=" p-1 rounded-lg shadow-sm">
            <div className="mb-2 font-bold text-xl">
              {`${visitor.first_name} ${visitor.last_name}`}
            </div>
            <div className="divide-y divide-gray-300">
              <InfoItem icon={<PersonIcon color="primary" />} label="Visitor Type" value={visitor.visitor_type} />
              <InfoItem icon={<HomeIcon color="secondary" />} label="Address" value={visitor.address} />
              <InfoItem icon={<PhoneIcon color="action" />} label="Phone" value={visitor.phone} />
              <InfoItem icon={<EmailIcon color="error" />} label="Email" value={visitor.email} />
              <InfoItem icon={<BadgeIcon color="info" />} label="Gov ID Type" value={visitor.gov_id_type.replace('_', ' ')} />
              <InfoItem icon={<VpnKeyIcon color="primary" />} label="Gov ID No" value={visitor.gov_id_no} />
              <InfoItem icon={<BloodtypeIcon color="warning" />} label="Blood Group" value={visitor.blood_group} />
              <InfoItem icon={<BlockIcon color={visitor.is_blacklisted ? 'error' : 'success'} />} label="Blacklisted" value={visitor.is_blacklisted ? "Yes" : "No"} />
            </div>
          </div>
        </div>
      </Paper>
    </Dialog>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="py-2 flex items-center">
    {icon}
    <span className="ml-1 font-bold">{label}</span>
    <span className="ml-1">:</span>
    <span className="ml-2">{value}</span>
  </div>
);

export default VisitorProfile;

