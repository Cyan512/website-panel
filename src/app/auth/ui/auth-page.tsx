import { LoginForm } from "@/app/auth/ui/login-form";
import { RegisterForm } from "@/app/auth/ui/register-form";
import { useState } from "react";
import { CiLogin, CiUser } from "react-icons/ci";
import { MdOutlineSpa } from "react-icons/md";

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary" />
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
            
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/20 mb-5">
                        <MdOutlineSpa className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">
                        Kori Hotel
                    </h1>
                    <p className="text-text-muted text-sm">
                        Panel de Administración
                    </p>
                </div>

                <div className="bg-bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-3.5 px-6 text-sm font-medium transition-all duration-200 ${
                                activeTab === 'login' 
                                    ? 'text-primary border-b-2 border-primary bg-primary/5' 
                                    : 'text-text-muted hover:text-text-secondary'
                            }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <CiLogin className="w-4 h-4" />
                                Iniciar Sesión
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-3.5 px-6 text-sm font-medium transition-all duration-200 ${
                                activeTab === 'register' 
                                    ? 'text-primary border-b-2 border-primary bg-primary/5' 
                                    : 'text-text-muted hover:text-text-secondary'
                            }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <CiUser className="w-4 h-4" />
                                Registrarse
                            </span>
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'login' ? (
                            <LoginForm />
                        ) : (
                            <RegisterForm />
                        )}
                    </div>
                </div>

                <div className="text-center mt-6">
                    <p className="text-[10px] text-text-muted/40 tracking-wider uppercase">
                        © 2025 Kori Hotel • Sistema v2.1
                    </p>
                </div>
            </div>
        </div>
    )
}
