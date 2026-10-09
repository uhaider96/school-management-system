import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { Plus, DollarSign, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

const Transactions = () => {
    const [expenses, setExpenses] = useState([]);
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Expense Modal States
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Utility Bill',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Expenses & Fee Collections
    const fetchData = async () => {
        try {
            setLoading(true);
            const [expenseRes, feeRes] = await Promise.all([
                API.get('/expenses').catch(() => ({ data: { success: false, data: [] } })),
                API.get('/fees').catch(() => ({ data: { success: false, data: [] } }))
            ]);

            if (expenseRes.data && expenseRes.data.success) {
                setExpenses(expenseRes.data.data || []);
            }
            if (feeRes.data && feeRes.data.success) {
                setFees(feeRes.data.data || []);
            }
        } catch (err) {
            console.error("Failed to load transactions data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Calculate Totals
    const totalIncome = (fees || [])
        .filter(f => f.status === 'Paid')
        .reduce((sum, f) => sum + (f.totalAmount || 0), 0);

    const totalExpense = (expenses || [])
        .reduce((sum, e) => sum + (e.amount || 0), 0);

    const netProfit = totalIncome - totalExpense;

    // Add Expense Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const res = await API.post('/expenses', formData);
            if (res.data && res.data.success) {
                setShowModal(false);
                setFormData({
                    title: '',
                    category: 'Utility Bill',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    description: ''
                });
                fetchData();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add expense.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Expense Handler
    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Kya aap is expense record ko delete karna chahte hain?')) return;

        try {
            const res = await API.delete(`/expenses/${id}`);
            if (res.data && res.data.success) {
                fetchData();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Expense delete nahi ho saka.');
        }
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Transactions & Expenses</h2>
                    <p className="text-muted mb-0">Track total revenue, school expenses, and net profit</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-3 py-2"
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={18} /> Record New Expense
                </button>
            </div>

            {/* Financial Summary Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-3 bg-white rounded-3 border-start border-4 border-success">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <span className="text-muted small fw-semibold">Total Fee Received</span>
                                <h3 className="fw-bold text-success mb-0">PKR {totalIncome.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-success-subtle rounded-circle text-success">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-3 bg-white rounded-3 border-start border-4 border-danger">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <span className="text-muted small fw-semibold">Total Expenses</span>
                                <h3 className="fw-bold text-danger mb-0">PKR {totalExpense.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-danger-subtle rounded-circle text-danger">
                                <TrendingDown size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-3 bg-white rounded-3 border-start border-4 border-primary">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <span className="text-muted small fw-semibold">Net Balance / Profit</span>
                                <h3 className={`fw-bold mb-0 ${netProfit >= 0 ? 'text-primary' : 'text-danger'}`}>
                                    PKR {netProfit.toLocaleString()}
                                </h3>
                            </div>
                            <div className="p-3 bg-primary-subtle rounded-circle text-primary">
                                <DollarSign size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expenses List Table */}
            <div className="card border-0 shadow-sm rounded-3 bg-white">
                <div className="card-header bg-white border-0 py-3">
                    <h5 className="fw-bold mb-0">Recorded Expenses List</h5>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <DollarSign size={40} className="mb-2 text-secondary" />
                            <p className="mb-0">No expenses recorded yet. Click "Record New Expense" to add one.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Title</th>
                                        <th>Category</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((exp) => (
                                        <tr key={exp._id}>
                                            <td className="ps-4 fw-semibold text-dark">{exp.title}</td>
                                            <td>
                                                <span className="badge bg-secondary-subtle text-dark border px-2 py-1">
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="fw-bold text-danger">
                                                PKR {(exp.amount || 0).toLocaleString()}
                                            </td>
                                            <td className="text-muted small">
                                                {exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="text-muted small">{exp.description || '-'}</td>
                                            <td className="text-end pe-4">
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Delete Expense"
                                                    onClick={() => handleDeleteExpense(exp._id)}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Expense Modal */}
            {showModal && (
                <div className="modal show d-block tab-modal-backdrop" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Record New Expense</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body py-3">
                                    {error && <div className="alert alert-danger py-2">{error}</div>}

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Expense Title *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Electric Bill September, Printer Ink"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Category *</label>
                                        <select
                                            className="form-select"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="Utility Bill">Utility Bill</option>
                                            <option value="Salaries">Salaries</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Stationery">Stationery</option>
                                            <option value="Rent">Rent</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Amount (PKR) *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="e.g. 15000"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Date *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Description / Remarks</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Optional details"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save Expense'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Transactions;