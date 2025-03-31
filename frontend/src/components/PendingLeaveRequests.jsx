import { useEffect, useState } from "react";
import axios from "axios";

const PendingLeaveRequests = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const fetchLeaveRequests = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/admin/leave-requests");
            if (Array.isArray(response.data)) {
                setLeaveRequests(response.data);
            } else {
                setLeaveRequests([]);
                console.error("Unexpected API response:", response.data);
            }
        } catch (error) {
            setLeaveRequests([]);
            console.error("Error fetching leave requests:", error);
        }
    };

    const approveLeave = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/approve-leave/${id}`);
            setLeaveRequests((prevRequests) => prevRequests.filter((request) => request._id !== id));
        } catch (error) {
            console.error("Error approving leave:", error);
        }
    };

    const rejectLeave = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/reject-leave/${id}`);
            setLeaveRequests((prevRequests) => prevRequests.filter((request) => request._id !== id));
        } catch (error) {
            console.error("Error rejecting leave:", error);
        }
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen flex justify-center">
            <div className="bg-white shadow-md rounded-md p-4 w-full max-w-4xl">
                <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">
                    Pending Leave Applications
                </h2>

                {/* Table for larger screens */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300 rounded-md">
                        <thead>
                            <tr className="bg-gray-200 text-left">
                                <th className="py-3 px-4">Student</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Reason</th>
                                <th className="py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(leaveRequests) && leaveRequests.length > 0 ? (
                                leaveRequests.map((request) => (
                                    <tr key={request._id} className="border-t">
                                        <td className="py-3 px-4">{request.student?.name || "Unknown"}</td>
                                        <td className="py-3 px-4">{request.student?.email || "N/A"}</td>
                                        <td className="py-3 px-4">{request.reason}</td>
                                        <td className="py-3 px-4">
                                            <button
                                                className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600 transition"
                                                onClick={() => approveLeave(request._id)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                                onClick={() => rejectLeave(request._id)}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-gray-500">
                                        No pending leave applications.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Card layout for mobile screens */}
                <div className="md:hidden">
                    {Array.isArray(leaveRequests) && leaveRequests.length > 0 ? (
                        leaveRequests.map((request) => (
                            <div key={request._id} className="bg-gray-50 border border-gray-300 p-4 mb-4 rounded-lg shadow-sm">
                                <p className="text-lg font-semibold text-gray-700">
                                    {request.student?.name || "Unknown"}
                                </p>
                                <p className="text-sm text-gray-500">{request.student?.email || "N/A"}</p>
                                <p className="text-gray-700 mt-2"><strong>Reason:</strong> {request.reason}</p>

                                <div className="mt-3 flex gap-2">
                                    <button
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition w-full"
                                        onClick={() => approveLeave(request._id)}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition w-full"
                                        onClick={() => rejectLeave(request._id)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No pending leave applications.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PendingLeaveRequests;
