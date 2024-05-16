import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { url } from "../../utils/Constants.jsx";
import Notification from "../../components/notification/index.jsx";

import Visitors from './Visitors';
import VisitorProfile from './VisitorProfile';
import UpdateVisitor from './UpdateVisitor';
import AddNewVisitor from './AddNewVisitor';
import CreateNewPass from '../pass/CreateNewPass';

const Visitor = () => {
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [addNewVisitorModalOpen, setAddNewVisitorModalOpen] = useState(false);
  const [createNewPassModalOpen, setCreateNewPassModalOpen] = useState(false);

  const handleActionClick = (action, visitor = null) => {
    if (visitor) setSelectedVisitor(visitor);
    switch (action) {
      case 'view':
        setViewModalOpen(true);
        break;
      case 'update':
        setUpdateModalOpen(true);
        break;
      case 'addNewVisitor':
        setAddNewVisitorModalOpen(true);
        break;
      case 'pass':
        setCreateNewPassModalOpen(true);
        setViewModalOpen(false);
        break;
      default:
        console.log("Unhandled action:", action);
    }
  };

  let navigate = useNavigate();

  const [visitorData, setVisitorData] = useState(null);
  const [totalVisitors, setTotalVisitors] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    first_name__icontains: '',
    last_name__icontains: '',
    phone__icontains: '',
    gov_id_no__icontains: '',
    offset: 0,
    limit: 10
  });


  const fetchData = async () => {
    setIsLoading(true);
    const queryString = new URLSearchParams(searchParams).toString();
    try {
      const response = await fetch(`${url}/visitor/visitor-info?${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const json = await response.json();
      if (response.ok) {
        setVisitorData(json?.results);
        setTotalVisitors(json?.count);
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
  }, [searchParams]);

  return (
    <div>
      <Visitors visitors={visitorData} isLoading={isLoading} onActionClick={handleActionClick} searchParams={searchParams} setSearchParams={setSearchParams} totalVisitors={totalVisitors} />
      <AddNewVisitor open={addNewVisitorModalOpen} onClose={() => setAddNewVisitorModalOpen(false)} fetchData={fetchData} onActionClick={handleActionClick} />
      {selectedVisitor && (
        <>
          <VisitorProfile open={viewModalOpen} onClose={() => setViewModalOpen(false)} visitor={selectedVisitor} onActionClick={handleActionClick} />
          <UpdateVisitor open={updateModalOpen} onClose={() => setUpdateModalOpen(false)} visitor={selectedVisitor} fetchData={fetchData} />
          <CreateNewPass open={createNewPassModalOpen} onClose={() => setCreateNewPassModalOpen(false)} visitor={selectedVisitor} fetchData={fetchData} />
        </>
      )}
    </div>
  );
};

export default Visitor;

