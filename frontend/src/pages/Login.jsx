import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false); // ✅ Loading state
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); // ✅ Show loading indicator

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                console.log("User data stored in localStorage:", data.user);
                navigate("/dashboard");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setTimeout(() => setLoading(false), 500); // ✅ Small delay to make loading visible
        }
    };

    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-sky-300 to-purple-400 text-white px-4 shadow-lg shadow-blue-200/50">

            <h1 className="text-2xl md:text-3xl font-bold text-center">Leave Application Portal</h1>
            <h2 className="text-sm md:text-lg text-center mb-6">Department of Computer Science and Engineering, SGGSIE&T</h2>
            
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm md:w-96 text-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                
                <form onSubmit={handleLogin}>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 mb-4 border rounded focus:ring-2 focus:ring-blue-400"
                        required 
                    />
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 mb-4 border rounded pr-10 focus:ring-2 focus:ring-blue-400"
                            required 
                        />
                        <span 
                            className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeIcon className="h-5 w-5 text-gray-500" /> : <EyeSlashIcon className="h-5 w-5 text-gray-500" />}
                        </span>
                    </div>

                    {/* ✅ Login Button with Loading Indicator */}
                    <button 
                        type="submit" 
                        className={`w-full text-white p-2 rounded flex justify-center items-center 
                            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`} 
                        disabled={loading}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full" viewBox="0 0 24 24"></svg>
                        ) : "Login"}
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
