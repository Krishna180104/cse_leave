import { useState, useEffect } from "react";
import { Link, Meta, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  Bars3Icon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import PendingSignups from "../components/PendingSignups";
import PendingLeaveRequests from "../components/PendingLeaveRequests";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [searchRegNo, setSearchRegNo] = useState("");
  const [searchedStudents, setSearchedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [pendingSignupCount, setPendingSignupCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser?.role && parsedUser?.name) {
          setUserRole(parsedUser.role);
          setUserName(parsedUser.name);
        } else {
          navigate("/login");
        }
      } catch (error) {
        navigate("/login");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardCounts = async () => {
      const token = localStorage.getItem("token");
      try {
        const [signupRes, leaveRes, studentsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/pending/count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/leave-requests/count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/admin/total-students`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        const signupData = await signupRes.json();
        const leaveData = await leaveRes.json();
        const studentsData = await studentsRes.json();

        setPendingSignupCount(signupData.count || 0);
        setPendingLeaveCount(leaveData.count || 0);
        setTotalStudentsCount(studentsData.count || 0);
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      }
    };

    if (userRole === "admin") {
      fetchDashboardCounts();
    }
  }, [userRole]);

  const handleSearch = async () => {
    if (!searchRegNo) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/search/${searchRegNo}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setSearchedStudents([data[0]]);
      } else {
        alert(data.message);
        setSearchedStudents([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedStudents.length === 0) return alert("No students selected.");
    if (!window.confirm("Are you sure you want to delete the selected students?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/bulk-delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: selectedStudents }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Students deleted successfully.");
        setSearchedStudents((prev) => prev.filter((s) => !selectedStudents.includes(s._id)));
        setSelectedStudents([]);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  return (
    <div className="flex h-screen bg-[#f7f9fc] flex-col md:flex-row">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform md:translate-x-0 md:relative w-64 bg-[#1f2937] text-white p-5 h-full z-50 shadow-lg`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-wide">Dashboard</h2>
          <XMarkIcon className="h-6 w-6 cursor-pointer md:hidden" onClick={() => setIsSidebarOpen(false)} />
        </div>
        <nav>
          <ul>
            <li className="mb-3">
              <button
                onClick={() => setActivePage("home")}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:text-black w-full text-left transition"
              >
                <HomeIcon className="h-5 w-5" />
                <span>Home</span>
              </button>
            </li>
            {userRole === "student" && (
              <li className="mb-3">
                <Link
                  to="/dashboard/leave-application"
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:text-black transition"
                >
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                  <span>Leave Application</span>
                </Link>
              </li>
            )}
            {userRole === "admin" && (
              <>
                <li className="mb-3">
                  <button
                    onClick={() => setActivePage("pending-signups")}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:text-black w-full text-left transition"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Pending Signups</span>
                  </button>
                </li>
                <li className="mb-3">
                  <button
                    onClick={() => setActivePage("pending-leaves")}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:text-black w-full text-left transition"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Pending Leave Requests</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePage("manage-students")}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:text-black w-full text-left transition"
                  >
                    <TrashIcon className="h-5 w-5" />
                    <span>Manage Students</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
          <button className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 text-center flex-grow">
            Leave Application Portal
          </h2>
          <button
            className="bg-red-500 px-4 py-2 text-sm text-white rounded-xl hover:bg-white hover:text-red-600 transition shadow border border-red-500"
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 flex flex-col items-center w-full">
          {activePage === "home" && (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-700 mb-6 text-center">
                Welcome, {userName}!
              </h1>
              {userRole === "admin" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
                  <div className="bg-white shadow-md p-6 rounded-2xl text-center border border-gray-200">
                    <p className="text-2xl font-bold text-blue-600">{pendingSignupCount}</p>
                    <p className="mt-2 text-gray-600">Pending Signups</p>
                  </div>
                  <div className="bg-white shadow-md p-6 rounded-2xl text-center border border-gray-200">
                    <p className="text-2xl font-bold text-yellow-600">{pendingLeaveCount}</p>
                    <p className="mt-2 text-gray-600">Pending Leave Requests</p>
                  </div>
                  <div className="bg-white shadow-md p-6 rounded-2xl text-center border border-gray-200">
                    <p className="text-2xl font-bold text-green-600">{totalStudentsCount}</p>
                    <p className="mt-2 text-gray-600">Total Registered Students</p>
                  </div>
                </div>
              )}
            </>
          )}

          {activePage === "pending-signups" && userRole === "admin" && <PendingSignups />}
          {activePage === "pending-leaves" && userRole === "admin" && <PendingLeaveRequests />}
          {activePage === "manage-students" && userRole === "admin" && (
            <div className="w-full max-w-2xl mt-4">
              <input
                type="text"
                placeholder="Enter Registration Number"
                value={searchRegNo}
                onChange={(e) => setSearchRegNo(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-white hover:text-blue-600 transition shadow-md border border-blue-600"
                >
                  Search
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-white hover:text-red-600 transition shadow-md border border-red-500"
                >
                  Delete Selected
                </button>
              </div>
              {searchedStudents.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between border border-gray-300 p-3 mt-4 rounded-md bg-white shadow-sm"
                >
                  <input
                    type="checkbox"
                    onChange={() => toggleStudentSelection(student._id)}
                  />
                  <span className="ml-3 text-gray-700">
                    {student.name} ({student.registrationNumber})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
