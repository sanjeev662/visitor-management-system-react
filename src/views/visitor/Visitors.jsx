import React, { useState, useEffect } from "react";
import { Box, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Alert from "../../components/alert/index.jsx";
import CircularProgress from "@mui/material/CircularProgress";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import Pagination from "../../components/pagination/index.jsx";


const Visitors = ({ visitors, totalVisitors, isLoading, onActionClick, searchParams, setSearchParams }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentSelectedVisitor, setCurrentSelectedVisitor] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);



  const handleClick = (event, visitor) => {
    setAnchorEl(event.currentTarget);
    setCurrentSelectedVisitor(visitor);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = (visitor) => {
    setCurrentSelectedVisitor(visitor);
    setShowDeleteAlert(true);
    handleClose();
  };

  const confirmDelete = () => {
    console.log("Deleting...");
    console.log(currentSelectedVisitor);
    setShowDeleteAlert(false);
    // Perform delete action
  };

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    const newName = `${name}__icontains`;
    setSearchParams({ ...searchParams, [newName]: value });
    setCurrentPage(1);
  };

  const handleLimitChange = (event) => {
    setSearchParams({ ...searchParams, limit: event.target.value, offset: 0 });
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (offset) => {
    setSearchParams({ ...searchParams, offset });
  };

  useEffect(() => {
    handlePageChange((currentPage - 1) * itemsPerPage);
  }, [currentPage]);

  const totalPages = Math.ceil(totalVisitors / itemsPerPage);

  return (
    <div style={{marginBottom:"55px"}}>
      <div className="flex justify-between items-center m-6">
        <div className="flex items-center space-x-2">
          <input
            className="appearance-none border border-customGreen rounded-3xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-700"
            type="text"
            name="first_name"
            value={searchParams.first_name}
            onChange={handleSearchChange}
            placeholder="Search by name"
          />
          {/* <input
            className="appearance-none border border-customGreen rounded-3xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-700"
            type="text"
            name="last_name"
            value={searchParams.last_name}
            onChange={handleSearchChange}
            placeholder="Search by last name"
          /> */}
          <input
            className="appearance-none border border-customGreen rounded-3xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-700"
            type="text"
            name="phone"
            value={searchParams.phone}
            onChange={handleSearchChange}
            placeholder="Search by phone number"
          />
          {/* <input
            className="appearance-none border border-customGreen rounded-3xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-700"
            type="text"
            name="gov_id_no"
            value={searchParams.gov_id_no}
            onChange={handleSearchChange}
            placeholder="Search by govt ID number"
          /> */}
          <select
            value={searchParams.limit}
            onChange={handleLimitChange}
            className="border border-customGreen rounded-3xl bg-white py-2 px-3 text-gray-700 focus:outline-none"
          >
            {[5, 10, 20, 30, 50].map(size => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center bg-customGreen hover:bg-green-700 text-white py-1 px-4 rounded-3xl" onClick={() => { onActionClick('addNewVisitor'); handleClose(); }}>
            <AddIcon className="h-4 w-5 mr-2" />
            ADD NEW
          </button>
        </div>
      </div>
      {isLoading ? (
        <Box
          style={{
            height: "50vh",
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : visitors?.length > 0 ? (
        <div className="bg-white shadow-md rounded my-6">
          <table className="text-left w-full border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light text-center">Visitor Image</th>
                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">
                  Visitor Name
                </th>
                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">
                  Visitor Type
                </th>
                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">
                  Phone
                </th>
                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">
                  Gov ID
                </th>
                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">
                  Gov ID No
                </th>
                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">
                  Email
                </th>
                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {visitors?.map((visitor, index) => (
                <tr key={visitor.id} className="hover:bg-grey-lighter" >
                  <td className="py-1 px-1 border-b border-grey-light">
                    <div className="flex justify-center">
                      <div className="inline-block h-16 w-16 border-2 border-gray-300 rounded-full overflow-hidden bg-customGreen">
                        {visitor.image ? (
                          <img src={`data:image/jpeg;base64,${visitor.image}`} alt="User" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-white bg-customGreen">
                            {visitor.first_name ? visitor.first_name.charAt(0).toUpperCase() : 'N'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-grey-light">
                    {visitor.first_name} {visitor.last_name}
                  </td>
                  <td className="py-4 px-6 border-b border-grey-light">
                    {visitor.visitor_type}
                  </td>
                  <td className="py-4 px-6 border-b border-grey-light">
                    {visitor.phone}
                  </td>
                  <td className="py-4 px-6 border-b border-grey-light">
                    {visitor.gov_id_type.replace('_', ' ')}
                  </td>
                  <td className="py-4 px-6 border-b border-grey-light">
                    {visitor.gov_id_no}
                  </td>
                  <td className="py-4 px-6 border-b border-grey-light">
                    {visitor.email}
                  </td>
                  <td className="py-4 px-6 border-b border-grey-light">
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
                      <MenuItem onClick={() => { onActionClick('view', currentSelectedVisitor); handleClose(); }}>
                        <ListItemIcon>
                          <VisibilityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="View" />
                      </MenuItem>
                      <MenuItem onClick={() => { onActionClick('update', currentSelectedVisitor); handleClose(); }}>
                        <ListItemIcon>
                          <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Update" />
                      </MenuItem>
                      <MenuItem onClick={() => { handleDelete(currentSelectedVisitor) }}>
                        <ListItemIcon>
                          <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Delete" />
                      </MenuItem>
                      <MenuItem onClick={() => { onActionClick('pass', currentSelectedVisitor); handleClose(); }}>
                        <ListItemIcon>
                          <CreditCardIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Generate Pass" />
                      </MenuItem>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination currentPage={currentPage} totalPages={totalPages} paginate={setCurrentPage} />
        </div>) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', textAlign: 'center' }}>
          <p>No Visitor found.</p>
        </Box>
      )}
      <Alert
        open={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        title="Confirm Delete"
        message="Are you sure you want to delete this Visitor?"
        buttonText="Delete"
        buttonColor="red"
        onButtonClick={confirmDelete}
      />
    </div>
  );
};

export default Visitors;