import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Signup = () => {
    const [name, setName] = useState("");
    const [regNo, setRegNo] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [idCardImage, setIdCardImage] = useState(null);
    const [role, setRole] = useState("student"); // Default role is Student
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("regNo", regNo);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("idCardImage", idCardImage);
        formData.append("role", role); // ✅ Added Role

        try {
            const response = await fetch("http://localhost:5000/api/users/register", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                alert("Signup request sent for approval.");
                navigate("/");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Signup failed:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gray-900 text-white px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-center">Leave Application Portal</h1>
            <h2 className="text-sm md:text-lg text-center mb-6">Department of Computer Science and Engineering, SGGSIE&T</h2>
            
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm md:w-96 text-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                <form onSubmit={handleSignup}>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 mb-4 border rounded"
                        required 
                    />
                    <input 
                        type="text" 
                        placeholder="Registration Number" 
                        value={regNo} 
                        onChange={(e) => setRegNo(e.target.value)}
                        className="w-full p-2 mb-4 border rounded"
                        required 
                    />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 mb-4 border rounded"
                        required 
                    />
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 mb-4 border rounded pr-10"
                            required 
                        />
                        <span 
                            className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeIcon className="h-5 w-5 text-gray-500" /> : <EyeSlashIcon className="h-5 w-5 text-gray-500" />}
                        </span>
                    </div>
                    
                    {/* Role Selection Dropdown */}
                    <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)} 
                        className="w-full p-2 mb-4 border rounded"
                        required
                    >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                    </select>

                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setIdCardImage(e.target.files[0])}
                        className="w-full p-2 mb-4 border rounded"
                        required 
                    />
                    <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Already have an account? <Link to="/" className="text-blue-600">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
