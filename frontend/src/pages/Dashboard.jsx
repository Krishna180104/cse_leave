import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import { HomeIcon, ClipboardListIcon, CheckCircleIcon, MenuIcon, XIcon } from "@heroicons/react/24/outline";
import LeaveApplication from "../pages/LeaveApplication";
import Approvals from "../pages/Approvals";

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <Router>
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform md:translate-x-0 w-64 bg-gray-900 text-white p-5`}>                    
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Dashboard</h2>
                        <XIcon className="h-6 w-6 cursor-pointer md:hidden" onClick={() => setIsSidebarOpen(false)} />
                    </div>
                    <nav>
                        <ul>
                            <li className="mb-4">
                                <Link to="/dashboard" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700">
                                    <HomeIcon className="h-5 w-5" />
                                    <span>Home</span>
                                </Link>
                            </li>
                            <li className="mb-4">
                                <Link to="/dashboard/leave-application" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700">
                                    <ClipboardListIcon className="h-5 w-5" />
                                    <span>Leave Application</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/approvals" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700">
                                    <CheckCircleIcon className="h-5 w-5" />
                                    <span>Approvals</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
                
                {/* Main Content */}
                <div className="flex-1 md:ml-64 p-6">
                    {/* Mobile Menu Button */}
                    <button className="md:hidden mb-4" onClick={() => setIsSidebarOpen(true)}>
                        <MenuIcon className="h-6 w-6" />
                    </button>

                    <Routes>
                        <Route path="/dashboard" element={<h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>} />
                        <Route path="/dashboard/leave-application" element={<LeaveApplication />} />
                        <Route path="/dashboard/approvals" element={<Approvals />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default Dashboard;
