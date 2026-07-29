import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/api";

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState("verifying");

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                await axios.get(`/auth/verify/${token}`);
                setStatus("success");
            } catch (err) {
                setStatus("error");
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div style={styles.container}>
            {status === "verifying" && <h2>Verifying your email...</h2>}

            {status === "success" && (
                <>
                    <h2>✅ Email Verified!</h2>
                    <p>You can now login.</p>
                </>
            )}

            {status === "error" && (
                <>
                    <h2>❌ Verification Failed</h2>
                    <p>Invalid or expired link.</p>
                </>
            )}
        </div>
    );
};

const styles = {
    container: {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif"
    }
};

export default VerifyEmail;