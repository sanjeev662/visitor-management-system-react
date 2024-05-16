import React, { useState, useEffect } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { url } from "../../utils/Constants";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Notification from "../../components/notification/index.jsx";
import "chart.js/auto";

const Dashboard = () => {
  const [passTimeLeftData, setPassTimeLeftData] = useState([]);
  const [todayVisitorData, setTodayVisitorData] = useState({});
  const [weeklyVisitorData, setWeeklyVisitorData] = useState({});
  const [visitorInZonesData, setVisitorInZonesData] = useState({});

  const getPassTimeLeft = async () => {
    try {
      const response = await fetch(`${url}/dashboard/pass-time-left/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const json = await response.json();
      if (response.ok) {
        setPassTimeLeftData(json);
      } else {
        Notification.showErrorMessage("Try Again!", json.error);
      }
    } catch (err) {
      Notification.showErrorMessage("Error", "Server error!");
    }
  };

  function calculateMinutesBetweenDates(startTime, endTime) {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const diffInMs = endDate - startDate;
    const minutes = diffInMs / 60000;
    return Math.max(0, Math.round(minutes));
  }

  const currentTime = new Date().toISOString();

  const getTodayVisitorVisitDashboard = async () => {
    try {
      const response = await fetch(`${url}/dashboard/today-visitor-visit/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const json = await response.json();
      if (response.ok) {
        setTodayVisitorData(json);
      } else {
        Notification.showErrorMessage("Try Again!", json.error);
      }
    } catch (err) {
      Notification.showErrorMessage("Error", "Server error!");
    }
  };

  const formatDate = (date) => {
    let d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  const today = formatDate(new Date());

  const counts = {
    "9am":
      todayVisitorData[`${today} 09:00:00`] +
      todayVisitorData[`${today} 09:30:00`],
    "10am":
      todayVisitorData[`${today} 10:00:00`] +
      todayVisitorData[`${today} 10:30:00`],
    "11am":
      todayVisitorData[`${today} 11:00:00`] +
      todayVisitorData[`${today} 11:30:00`],
    "12pm":
      todayVisitorData[`${today} 12:00:00`] +
      todayVisitorData[`${today} 12:30:00`],
    "1pm":
      todayVisitorData[`${today} 13:00:00`] +
      todayVisitorData[`${today} 13:30:00`],
    "2pm":
      todayVisitorData[`${today} 14:00:00`] +
      todayVisitorData[`${today} 14:30:00`],
    "3pm":
      todayVisitorData[`${today} 15:00:00`] +
      todayVisitorData[`${today} 15:30:00`],
    "4pm":
      todayVisitorData[`${today} 16:00:00`] +
      todayVisitorData[`${today} 16:30:00`],
    "5pm":
      todayVisitorData[`${today} 17:00:00`] +
      todayVisitorData[`${today} 17:30:00`],
    "6pm": todayVisitorData[`${today} 18:00:00`],
    "7pm": 0,
  };

  const lineChartData = {
    labels: Object.keys(counts),
    datasets: [
      {
        label: "Visits",
        data: Object.values(counts),
        fill: true,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const getWeeklyVisitorVisit = async () => {
    try {
      const response = await fetch(`${url}/dashboard/weekly-visitor-visit/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const json = await response.json();
      if (response.ok) {
        setWeeklyVisitorData(json);
      } else {
        Notification.showErrorMessage("Try Again!", json.error);
      }
    } catch (err) {
      Notification.showErrorMessage("Error", "Server error!");
    }
  };

  const barChartData = {
    labels: Object.keys(weeklyVisitorData),
    datasets: [
      {
        label: "Weekly Visitors",
        data: Object.values(weeklyVisitorData),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  const getVisitorInZones = async () => {
    try {
      const response = await fetch(`${url}/dashboard/visitor-in-zone/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const json = await response.json();
      if (response.ok) {
        setVisitorInZonesData(json);
      } else {
        Notification.showErrorMessage("Try Again!", json.error);
      }
    } catch (err) {
      Notification.showErrorMessage("Error", "Server error!");
    }
  };

  const doughnutChartData = {
    labels: Object.keys(visitorInZonesData),
    datasets: [
      {
        data: Object.values(visitorInZonesData),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(53, 162, 235, 0.5)",
          "rgba(75, 192, 192, 0.5)",
        ],
        hoverOffset: 4,
      },
    ],
  };

  useEffect(() => {
    getPassTimeLeft();
    getTodayVisitorVisitDashboard();
    getWeeklyVisitorVisit();
    getVisitorInZones();
  }, []);

  return (
    <div className="p-6">
      {/* Chart row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Weekly Visitors */}
        <div className="bg-white border rounded shadow p-4 h-80">
          <h2 class="text-lg font-bold mb-3">Weekly Visitors</h2>
          <div className="h-64 p-4">
            <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Today Visits */}
        <div className="bg-white border rounded shadow p-4 h-80">
          <h2 class="text-lg font-bold mb-3">Today's Visitors</h2>
          <div className="h-64 p-4">
            <Line
              data={lineChartData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        {/* Number of People in Zones */}
        <div className="bg-white border rounded shadow p-4 h-80">
          <h2 class="text-lg font-bold mb-3">People in Zones</h2>
          <div className="h-64 p-4">
            <Doughnut
              data={doughnutChartData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      {/* Visitors /action row */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"> */}
      <div className="grid gap-4 mb-8">
        <div className="md:col-span-2 bg-white border rounded shadow">
          <h2 className="text-lg font-bold p-4 border-b">
            Today's visitors (
            {passTimeLeftData?.length ? passTimeLeftData?.length : 0})
          </h2>
          <div className="p-4 overflow-auto" style={{ maxHeight: "340px" }}>
            <table className="min-w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-2 pb-2 text-center">Image</th>
                  <th className="px-6 pb-2">Name</th>
                  <th className="px-6 pb-2">Remaining Time</th>
                  <th className="px-6 pb-2">Phone No</th>
                  <th className="px-6 pb-2">Government Type</th>
                  <th className="px-6 pb-2">Government ID</th>
                </tr>
              </thead>
              <tbody style={{ maxHeight: "320px", overflowY: "auto" }}>
                {passTimeLeftData?.map((visitor, index) => {
                  const totalMinutes = calculateMinutesBetweenDates(
                    visitor.pass_created_at,
                    visitor.valid_upto
                  );
                  const remainingMinutes = calculateMinutesBetweenDates(
                    currentTime,
                    visitor.valid_upto
                  );
                  const validProgressPercent =
                    ((totalMinutes - remainingMinutes) / totalMinutes) * 100;
                  const progressPercent =
                    isNaN(validProgressPercent) || validProgressPercent < 0
                      ? 100
                      : validProgressPercent;

                  return (
                    <tr
                      key={visitor.phone}
                      className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                    >
                      <td className="py-1 ">
                        <div className="flex justify-center">
                          <div className="inline-block h-16 w-16 border-2 border-gray-300 rounded-full overflow-hidden bg-customGreen">
                            {visitor.image ? (
                              <img
                                src={`data:image/jpeg;base64,${visitor.image}`}
                                alt="User"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-white bg-customGreen">
                                {visitor.visitor_name
                                  ? visitor.visitor_name.charAt(0).toUpperCase()
                                  : "N"}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{visitor.visitor_name}</td>
                      <td class="px-6 py-4 relative">
                        <div class="w-3/4 bg-gray-200 rounded-full h-2.5 group">
                          <div
                            class="bg-blue-500 h-2.5 rounded-full"
                            style={{ width: `${100 - progressPercent}%` }}
                          ></div>
                          <div class="absolute w-auto p-2 mt-2 text-xs text-white bg-customGreen rounded-md opacity-0 group-hover:opacity-100">
                            {`${remainingMinutes} minutes left`}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{visitor.phone}</td>
                      <td className="px-6 py-4">{visitor.gov_id_type.replace('_', ' ')}</td>
                      <td className="px-6 py-4">{visitor.gov_id_no}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buttons in the last column aligned in a column */}
        {/* <div className="flex flex-col items-stretch justify-center md:justify-start space-y-6 w-full p-6">
         <Link to="/visitor">
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-3xl w-full">
              Add Visitors
            </button>
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
