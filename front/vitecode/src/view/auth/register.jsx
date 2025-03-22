import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState(''); // Campo para o nome completo
    const [sector, setSector] = useState(''); // Campo para o setor
    const [personidvoalle, setPersonidvoalle] = useState(''); // Campo para o ID da Voalle
    const [loading, setLoading] = useState(false); // Estado para controlar o loading
    const [error, setError] = useState(''); // Estado para exibir erros
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true); // Ativar o loading
        setError(''); // Limpar erros anteriores

        try {
            // 1. Registrar o usuário
            const registerResponse = await fetch('http://localhost:1337/auth/local/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                }),
            });

            const registerData = await registerResponse.json();

            if (registerData.jwt) {
                localStorage.setItem('jwt', registerData.jwt); // Salva o token JWT

                // 2. Criar o perfil do usuário
                const profileResponse = await fetch('http://localhost:1337/profile/me', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${registerData.jwt}`, // Autentica com o token JWT
                    },
                    body: JSON.stringify({
                        email: email, // Email do usuário
                        fullname: fullname, // Nome completo
                        sector: sector, // Setor
                        personidvoalle: personidvoalle, // ID da Voalle
                        user: registerData.user.id, // Relaciona o perfil ao usuário
                    }),
                });

                const profileData = await profileResponse.json();

                if (profileData.id) {
                    alert('Registration and profile creation successful!');
                    navigate('/maps'); // Redireciona para a página de mapas
                } else {
                    setError('Profile creation failed. Please try again.'); // Exibe erro
                }
            } else {
                setError('Registration failed. Please try again.'); // Exibe erro
            }
        } catch (error) {
            console.error('Error during registration or profile creation:', error);
            setError('Something went wrong. Please try again.'); // Exibe erro
        } finally {
            setLoading(false); // Desativa o loading
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Exibe erros */}
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Full Name"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Sector"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Person ID Voalle"
                    value={personidvoalle}
                    onChange={(e) => setPersonidvoalle(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Register'} {/* Mostra loading */}
                </button>
            </form>
        </div>
    );
};

export default Register;