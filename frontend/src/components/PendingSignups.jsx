import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PendingSignups = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPendingUsers = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pending`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
    
                if (!response.ok) throw new Error("Failed to fetch");
    
                const data = await response.json();
                console.log("Pending users:", data); // ✅ Debugging output
                setPendingUsers(data);
            } catch (error) {
                console.error("Error fetching pending users:", error);
            }
        };
    
        fetchPendingUsers();
    }, []);
    

    const handleApprove = async (id) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/admin/approve/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setPendingUsers(pendingUsers.filter(user => user._id !== id));
        } catch (error) {
            console.error("Error approving user:", error);
        }
    };

    const handleReject = async (id) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reject/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setPendingUsers(pendingUsers.filter(user => user._id !== id));
        } catch (error) {
            console.error("Error rejecting user:", error);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Pending Signup Requests</h2>
            {/* Table for larger screens */}
            <div className="hidden md:block">
                <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">ID Card</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingUsers.map(user => (
                            <tr key={user._id} className="border-b">
                                <td className="p-3">{user.name}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">{user.role}</td>
                                <td className="p-3">
                                    <img 
                                        src={`${import.meta.env.VITE_API_URL}/${user.idCardImage}`} 
                                        alt="ID Card" 
                                        className="h-16 w-16 object-cover rounded border cursor-pointer" 
                                        onClick={() => setSelectedImage(`${import.meta.env.VITE_API_URL}/${user.idCardImage}`)}
                                    />
                                </td>
                                <td className="p-3">
                                    <button 
                                        className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                                        onClick={() => handleApprove(user._id)}
                                    >Approve</button>
                                    <button 
                                        className="bg-red-600 text-white px-3 py-1 rounded"
                                        onClick={() => handleReject(user._id)}
                                    >Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Card view for mobile screens */}
            <div className="md:hidden">
                {pendingUsers.map(user => (
                    <div key={user._id} className="bg-white p-4 rounded-lg shadow-md mb-4">
                        <h3 className="text-lg font-bold">{user.name}</h3>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="text-gray-600">Role: {user.role}</p>
                        <img 
                            src={`${import.meta.env.VITE_API_URL}/${user.idCardImage}`} 
                            alt="ID Card" 
                            className="h-24 w-24 object-cover rounded border mt-2 cursor-pointer" 
                            onClick={() => setSelectedImage(`${import.meta.env.VITE_API_URL}/${user.idCardImage}`)}
                        />
                        <div className="mt-3">
                            <button 
                                className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                                onClick={() => handleApprove(user._id)}
                            >Approve</button>
                            <button 
                                className="bg-red-600 text-white px-3 py-1 rounded"
                                onClick={() => handleReject(user._id)}
                            >Reject</button>
                        </div>
                    </div>
                ))}
            </div>
            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="ID Card" className="max-w-full max-h-full rounded shadow-lg" />
                </div>
            )}
        </div>
    );
};

export default PendingSignups;
