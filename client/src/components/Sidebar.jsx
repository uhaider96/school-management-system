import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    BookOpen, 
    Users, 
    Receipt, 
    DollarSign, 
    LogOut 
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="d-flex flex-column bg-dark text-white p-3 vh-100 position-fixed" style={{ width: '250px' }}>
            <div className="mb-4 text-center">
                <h4 className="fw-bold text-primary mb-0">SMS Portal</h4>
                <small className="text-muted">School Management</small>
            </div>

            <hr className="bg-secondary" />

            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item mb-2">
                    <Link to="/dashboard" className={`nav-link text-white d-flex align-items-center gap-2 ${isActive('/dashboard') ? 'active bg-primary' : ''}`}>
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>
                </li>
                <li className="nav-item mb-2">
                    <Link to="/classes" className={`nav-link text-white d-flex align-items-center gap-2 ${isActive('/classes') ? 'active bg-primary' : ''}`}>
                        <BookOpen size={18} />
                        Classes
                    </Link>
                </li>
                <li className="nav-item mb-2">
                    <Link to="/students" className={`nav-link text-white d-flex align-items-center gap-2 ${isActive('/students') ? 'active bg-primary' : ''}`}>
                        <Users size={18} />
                        Students
                    </Link>
                </li>
                <li className="nav-item mb-2">
                    <Link to="/vouchers" className={`nav-link text-white d-flex align-items-center gap-2 ${isActive('/vouchers') ? 'active bg-primary' : ''}`}>
                        <Receipt size={18} />
                        Fee Vouchers
                    </Link>
                </li>
                <li className="nav-item mb-2">
                    <Link to="/transactions" className={`nav-link text-white d-flex align-items-center gap-2 ${isActive('/transactions') ? 'active bg-primary' : ''}`}>
                        <DollarSign size={18} />
                        Transactions
                    </Link>
                </li>
            </ul>

            <hr className="bg-secondary" />

            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <span className="d-block fw-semibold">{user?.name}</span>
                    <span className="badge bg-secondary">{user?.role}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm p-2" title="Logout">
                    <LogOut size={16} />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;