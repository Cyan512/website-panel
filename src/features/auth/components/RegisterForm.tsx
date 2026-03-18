import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/config/authClient";
import { InputField } from "@/components";
import { Button } from "@/components";
import { MdOutlineEmail, MdOutlineLock, MdOutlinePerson, MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";

export function RegisterForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password || !name) {
            setError("Por favor complete todos los campos");
            return;
        }

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres");
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
        <form onSubmit={handleRegister} className="space-y-5">
            <InputField
                label="Nombre Completo"
                type="text"
                placeholder="Ej: Juan Pérez"
                value={name}
                disabled={loading}
                onChange={(e) => setName(e.target.value)}
                icon={<MdOutlinePerson className="w-5 h-5" />}
            />
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
                {loading ? "Registrando..." : "Crear Cuenta"}
            </Button>
        </form>
    );
}
