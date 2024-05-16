import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { url } from "../../utils/Constants.jsx";
import Notification from "../../components/notification/index.jsx";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/material";
import ViewPass from "./ViewPass";

const Passes = () => {
    const [passesData, setPassesData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSelectedPass, setCurrentSelectedPass] = useState(null);
    const [showViewPass, setShowViewPass] = useState(false);

    let navigate = useNavigate();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${url}/passes/visitor-pass-info`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const json = await response.json();
            if (response.ok) {
                setPassesData(json);
            } else {
                Notification.showErrorMessage("Try Again!", json.error);
            }
        } catch (err) {
            Notification.showErrorMessage("Error", "Server error!");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
        }
        fetchData();
    }, []);

    const handleRowClick = (pass) => {
        setCurrentSelectedPass(pass);
        setShowViewPass(true);
    };

    return (
        <div style={{marginBottom:"55px"}}>
            <div className="flex justify-between items-center m-6">
                <div>
                    <input
                        className="appearance-none border border-customGreen rounded-3xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-700"
                        type="text"
                        placeholder="Search"
                    />
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
            ) : (
                <div className="bg-white shadow-md rounded my-6">
                    <table className="text-left w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light text-center">Visitor Image</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Visitor Name</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Purpose</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Whom To Visit</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Visiting Department</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Created On</th>
                                <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Valid Until</th>
                            </tr>
                        </thead>
                        <tbody>
                            {passesData.map((pass, index) => (
                                <tr key={index} className="hover:bg-grey-lighter cursor-pointer" onClick={() => handleRowClick(pass)}>
                                    <td className="py-1 px-1 border-b border-grey-light">
                                        <div className="flex justify-center">
                                            <div className="inline-block h-16 w-16 border-2 border-gray-300 rounded-full overflow-hidden bg-customGreen">
                                                {pass.visitor.image ? (
                                                    <img src={`data:image/jpeg;base64,${pass.visitor.image}`} alt="User" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-white bg-customGreen">
                                                        {pass.visitor.first_name ? pass.visitor.first_name.charAt(0).toUpperCase() : 'N'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 border-b border-grey-light">{pass.visitor.first_name} {pass.visitor.last_name}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{pass.visiting_purpose}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{pass.whom_to_visit}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">{pass.visiting_department}</td>
                                    <td className="py-4 px-6 border-b border-grey-light">
                                        {new Date(pass.created_on).toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </td>
                                    <td className="py-4 px-6 border-b border-grey-light">
                                        {new Date(pass.valid_until).toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>)}
            {currentSelectedPass && <ViewPass passData={currentSelectedPass} open={showViewPass} onClose={() => setShowViewPass(false)} fetchData={fetchData} />}
        </div>
    );
};

export default Passes;
