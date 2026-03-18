import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/config/authClient";
import { InputField } from "@/app/shared/components/input";
import { sileo } from "sileo";
import { MdOutlineEmail, MdOutlineLock, MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor complete todos los campos");
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
            title: "Bienvenido",
            description: "Sesión iniciada correctamente",
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
    <form onSubmit={handleLogin} className="space-y-5">
      <InputField
        label="Correo Electrónico"
        type="email"
        placeholder="correo@ejemplo.com"
        value={email}
        disabled={loading}
        onChange={(e) => setEmail(e.target.value)}
        icon={<MdOutlineEmail className="w-5 h-5" />}
      />
      
      <div className="relative">
        <InputField
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          disabled={loading}
          onChange={(e) => setPassword(e.target.value)}
          icon={<MdOutlineLock className="w-5 h-5" />}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-[38px] text-text-muted hover:text-text-secondary transition-colors"
        >
          {showPassword ? (
            <MdOutlineVisibilityOff className="w-5 h-5" />
          ) : (
            <MdOutlineVisibility className="w-5 h-5" />
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20">
          <p className="text-danger text-sm text-center">{error}</p>
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 bg-gradient-to-r from-accent-primary to-accent-light text-paper-lightest font-semibold rounded-xl shadow-lg shadow-accent-primary/30 hover:shadow-xl hover:shadow-accent-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Iniciando...
          </span>
        ) : (
          "Iniciar Sesión"
        )}
      </button>
    </form>
  );
}
