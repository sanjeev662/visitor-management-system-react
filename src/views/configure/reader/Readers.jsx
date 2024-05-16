import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { url } from "../../../utils/Constants.jsx";
import Notification from "../../../components/notification/index.jsx";
import AddNewReader from "./AddNewReader";
import UpdateReader from "./UpdateReader";
import Pagination from "../../../components/pagination/index.jsx";

const Readers = () => {
    const [readersData, setReadersData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentSelectedReader, setCurrentSelectedReader] = useState(null);
    const [showAddNewReader, setShowAddNewReader] = useState(false);
    const [showUpdateReader, setShowUpdateReader] = useState(false);

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
            const response = await fetch(`${url}/gadgets/register-reader/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setReadersData(data);
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
        const filtered = readersData.filter(reader =>
            reader.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (event) => {
        setItemsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    const handleClick = (event, reader) => {
        setAnchorEl(event.currentTarget);
        setCurrentSelectedReader(reader);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const onActionClick = (action, reader) => {
        setCurrentSelectedReader(reader);
        if (action === 'addNewReader') {
            setShowAddNewReader(true);
        } else if (action === 'update') {
            setShowUpdateReader(true);
        } else if (action === 'delete') {
            console.log('Delete:', reader);
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
                        placeholder="Search"
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
                <button className="flex items-center bg-customGreen hover:bg-green-700 text-white py-1 px-4 rounded-3xl" onClick={() => onActionClick('addNewReader')}>
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
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Name</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Moxa IP</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">COM Port</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Reader Type</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">ADAM Module</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Zone</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((reader, index) => (
                                <tr key={index} className="hover:bg-grey-lighter">
                                    <td className="py-4 px-6 border-b border-grey-light">{reader.id}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{reader.name}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{reader.moxa_ip}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{reader.com_port}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{reader.reader_type}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{reader.adam_name}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{reader.zone_name}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">
                                        <IconButton aria-label="more" aria-controls="long-menu" aria-haspopup="true" onClick={(event) => handleClick(event, reader)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                        <Menu id="long-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
                                            <MenuItem onClick={() => { onActionClick('update', currentSelectedReader); handleClose(); }}>
                                                <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                                                <ListItemText primary="Update" />
                                            </MenuItem>
                                            <MenuItem onClick={() => { onActionClick('delete', currentSelectedReader); handleClose(); }}>
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
            {showAddNewReader && <AddNewReader open={showAddNewReader} onClose={() => setShowAddNewReader(false)} fetchData={fetchData} />}
            {showUpdateReader && <UpdateReader readerData={currentSelectedReader} open={showUpdateReader} onClose={() => setShowUpdateReader(false)} fetchData={fetchData} />}
        </div>
    );
};

export default Readers;

