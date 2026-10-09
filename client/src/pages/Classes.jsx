import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { Plus, BookOpen, Edit3, Trash2 } from 'lucide-react';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form States
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null); // null = Add mode, object = Edit mode
    const [name, setName] = useState('');
    const [section, setSection] = useState('A');
    const [monthlyFee, setMonthlyFee] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Classes List from Backend
    const fetchClasses = async () => {
        try {
            const res = await API.get('/classes');
            if (res.data.success) {
                setClasses(res.data.data);
            }
        } catch (err) {
            console.error("Failed to load classes", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    // Open Modal for Create
    const handleOpenCreateModal = () => {
        setEditingClass(null);
        setName('');
        setSection('A');
        setMonthlyFee('');
        setError('');
        setShowModal(true);
    };

    // Open Modal for Edit
    const handleOpenEditModal = (cls) => {
        setEditingClass(cls);
        setName(cls.className || cls.name || '');
        setSection(cls.section || 'A');
        setMonthlyFee(cls.monthlyTuitionFee || cls.monthlyFee || '');
        setError('');
        setShowModal(true);
    };

    // Delete Class Handler
    const handleDeleteClass = async (id) => {
        if (!window.confirm('Kya aap sure hain ke is class ko delete karna chahte hain?')) return;

        try {
            const res = await API.delete(`/classes/${id}`);
            if (res.data.success || res.status === 200) {
                fetchClasses(); // List refresh karein
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Class delete karne mein masla aaya.');
        }
    };

    // Save (Create or Update) Class Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const payload = {
            className: name.trim(),
            section,
            monthlyTuitionFee: Number(monthlyFee)
        };

        try {
            let res;
            if (editingClass) {
                // Update existing class (PUT /api/classes/:id)
                res = await API.put(`/classes/${editingClass._id}`, payload);
            } else {
                // Create new class (POST /api/classes)
                res = await API.post('/classes', payload);
            }

            if (res.data.success) {
                setShowModal(false);
                fetchClasses(); // Refresh List
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save class.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Classes Management</h2>
                    <p className="text-muted mb-0">Manage academic grades, sections, and monthly fee structure</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-3 py-2"
                    onClick={handleOpenCreateModal}
                >
                    <Plus size={18} /> Add New Class
                </button>
            </div>

            {/* Classes Table */}
            <div className="card border-0 shadow-sm rounded-3 bg-white">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <BookOpen size={40} className="mb-2 text-secondary" />
                            <p className="mb-0">No classes created yet. Click "Add New Class" to create one.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Class Name</th>
                                        <th>Section</th>
                                        <th>Monthly Fee</th>
                                        <th>Created Date</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.map((cls) => (
                                        <tr key={cls._id}>
                                            <td className="ps-4 fw-semibold text-dark">
                                                <div className="d-flex align-items-center gap-2">
                                                    <BookOpen size={16} className="text-primary" />
                                                    {cls.className || cls.name}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-secondary-subtle text-secondary px-2 py-1">
                                                    Section {cls.section}
                                                </span>
                                            </td>
                                            <td className="fw-semibold text-success">
                                                PKR {(cls.monthlyTuitionFee || cls.monthlyFee || 0).toLocaleString()}
                                            </td>
                                            <td className="text-muted small">
                                                {cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="text-end pe-4">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    title="Edit Class"
                                                    onClick={() => handleOpenEditModal(cls)}
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Delete Class"
                                                    onClick={() => handleDeleteClass(cls._id)}
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

            {/* Bootstrap Modal (Create / Edit) */}
            {showModal && (
                <div className="modal show d-block tab-modal-backdrop" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">
                                    {editingClass ? 'Edit Class' : 'Add New Class'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body py-3">
                                    {error && <div className="alert alert-danger py-2">{error}</div>}

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Class Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Class 1, Class 10"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Section</label>
                                        <select
                                            className="form-select"
                                            value={section}
                                            onChange={(e) => setSection(e.target.value)}
                                        >
                                            <option value="A">Section A</option>
                                            <option value="B">Section B</option>
                                            <option value="C">Section C</option>
                                            <option value="D">Section D</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Monthly Fee (PKR)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="e.g. 5000"
                                            value={monthlyFee}
                                            onChange={(e) => setMonthlyFee(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : editingClass ? 'Update Class' : 'Save Class'}
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

export default Classes;