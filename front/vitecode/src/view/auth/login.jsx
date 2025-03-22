import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:1337/auth/local', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: email,
                    password: password,
                }),
            });

            const data = await response.json();
            if (data.jwt) {
                localStorage.setItem('jwt', data.jwt);
                navigate('/maps');
            } else {
                alert('Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const handleRegisterRedirect = () => {
        navigate('/register'); // Redireciona para a tela de registro
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            {/* Botão para redirecionar para a tela de registro */}
            <button
                type="button" // Use type="button" para evitar que o formulário seja enviado
                onClick={handleRegisterRedirect}
                style={{ marginTop: '10px' }} // Estilo opcional
            >
                Register
            </button>
        </div>
    );
};

export default Login;