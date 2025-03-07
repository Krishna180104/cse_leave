import { Link } from "react-router-dom";
import { useState } from "react";
import { HomeIcon, ClipboardDocumentListIcon, CheckCircleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform md:translate-x-0 w-64 bg-gray-900 text-white p-5`}>                    
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Dashboard</h2>
                    <XMarkIcon className="h-6 w-6 cursor-pointer md:hidden" onClick={() => setIsSidebarOpen(false)} />
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
                                <ClipboardDocumentListIcon className="h-5 w-5" />
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
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
                    <button className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <h2 className="text-lg font-bold">Leave Application Portal</h2>
                    <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">Logout</button>
                </div>
                
                {/* Page Content */}
                <div className="flex-1 p-6 flex justify-center items-center">
                    <h1 className="text-2xl md:text-4xl font-bold text-center">Welcome to the Dashboard</h1>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
