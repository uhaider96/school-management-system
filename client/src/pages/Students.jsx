import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { Plus, Users, Search, Edit3, Trash2, GraduationCap } from 'lucide-react';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassFilter, setSelectedClassFilter] = useState('');

    // Modal & Form States
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formData, setFormData] = useState({
        grNo: '',
        fullName: '',
        fatherName: '',
        classId: '',
        section: 'A',
        contactNumber: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Students and Classes from Backend
    const fetchData = async () => {
        try {
            setLoading(true);
            const [studentsRes, classesRes] = await Promise.all([
                API.get('/students'),
                API.get('/classes')
            ]);

            if (studentsRes.data.success) {
                setStudents(studentsRes.data.data);
            }
            if (classesRes.data.success) {
                setClasses(classesRes.data.data);
            }
        } catch (err) {
            console.error("Data load karne mein masla aaya:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Open Modal for New Admission
    const handleOpenCreateModal = () => {
        setEditingStudent(null);
        setFormData({
            grNo: '',
            fullName: '',
            fatherName: '',
            classId: classes[0]?._id || '',
            section: 'A',
            contactNumber: '',
            address: ''
        });
        setError('');
        setShowModal(true);
    };

    // Open Modal for Edit
    const handleOpenEditModal = (student) => {
        setEditingStudent(student);
        setFormData({
            grNo: student.grNo || '',
            fullName: student.fullName || student.name || '',
            fatherName: student.fatherName || '',
            classId: student.classId?._id || student.classId || '',
            section: student.section || 'A',
            contactNumber: student.contactNumber || '',
            address: student.address || ''
        });
        setError('');
        setShowModal(true);
    };

    // Delete Student Handler
    const handleDeleteStudent = async (id) => {
        if (!window.confirm('Kya aap sure hain ke is student ko delete karna chahte hain?')) return;

        try {
            const res = await API.delete(`/students/${id}`);
            if (res.data.success || res.status === 200) {
                fetchData();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Student delete nahi ho saka.');
        }
    };

    // Save (Create or Update) Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            let res;
            if (editingStudent) {
                res = await API.put(`/students/${editingStudent._id}`, formData);
            } else {
                res = await API.post('/students', formData);
            }

            if (res.data.success) {
                setShowModal(false);
                fetchData();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Student save karne mein error aaya.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter Students based on Search and Class
    const filteredStudents = students.filter(student => {
        const studentName = student.fullName || student.name || '';
        const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.grNo && student.grNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.fatherName && student.fatherName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesClass = selectedClassFilter === '' || student.classId?._id === selectedClassFilter;
        return matchesSearch && matchesClass;
    });
    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Students Directory</h2>
                    <p className="text-muted mb-0">Admit new students, manage student profiles and academic records</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-3 py-2"
                    onClick={handleOpenCreateModal}
                >
                    <Plus size={18} /> New Student Admission
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="card border-0 shadow-sm p-3 mb-4 bg-white rounded-3">
                <div className="row g-3">
                    <div className="col-md-8">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                                <Search size={18} className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control bg-light border-start-0"
                                placeholder="Search by Student Name, GR No, or Father Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select bg-light"
                            value={selectedClassFilter}
                            onChange={(e) => setSelectedClassFilter(e.target.value)}
                        >
                            <option value="">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id}>
                                    {cls.className || cls.name} (Sec {cls.section})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="card border-0 shadow-sm rounded-3 bg-white">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <Users size={40} className="mb-2 text-secondary" />
                            <p className="mb-0">No students found. Click "New Student Admission" to add one.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">GR No</th>
                                        <th>Student Name</th>
                                        <th>Father Name</th>
                                        <th>Class</th>
                                        <th>contact Number</th>
                                        <th>Address</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((std) => (
                                        <tr key={std._id}>
                                            <td className="ps-4 fw-bold text-primary">
                                                {std.grNo || 'N/A'}
                                            </td>
                                            <td className="fw-semibold text-dark">
                                                {std.fullName || std.name}
                                            </td>
                                            <td className="text-muted">
                                                {std.fatherName || 'N/A'}
                                            </td>
                                            <td>
                                                <span className="badge bg-primary-subtle text-primary px-2 py-1">
                                                    <GraduationCap size={14} className="me-1" />
                                                    {std.classId?.className || std.classId?.name || 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="text-muted small">
                                                {std.contactNumber || 'N/A'}
                                            </td>
                                            <td className="text-muted small">
                                                {std.address || 'N/A'}
                                            </td>
                                            <td className="text-end pe-4">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => handleOpenEditModal(std)}
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeleteStudent(std._id)}
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

            {/* Modal Form */}
            {showModal && (
                <div className="modal show d-block tab-modal-backdrop" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>

                            {/* Modal Header with Auto-Generated GR No Badge */}
                            <div className="modal-header border-0 pb-0 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <h5 className="modal-title fw-bold mb-0">
                                        {editingStudent ? 'Edit Student Profile' : 'New Student Admission'}
                                    </h5>

                                    {/* Auto Generated Badge */}
                                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-7">
                                        GR No: {editingStudent ? editingStudent.grNo : (formData.grNo || 'Auto-Generated on Save')}
                                    </span>
                                </div>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body py-3">
                                    {error && <div className="alert alert-danger py-2">{error}</div>}

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Student Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Ali Raza"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Father Name *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Muhammad Raza"
                                                value={formData.fatherName}
                                                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Select Class *</label>
                                            <select
                                                className="form-select"
                                                value={formData.classId}
                                                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                                required
                                            >
                                                <option value="">-- Choose Class --</option>
                                                {classes.map(cls => (
                                                    <option key={cls._id} value={cls._id}>
                                                        {cls.className || cls.name} (Sec {cls.section})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Contact Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. 03001234567"
                                                value={formData.contactNumber}
                                                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Address</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. House #123, Block A, Karachi"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Admit Student'}
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

export default Students;