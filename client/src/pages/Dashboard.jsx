import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { Users, BookOpen, CreditCard, DollarSign, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalClasses: 0,
        totalFeeCollected: 0,
        totalExpenses: 0,
        pendingFeesCount: 0
    });
    const [recentVouchers, setRecentVouchers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [studentsRes, classesRes, feesRes, expensesRes] = await Promise.all([
                API.get('/students').catch(() => ({ data: { success: false, data: [] } })),
                API.get('/classes').catch(() => ({ data: { success: false, data: [] } })),
                API.get('/fees').catch(() => ({ data: { success: false, data: [] } })),
                API.get('/expenses').catch(() => ({ data: { success: false, data: [] } }))
            ]);

            const students = studentsRes.data?.data || [];
            const classes = classesRes.data?.data || [];
            const fees = feesRes.data?.data || [];
            const expenses = expensesRes.data?.data || [];

            const totalFeeCollected = fees
                .filter(f => f.status === 'Paid')
                .reduce((sum, f) => sum + (f.totalAmount || 0), 0);

            const totalExpenses = expenses
                .reduce((sum, e) => sum + (e.amount || 0), 0);

            const pendingFeesCount = fees.filter(f => f.status === 'Unpaid').length;

            setStats({
                totalStudents: students.length,
                totalClasses: classes.length,
                totalFeeCollected,
                totalExpenses,
                pendingFeesCount
            });

            // Set last 5 recent fee vouchers for quick view
            setRecentVouchers(fees.slice(0, 5));

        } catch (error) {
            console.error("Error loading dashboard metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const netProfit = stats.totalFeeCollected - stats.totalExpenses;

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">School Overview Dashboard</h2>
                    <p className="text-muted mb-0">Real-time stats, financial health, and quick operational summary</p>
                </div>
                <div className="badge bg-light text-dark p-2 border fs-7 fw-semibold">
                    System Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : (
                <>
                    {/* KPI Summary Cards */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 bg-white rounded-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="text-muted small fw-semibold">Total Enrolled</span>
                                        <h3 className="fw-bold text-dark mb-0">{stats.totalStudents}</h3>
                                        <span className="text-muted small">Students</span>
                                    </div>
                                    <div className="p-3 bg-primary-subtle text-primary rounded-circle">
                                        <Users size={22} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 bg-white rounded-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="text-muted small fw-semibold">Active Grades</span>
                                        <h3 className="fw-bold text-dark mb-0">{stats.totalClasses}</h3>
                                        <span className="text-muted small">Classes & Sections</span>
                                    </div>
                                    <div className="p-3 bg-info-subtle text-info rounded-circle">
                                        <BookOpen size={22} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 bg-white rounded-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="text-muted small fw-semibold">Fee Collection</span>
                                        <h3 className="fw-bold text-success mb-0">PKR {stats.totalFeeCollected.toLocaleString()}</h3>
                                        <span className="text-success small fw-semibold">
                                            <TrendingUp size={14} /> Total Received
                                        </span>
                                    </div>
                                    <div className="p-3 bg-success-subtle text-success rounded-circle">
                                        <CreditCard size={22} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm p-3 bg-white rounded-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="text-muted small fw-semibold">Net Profit / Loss</span>
                                        <h3 className={`fw-bold mb-0 ${netProfit >= 0 ? 'text-primary' : 'text-danger'}`}>
                                            PKR {netProfit.toLocaleString()}
                                        </h3>
                                        <span className="text-muted small">After Expenses</span>
                                    </div>
                                    <div className="p-3 bg-secondary-subtle text-dark rounded-circle">
                                        <DollarSign size={22} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Vouchers Alert Banner */}
                    {stats.pendingFeesCount > 0 && (
                        <div className="alert alert-warning border-0 shadow-sm d-flex justify-content-between align-items-center mb-4 p-3 rounded-3">
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-warning text-dark rounded-pill">Action Needed</span>
                                <span>Aap ke paas <b>{stats.pendingFeesCount}</b> Unpaid Fee Vouchers hain jinki payment pending hai.</span>
                            </div>
                            <Link to="/vouchers" className="btn btn-sm btn-dark d-flex align-items-center gap-1">
                                View Vouchers <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    )}

                    {/* Quick Access & Recent Fee Activity */}
                    <div className="row g-4">
                        <div className="col-md-8">
                            <div className="card border-0 shadow-sm rounded-3 bg-white">
                                <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0">Recent Fee Activity</h5>
                                    <Link to="/vouchers" className="text-primary text-decoration-none small fw-semibold">
                                        View All
                                    </Link>
                                </div>
                                <div className="card-body p-0">
                                    {recentVouchers.length === 0 ? (
                                        <div className="text-center py-4 text-muted">No recent fee transactions</div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="ps-4">Student</th>
                                                        <th>Month</th>
                                                        <th>Amount</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recentVouchers.map(fee => (
                                                        <tr key={fee._id}>
                                                            <td className="ps-4 fw-semibold">
                                                                {fee.studentId?.fullName || fee.studentId?.name || 'Student'}
                                                            </td>
                                                            <td>{fee.month}</td>
                                                            <td className="fw-bold">PKR {(fee.totalAmount || 0).toLocaleString()}</td>
                                                            <td>
                                                                <span className={`badge px-2 py-1 ${fee.status === 'Paid' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
                                                                    }`}>
                                                                    {fee.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm rounded-3 bg-white p-3">
                                <h5 className="fw-bold mb-3">Quick Actions</h5>
                                <div className="d-grid gap-2">
                                    <Link to="/students" className="btn btn-outline-primary text-start p-3 rounded-3 d-flex justify-content-between align-items-center">
                                        <span>Admit New Student</span>
                                        <Users size={18} />
                                    </Link>
                                    <Link to="/classes" className="btn btn-outline-info text-dark text-start p-3 rounded-3 d-flex justify-content-between align-items-center">
                                        <span>Manage Classes</span>
                                        <BookOpen size={18} />
                                    </Link>
                                    <Link to="/vouchers" className="btn btn-outline-success text-start p-3 rounded-3 d-flex justify-content-between align-items-center">
                                        <span>Generate Vouchers</span>
                                        <CreditCard size={18} />
                                    </Link>
                                    <Link to="/transactions" className="btn btn-outline-danger text-start p-3 rounded-3 d-flex justify-content-between align-items-center">
                                        <span>Record Expense</span>
                                        <TrendingDown size={18} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    );
};

export default Dashboard;