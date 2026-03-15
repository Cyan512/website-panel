import { LoginForm } from "@/app/auth/ui/login-form";
import { RegisterForm } from "@/app/auth/ui/register-form";
import { useState } from "react";
import { CiLogin, CiUser } from "react-icons/ci";

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState('login');
    return (
        <div>
            <div>

            </div>
            <div>
                <button
                    onClick={() => setActiveTab('login')}
                >
                    <CiLogin />
                    <span >LOGIN</span>
                </button>
                <button
                    onClick={() => setActiveTab('register')}
                >
                    <CiUser />
                    <span >REGISTER</span>
                </button>
            </div>
            {activeTab === 'login' ? (
                <LoginForm />
            ) : (
                <RegisterForm />
            )}
            <div>
                <p>CYBEROPS © 2025 - Secure Authentication System v2.1</p>
            </div>
        </div>
    )
}
