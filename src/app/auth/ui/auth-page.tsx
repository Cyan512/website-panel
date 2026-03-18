import { LoginForm } from "@/app/auth/ui/login-form";
import { RegisterForm } from "@/app/auth/ui/register-form";
import { useState } from "react";
import { CiLogin, CiUser } from "react-icons/ci";
import { MdOutlineSpa } from "react-icons/md";

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-paper-lightest via-paper-light to-paper-medium" />
            <div className="absolute top-0 -left-40 w-80 h-80 bg-brand/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -right-40 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl" />
            
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-[0.03]" 
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%237a3a18\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
            />

            <div className="w-full max-w-md relative z-10">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-light shadow-2xl shadow-accent-primary/30 mb-5">
                        <MdOutlineSpa className="w-10 h-10 text-paper-lightest" />
                    </div>
                    <h1 className="font-playfair text-4xl font-bold text-text-darkest mb-2 tracking-tight">
                        Kori Hotel
                    </h1>
                    <p className="text-text-muted font-lora text-sm">
                        Panel de Administración
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-paper-lightest/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-paper-dark/20 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-border-light/30">
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-4 px-6 text-sm font-semibold tracking-wide transition-all duration-300 relative ${
                                activeTab === 'login' 
                                    ? 'text-accent-primary' 
                                    : 'text-text-muted hover:text-text-secondary'
                            }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <CiLogin className="w-5 h-5" />
                                INICIAR SESIÓN
                            </span>
                            {activeTab === 'login' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary to-accent-light" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-4 px-6 text-sm font-semibold tracking-wide transition-all duration-300 relative ${
                                activeTab === 'register' 
                                    ? 'text-accent-primary' 
                                    : 'text-text-muted hover:text-text-secondary'
                            }`}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <CiUser className="w-5 h-5" />
                                REGISTRARSE
                            </span>
                            {activeTab === 'register' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary to-accent-light" />
                            )}
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-8">
                        {activeTab === 'login' ? (
                            <LoginForm />
                        ) : (
                            <RegisterForm />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-[10px] text-text-muted/50 tracking-widest uppercase">
                        © 2025 Kori Hotel • Sistema v2.1
                    </p>
                </div>
            </div>
        </div>
    )
}
