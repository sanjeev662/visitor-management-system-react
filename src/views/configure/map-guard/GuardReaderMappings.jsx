import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { url } from "../../../utils/Constants.jsx";
import AddIcon from "@mui/icons-material/Add";
import Notification from "../../../components/notification/index.jsx";
import Pagination from "../../../components/pagination/index.jsx";
import AddNewGuardReaderMapping from "./AddNewGuardReaderMapping";

const GuardReaderMappings = () => {
    const [mappingsData, setMappingsData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showAddNewMapping, setShowAddNewMapping] = useState(false);

    let navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
        }
        fetchData();
    }, []);

    const toggleAddNewMappingForm = () => {
        setShowAddNewMapping(!showAddNewMapping);
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${url}/guard-reader-mappings/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setMappingsData(data);
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
        const filtered = mappingsData.filter(mapping =>
            mapping.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (event) => {
        setItemsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div>
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
                <button className="flex items-center bg-customGreen hover:bg-green-700 text-white py-1 px-4 rounded-3xl" onClick={toggleAddNewMappingForm}>
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
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Adam Name</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Zone Name</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Associated Users</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Moxa IP</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Reader Type</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">COM Port</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((mapping, index) => (
                                <tr key={index} className="hover:bg-grey-lighter">
                                    <td className="py-4 px-6 border-b border-grey-light">{mapping.id}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{mapping.name}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{mapping.adam_name}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{mapping.zone_name}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{mapping.associated_users.map(user => user.username).join(', ')}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{mapping.moxa_ip}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{mapping.reader_type}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{mapping.com_port}</td>
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
            {showAddNewMapping && <AddNewGuardReaderMapping open={showAddNewMapping} onClose={() => setShowAddNewMapping(false)} fetchData={fetchData} />}
        </div>
    );
};

export default GuardReaderMappings;
