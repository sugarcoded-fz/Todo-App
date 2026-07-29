import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true
});

// attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// handle expiry
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;


            try {
                const res = await axios.post("/api/auth/refresh", {}, {
                    withCredentials: true
                });

                localStorage.setItem("accessToken", res.data.accessToken);

                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;

                return api(originalRequest);

            } catch (refreshError) {

                try {
                    await axios.post("/api/auth/logout", {}, {
                        withCredentials: true
                    });
                } catch (_) {}

                // CLEAR FRONTEND STATE
                localStorage.removeItem("accessToken");
                window.location.href = "/login"; 
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(err);
    }
);

export default api;