import { useEffect, useState } from "react";
import axios from "../utils/api";
import "./Profile.css";

const Profile = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");

                const res = await axios.get("/auth/profile");

                setData(res.data);
            } catch (err) {
                alert("Failed to load profile");
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = async () => {
        try {
            const res = await axios.post("/auth/logout");

            // clear tokens from frontend
            localStorage.removeItem("accessToken");

            window.location.href = "/";
        } catch (err) {
            console.error(err.response?.data || err.message);
            throw err;
        }
    };

    if (!data) return <div className="loading">Loading...</div>;

    const { user, stats } = data;

    return (
        <div className="profile-page">

            <div className="profile-card">

                {/* Header */}
                <div className="profile-header">
                    <div>
                        <h2>Profile</h2>
                        <p className="email">{user.email}</p>
                    </div>

                    <div className="user-id">
                        ID: {user._id.slice(0, 6)}...
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-grid">

                    <div className="stat-box">
                        <p>Total Todos</p>
                        <h3>{stats.total}</h3>
                    </div>

                    <div className="stat-box completed">
                        <p>Completed</p>
                        <h3>{stats.completed}</h3>
                    </div>

                    <div className="stat-box pending">
                        <p>Pending</p>
                        <h3>{stats.pending}</h3>
                    </div>

                </div>

                {/* Account Info */}
                <div className="account-section">
                    <h4>Account Info</h4>

                    <div className="account-box">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>User ID:</strong> {user._id}</p>
                    </div>
                </div>

                {/* Logout Button */}
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>

            </div>

        </div>
    );
};

export default Profile;