import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/config/authClient";
import { InputField } from "@/app/shared/components/input";
import { sileo } from "sileo";

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          sileo.success({
            title: "Payment received",
            description: (
              <span className="text-green-500/50! font-medium! bg-red-500">
                We received your payment of $49.00.
              </span>
            ),
          });
          navigate("/dashboard");
        },
        onError: (ctx) => {
          setLoading(false);
          setError(ctx.error.message);
        },
      }
    );
  };
  return (
    <form onSubmit={handleLogin}>
      <InputField
        label="Email"
        type="text"
        placeholder="Email"
        value={email}
        disabled={loading}
        onChange={(e) => setEmail(e.target.value)}
      />
      <InputField
        label="Password"
        type="password"
        placeholder="Email"
        value={password}
        disabled={loading}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <span>
          {error}
        </span>
      )}
      <button type="submit">Login</button>
    </form>
  )
}
