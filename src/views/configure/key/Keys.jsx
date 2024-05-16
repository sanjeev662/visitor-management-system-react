import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { url } from "../../../utils/Constants.jsx";
import Notification from "../../../components/notification/index.jsx";
import AddNewKey from "./AddNewKey";
import UpdateKey from "./UpdateKey";
import Pagination from "../../../components/pagination/index.jsx";

const Keys = () => {
    const [keysData, setKeysData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentSelectedKey, setCurrentSelectedKey] = useState(null);
    const [showAddNewKey, setShowAddNewKey] = useState(false);
    const [showUpdateKey, setShowUpdateKey] = useState(false);

    let navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${url}/key/key-info`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setKeysData(data);
                setFilteredData(data);
            } else {
                Notification.showErrorMessage("Try Again!", data.error);
            }
        } catch (err) {
            Notification.showErrorMessage("Error", "Server error!");
        }
        setIsLoading(false);
    };

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        const filtered = keysData.filter(key =>
            String(key.RFID_key).toLowerCase().includes(String(value).toLowerCase()) ||
            (key.visitor_pass && String(key.visitor_pass).toLowerCase().includes(String(value).toLowerCase()))
        );
        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (event) => {
        setItemsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    const handleClick = (event, key) => {
        setAnchorEl(event.currentTarget);
        setCurrentSelectedKey(key);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const onActionClick = (action, key) => {
        setCurrentSelectedKey(key);
        if (action === 'addNewKey') {
            setShowAddNewKey(true);
        } else if (action === 'update') {
            setShowUpdateKey(true);
        } else if (action === 'delete') {
            // console.log('Delete:', key);
            deleteKey(key)
        }
    };
    const deleteKey = async (key) => {
        try {
            const response = await fetch(`${url}/key/key-info/${key.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                // body: JSON.stringify("formData"),
            });
            if (response.ok) {
                Notification.showSuccessMessage("Success", "Key Deleted");
                fetchData();
                // onClose();
            } else {
                const json = await response.json();
                Notification.showErrorMessage("Error", json.error);
            }
        } catch (error) {
            Notification.showErrorMessage("Error", "Server error");
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div style={{marginBottom:"55px"}}>
            <div className="flex justify-between items-center m-6">
                <div className="flex items-center space-x-2">
                    <input
                        className="appearance-none border border-customGreen rounded-3xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-700"
                        type="text"
                        placeholder="Search Key / VisitorPass"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <select
                        value={itemsPerPage}
                        onChange={handlePageSizeChange}
                        className="border border-customGreen rounded-3xl bg-white py-2 px-3 text-gray-700 focus:outline-none"
                    >
                        {[5, 10, 20, 30, 50].map(size => (
                            <option key={size} value={size}>{size} per page</option>
                        ))}
                    </select>
                </div>
                <button className="flex items-center bg-customGreen hover:bg-green-700 text-white py-1 px-4 rounded-3xl" onClick={() => onActionClick('addNewKey')}>
                    <AddIcon className="h-4 w-5 mr-2" />
                    ADD NEW
                </button>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <CircularProgress />
                </div>
            ) : currentItems.length > 0 ? (
                <div className="bg-white shadow-md rounded my-6">
                    <table className="text-left w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">ID</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">RFID Key</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Blacklisted</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Is Assigned</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Visitor Pass</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((key, index) => (
                                <tr key={index} className="hover:bg-grey-lighter">
                                    <td className="py-4 px-6 border-b border-grey-light">{key.id}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{key.RFID_key}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{key.blacklisted ? 'Yes' : 'No'}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{key.is_assigned ? 'Yes' : 'No'}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{key.visitor_pass || 'N/A'}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">
                                        <IconButton aria-label="more" aria-controls="long-menu" aria-haspopup="true" onClick={(event) => handleClick(event, key)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                        <Menu id="long-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                                            <MenuItem onClick={() => { onActionClick('update', currentSelectedKey); handleClose(); }}>
                                                <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                                                <ListItemText primary="Update" />
                                            </MenuItem>
                                            <MenuItem onClick={() => { onActionClick('delete', currentSelectedKey); handleClose(); }}>
                                                <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                                                <ListItemText primary="Delete" />
                                            </MenuItem>
                                        </Menu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <Pagination currentPage={currentPage} totalPages={totalPages} paginate={setCurrentPage} />
                </div>
            ) : (
                <div className="text-center py-10">
                    <p>No data found.</p>
                </div>
            )}
            {showAddNewKey && <AddNewKey open={showAddNewKey} onClose={() => setShowAddNewKey(false)} fetchData={fetchData} />}
            {showUpdateKey && <UpdateKey keyData={currentSelectedKey} open={showUpdateKey} onClose={() => setShowUpdateKey(false)} fetchData={fetchData} />}
        </div>
    );
};

export default Keys;

