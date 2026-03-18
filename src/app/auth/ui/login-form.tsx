import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/config/authClient";
import { InputField } from "@/app/shared/components/input";
import { Button } from "@/app/shared/components/ui";
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
      
      <Button type="submit" isLoading={loading} className="w-full">
        {loading ? "Iniciando..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
}
