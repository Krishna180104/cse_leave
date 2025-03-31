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
                setLeaveRequests(response.data); // ✅ Ensure it's an array
            } else {
                setLeaveRequests([]); // ✅ Fallback to empty array
                console.error("Unexpected API response:", response.data);
            }
        } catch (error) {
            setLeaveRequests([]); // ✅ Prevent crash on error
            console.error("Error fetching leave requests:", error);
        }
    };

    const approveLeave = async (id) => {
        try {
            await axios.put(`/api/admin/approve-leave/${id}`);
            setLeaveRequests((prevRequests) => prevRequests.filter((request) => request._id !== id));
        } catch (error) {
            console.error("Error approving leave:", error);
        }
    };

    const rejectLeave = async (id) => {
        try {
            await axios.delete(`/api/admin/reject-leave/${id}`);
            setLeaveRequests((prevRequests) => prevRequests.filter((request) => request._id !== id));
        } catch (error) {
            console.error("Error rejecting leave:", error);
        }
    };

    return (
        <div className="p-4 bg-white shadow-md rounded-md">
            <h2 className="text-xl font-semibold mb-4">Pending Leave Applications</h2>
            <table className="min-w-full bg-white border border-gray-300 rounded-md">
                <thead>
                    <tr className="bg-gray-200 text-left">
                        <th className="py-2 px-4">Student</th>
                        <th className="py-2 px-4">Reason</th>
                        <th className="py-2 px-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(leaveRequests) && leaveRequests.length > 0 ? (
                        leaveRequests.map((request) => (
                            <tr key={request._id} className="border-t">
                                <td className="py-2 px-4">{request.studentName}</td>
                                <td className="py-2 px-4">{request.reason}</td>
                                <td className="py-2 px-4">
                                    <button
                                        className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                                        onClick={() => approveLeave(request._id)}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                        onClick={() => rejectLeave(request._id)}
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center py-4 text-gray-500">
                                No pending leave applications.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PendingLeaveRequests;
