import { useState } from 'react';
import { useNavigate } from 'react'
import API from '../services/api';
import { Lock, Mail, User as UserIcon, KeyRound } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        newPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const res = await API.post('/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                if (res.data?.token) {
                    localStorage.setItem('token', res.data.token);
                    navigate('/dashboard');
                }
            } else if (mode === 'register') {
                const res = await API.post('/auth/register', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                if (res.data?.success) {
                    setSuccess('Registration successful! Please login.');
                    setTimeout(() => setMode('login'), 2000);
                }
            } else if (mode === 'forgot') {
                const res = await API.post('/auth/forgot-password', {
                    email: formData.email,
                    newPassword: formData.newPassword
                });
                if (res.data?.success) {
                    setSuccess('Password updated successfully! Redirecting to login...');
                    setTimeout(() => setMode('login'), 2000);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Kuch masla hua, dubara koshish karein.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card border-0 shadow-lg p-4 rounded-4" style={{ maxWidth: '420px', width: '100%' }}>
                <div className="text-center mb-4">
                    <h3 className="fw-bold text-primary">AL-KHIDMAT ACADEMY</h3>
                    <p className="text-muted small">
                        {mode === 'login' && 'Sign in to access school portal'}
                        {mode === 'register' && 'Create a new admin account'}
                        {mode === 'forgot' && 'Reset your password'}
                    </p>
                </div>

                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                {success && <div className="alert alert-success py-2 small">{success}</div>}

                <form onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <div className="mb-3">
                            <label className="form-label small fw-semibold">Full Name</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white"><UserIcon size={18} /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Admin Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label small fw-semibold">Email Address</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white"><Mail size={18} /></span>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {mode !== 'forgot' && (
                        <div className="mb-3">
                            <label className="form-label small fw-semibold">Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white"><Lock size={18} /></span>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {mode === 'forgot' && (
                        <div className="mb-3">
                            <label className="form-label small fw-semibold">New Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white"><KeyRound size={18} /></span>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Enter new password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mb-3" disabled={loading}>
                        {loading ? 'Processing...' : (
                            mode === 'login' ? 'Sign In' : mode === 'register' ? 'Register Account' : 'Reset Password'
                        )}
                    </button>
                </form>

                {/* Options Footer */}
                <div className="d-flex justify-content-between align-items-center small text-muted pt-2 border-top">
                    {mode === 'login' ? (
                        <>
                            <button className="btn btn-link p-0 text-decoration-none small" onClick={() => setMode('forgot')}>
                                Forgot Password?
                            </button>
                            <button className="btn btn-link p-0 text-decoration-none small fw-semibold" onClick={() => setMode('register')}>
                                Create Account
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-link p-0 text-decoration-none small w-100 text-center" onClick={() => setMode('login')}>
                            Back to Sign In
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;