import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LeaveApplicationForm = () => {
    const [reason, setReason] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || !userData.token) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/leave/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userData.token}`,
                },
                body: JSON.stringify({ reason, startDate, endDate }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("✅ Leave application submitted successfully!");
                setReason("");
                setStartDate("");
                setEndDate("");
            } else {
                setMessage(data.message || "Failed to submit leave application.");
            }
        } catch (error) {
            setMessage("⚠️ Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
            <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-lg sm:w-[90%] md:w-[70%] lg:w-[50%] xl:w-[40%]">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">📝 Apply for Leave</h2>

                {message && (
                    <div
                        className={`p-3 text-center rounded-md font-semibold ${
                            message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div>
                        <label className="block font-medium text-gray-700">Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter your reason for leave..."
                            required
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 font-semibold shadow-md"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit Leave Application"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LeaveApplicationForm;
