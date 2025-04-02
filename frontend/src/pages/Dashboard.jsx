import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    HomeIcon, ClipboardDocumentListIcon, CheckCircleIcon, Bars3Icon, XMarkIcon, TrashIcon
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

    // Fetch Student by Registration Number
    const handleSearch = async () => {
        if (!searchRegNo) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/search/${searchRegNo}`, {
                method:"GET",
                headers: { Authorization: `Bearer ${token}` }
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

    // Handle Individual & Bulk Selection
    const toggleStudentSelection = (studentId) => {
        setSelectedStudents((prev) => 
            prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
        );
    };

    // Delete Selected Students
    const handleDeleteSelected = async () => {
        if (selectedStudents.length === 0) return alert("No students selected.");
        if (!window.confirm("Are you sure you want to delete the selected students?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/bulk-delete`, {
                method: "DELETE",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userIds: selectedStudents })
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
        <div className="flex h-screen bg-gray-100 flex-col md:flex-row">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform md:translate-x-0 md:relative w-64 bg-gray-900 text-white p-5 h-full z-50`}>                    
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Dashboard</h2>
                    <XMarkIcon className="h-6 w-6 cursor-pointer md:hidden" onClick={() => setIsSidebarOpen(false)} />
                </div>
                <nav>
                    <ul>
                        <li className="mb-4">
                            <button onClick={() => setActivePage("home")} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 w-full text-left">
                                <HomeIcon className="h-5 w-5" />
                                <span>Home</span>
                            </button>
                        </li>
                        {userRole === "student" && (
                            <li className="mb-4">
                                <Link to="/dashboard/leave-application" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700">
                                    <ClipboardDocumentListIcon className="h-5 w-5" />
                                    <span>Leave Application</span>
                                </Link>
                            </li>
                        )}
                        {userRole === "admin" && (
                            <>
                                <li className="mb-4">
                                    <button onClick={() => setActivePage("pending-signups")} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 w-full text-left">
                                        <CheckCircleIcon className="h-5 w-5" />
                                        <span>Pending Signups</span>
                                    </button>
                                </li>
                                <li className="mb-4">
                                    <button onClick={() => setActivePage("pending-leaves")} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 w-full text-left">
                                        <CheckCircleIcon className="h-5 w-5" />
                                        <span>Pending Leave Requests</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => setActivePage("manage-students")} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 w-full text-left">
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
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md w-full sticky top-0 z-40">
                    <button className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <h2 className="text-lg font-bold text-center flex-grow">Leave Application Portal</h2>
                    <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700" onClick={() => {
                        localStorage.removeItem("user"); 
                        navigate("/login");
                    }}>Logout</button>
                </div>
                
                {/* Page Content */}
                <div className="flex-1 p-6 flex flex-col items-center w-full">
                    {activePage === "home" && <h1 className="text-2xl md:text-4xl font-bold text-center">Welcome, {userName}!</h1>}
                    {activePage === "pending-signups" && userRole === "admin" && <PendingSignups />}
                    {activePage === "pending-leaves" && userRole === "admin" && <PendingLeaveRequests />}
                    {activePage === "manage-students" && userRole === "admin" && (
                        <div className="w-full max-w-2xl">
                            <input type="text" placeholder="Enter Registration Number" value={searchRegNo} onChange={(e) => setSearchRegNo(e.target.value)} className="w-full p-2 border rounded mb-2" />
                            <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
                            {searchedStudents.map((student) => (
                                <div key={student._id} className="flex items-center justify-between border p-2 mt-2">
                                    <input type="checkbox" onChange={() => toggleStudentSelection(student._id)} />
                                    <span>{student.name} ({student.registrationNumber})</span>
                                </div>
                            ))}
                            <button onClick={handleDeleteSelected} className="bg-red-600 text-white px-4 py-2 rounded mt-2">Delete Selected</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
