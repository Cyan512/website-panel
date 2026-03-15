import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/config/authClient";

export function RegisterForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password || !name) {
            setError("Please fill in all fields");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        await authClient.signUp.email(
            {
                email,
                password,
                name,
            },
            {
                onRequest: () => {
                    setLoading(true);
                },
                onSuccess: () => {
                    setLoading(false);
                    navigate("/login");
                },
                onError: (ctx) => {
                    setLoading(false);
                    setError(ctx.error.message);
                },
            }
        );
    };
    return (
        <form onSubmit={handleRegister}>
            <div>
                <label>Name</label>
                <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading} />
            </div>
            <div>
                <label>Email</label>
                <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading} />
            </div>
            <div>
                <label>Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading} />
            </div>
            {error && (
                <span>
                    {error}
                </span>
            )}
            <button type="submit">
                sd  
            </button>
        </form>
    )
}
