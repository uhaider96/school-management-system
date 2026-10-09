import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Lock, Mail, KeyRound } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' | 'forgot'

    const [formData, setFormData] = useState({
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
                    localStorage.setItem('user', JSON.stringify(res.data.user));

                    // Hard redirect so router state freshes completely
                    window.location.href = '/dashboard';
                }
            } else if (mode === 'forgot') {
                const res = await API.post('/auth/forgot-password', {
                    email: formData.email,
                    newPassword: formData.newPassword
                });
                if (res.data?.success) {
                    setSuccess('Password updated successfully! Sign in with your new password.');
                    setTimeout(() => setMode('login'), 2000);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
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
                        {mode === 'forgot' && 'Reset your account password'}
                    </p>
                </div>

                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                {success && <div className="alert alert-success py-2 small">{success}</div>}

                <form onSubmit={handleSubmit}>
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

                    {mode === 'login' && (
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
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Reset Password')}
                    </button>
                </form>

                <div className="d-flex justify-content-center align-items-center small text-muted pt-2 border-top">
                    {mode === 'login' ? (
                        <button type="button" className="btn btn-link p-0 text-decoration-none small" onClick={() => setMode('forgot')}>
                            Forgot Password?
                        </button>
                    ) : (
                        <button type="button" className="btn btn-link p-0 text-decoration-none small" onClick={() => setMode('login')}>
                            Back to Sign In
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;