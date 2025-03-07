import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                navigate("/dashboard");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gray-900 text-white px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-center">Leave Application Portal</h1>
            <h2 className="text-sm md:text-lg text-center mb-6">Department of Computer Science and Engineering, SGGSIE&T</h2>
            
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm md:w-96 text-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                <form onSubmit={handleLogin}>
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
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        Login
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Don't have an account? <Link to="/signup" className="text-blue-600">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
