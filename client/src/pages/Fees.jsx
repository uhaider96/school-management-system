import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { Plus, CreditCard, Search, CheckCircle, Printer } from 'lucide-react';

const Fees = () => {
    const [fees, setFees] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal States
    const [showGenModal, setShowGenModal] = useState(false);
    const [genData, setGenData] = useState({
        classId: '',
        month: 'October 2026',
        dueDate: '',
        tuitionFee: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Fee Records & Classes
    const fetchData = async () => {
        try {
            setLoading(true);
            const [feesRes, classesRes] = await Promise.all([
                API.get('/fees').catch(() => ({ data: { success: false, data: [] } })),
                API.get('/classes').catch(() => ({ data: { success: false, data: [] } }))
            ]);

            if (feesRes.data && feesRes.data.success) {
                setFees(feesRes.data.data || []);
            }
            if (classesRes.data && classesRes.data.success) {
                setClasses(classesRes.data.data || []);
            }
        } catch (err) {
            console.error("Failed to load fee data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Class Selection Change in Voucher Generator
    const handleClassChange = (classId) => {
        const selectedCls = classes.find(c => c._id === classId);
        setGenData(prev => ({
            ...prev,
            classId,
            tuitionFee: selectedCls ? (selectedCls.monthlyTuitionFee || selectedCls.monthlyFee || '') : ''
        }));
    };

    // Generate Bulk Vouchers Handler
    const handleGenerateVouchers = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const res = await API.post('/fees/generate-class-vouchers', genData);
            if (res.data && res.data.success) {
                setShowGenModal(false);
                fetchData();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate vouchers.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Mark Fee as Paid Handler
    const handleMarkAsPaid = async (feeId) => {
        if (!window.confirm('can you mark this fee as paid?')) return;

        try {
            const res = await API.put(`/fees/${feeId}/pay`);
            if (res.data && res.data.success) {
                fetchData();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Payment update nahi ho saki.');
        }
    };

    // Print Voucher Handler
    const handlePrintVoucher = (fee) => {
        const printWindow = window.open('', '_blank', 'width=900,height=800');
        if (!printWindow) return alert('Pop-up block ho gaya hai. Browser options se pop-ups allow karein.');

        const studentName = fee?.studentId?.fullName || fee?.studentId?.name || 'N/A';
        const grNo = fee?.studentId?.grNo || 'N/A';
        const className = fee?.classId?.className || fee?.classId?.name || 'N/A';
        const section = fee?.classId?.section ? `(${fee.classId.section})` : '';
        const phone = fee?.studentId?.phone || 'N/A';
        const month = fee?.month || 'N/A';
        const dueDate = fee?.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A';
        const tuitionFee = fee?.tuitionFee || 0;
        const otherCharges = fee?.otherCharges || 0;
        const totalAmount = fee?.totalAmount || 0;
        const status = fee?.status || 'Unpaid';

        const copies = ['BANK COPY', 'SCHOOL COPY', 'STUDENT COPY'];

        const renderVoucherCopy = (title) => `
        <div class="voucher">
            <div class="header">
                <div class="school-title">AL-KHIDMAT ACADEMY & SCHOOL</div>
                <div class="voucher-title">MONTHLY FEE VOUCHER (${title})</div>
            </div>
            
            <div class="info-grid">
                <div><b>GR No:</b> ${grNo}</div>
                <div><b>Issue Date:</b> ${new Date().toLocaleDateString()}</div>
                <div><b>Student:</b> ${studentName}</div>
                <div><b>Due Date:</b> ${dueDate}</div>
                <div><b>Class:</b> ${className} ${section}</div>
                <div><b>Month:</b> ${month}</div>
                <div><b>Phone:</b> ${phone}</div>
                <div><b>Status:</b> <span class="status-tag">${status}</span></div>
            </div>

            <table class="fee-table">
                <thead>
                    <tr>
                        <th>Particulars</th>
                        <th style="text-align: right;">Amount (PKR)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Tuition Fee</td>
                        <td style="text-align: right;">${tuitionFee.toLocaleString()}</td>
                    </tr>
                    ${otherCharges > 0 ? `
                    <tr>
                        <td>Other / Exam Charges</td>
                        <td style="text-align: right;">${otherCharges.toLocaleString()}</td>
                    </tr>` : ''}
                    <tr class="total-row">
                        <td><b>Total Payable Amount</b></td>
                        <td style="text-align: right;"><b>PKR ${totalAmount.toLocaleString()}</b></td>
                    </tr>
                </tbody>
            </table>

            <div class="signatures">
                <div>
                    <span class="sig-line"></span>
                    <p>Cashier / Officer</p>
                </div>
                <div>
                    <span class="sig-line"></span>
                    <p>Parent / Depositor</p>
                </div>
            </div>
        </div>
    `;

        const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Fee Voucher - ${grNo}</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 8mm;
                }
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                body {
                    background: #fff;
                    color: #000;
                    padding: 5px;
                }
                .voucher-container {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .voucher {
                    border: 1.5px solid #000;
                    padding: 10px 14px;
                    border-radius: 4px;
                    background: #fff;
                    font-size: 11px;
                }
                .header {
                    text-align: center;
                    border-bottom: 1.5px solid #000;
                    padding-bottom: 4px;
                    margin-bottom: 8px;
                }
                .school-title {
                    font-size: 15px;
                    font-weight: bold;
                    letter-spacing: 0.5px;
                }
                .voucher-title {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    margin-top: 2px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px 12px;
                    margin-bottom: 8px;
                    font-size: 11px;
                }
                .status-tag {
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .fee-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 8px;
                    font-size: 11px;
                }
                .fee-table th, .fee-table td {
                    border: 1px solid #000;
                    padding: 4px 8px;
                }
                .fee-table th {
                    background-color: #f0f0f0;
                }
                .total-row {
                    background-color: #fafafa;
                }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 12px;
                    padding: 0 10px;
                }
                .signatures div {
                    text-align: center;
                    width: 35%;
                }
                .sig-line {
                    display: block;
                    border-top: 1px dashed #000;
                    margin-bottom: 3px;
                }
                .cut-line {
                    border-top: 1.5px dashed #666;
                    text-align: center;
                    position: relative;
                    margin: 2px 0;
                }
                .cut-text {
                    position: relative;
                    top: -9px;
                    background: #fff;
                    padding: 0 8px;
                    font-size: 9px;
                    color: #555;
                }
                @media print {
                    body { padding: 0; }
                    .cut-line { margin: 2px 0; }
                }
            </style>
        </head>
        <body>
            <div class="voucher-container">
                ${copies.map((title, index) => `
                    ${renderVoucherCopy(title)}${index < copies.length - 1 ? `
                        <div class="cut-line">
                            <span class="cut-text">✂ --------------------------- Cut Here --------------------------- ✂</span>
                        </div>
                    ` : ''}
                `).join('')}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `;

        printWindow.document.write(printHTML);
        printWindow.document.close();
    };

    // Filtered Fees List safely
    const filteredFees = (fees || []).filter(f => {
        const studentName = f?.studentId?.fullName || f?.studentId?.name || '';
        const grNo = f?.studentId?.grNo || '';
        const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            grNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || f?.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Fee Management & Vouchers</h2>
                    <p className="text-muted mb-0">Generate monthly class vouchers, manage collections, and print receipts</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-3 py-2"
                    onClick={() => setShowGenModal(true)}
                >
                    <Plus size={18} /> Generate Class Vouchers
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
                                placeholder="Search by Student Name or GR No..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select bg-light"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Payment Statuses</option>
                            <option value="Unpaid">Unpaid Only</option>
                            <option value="Paid">Paid Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Fees Table */}
            <div className="card border-0 shadow-sm rounded-3 bg-white">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : filteredFees.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <CreditCard size={40} className="mb-2 text-secondary" />
                            <p className="mb-0">No fee vouchers found. Click "Generate Class Vouchers" to create some.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">GR No</th>
                                        <th>Student Name</th>
                                        <th>Month</th>
                                        <th>Total Amount</th>
                                        <th>Status</th>
                                        <th>Due Date</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFees.map((fee) => (
                                        <tr key={fee._id}>
                                            <td className="ps-4 fw-bold text-primary">
                                                {fee?.studentId?.grNo || 'N/A'}
                                            </td>
                                            <td className="fw-semibold text-dark">
                                                {fee?.studentId?.fullName || fee?.studentId?.name || 'Unassigned'}
                                            </td>
                                            <td>{fee?.month || ''}</td>
                                            <td className="fw-bold text-dark">
                                                PKR {(fee?.totalAmount || 0).toLocaleString()}
                                            </td>
                                            <td>
                                                <span className={`badge px-2 py-1 ${fee?.status === 'Paid'
                                                    ? 'bg-success-subtle text-success border border-success-subtle'
                                                    : 'bg-danger-subtle text-danger border border-danger-subtle'
                                                    }`}>
                                                    {fee?.status || 'Unpaid'}
                                                </span>
                                            </td>
                                            <td className="text-muted small">
                                                {fee?.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="text-end pe-4">
                                                {fee?.status === 'Unpaid' && (
                                                    <button
                                                        className="btn btn-sm btn-success me-2 d-inline-flex align-items-center gap-1"
                                                        onClick={() => handleMarkAsPaid(fee._id)}
                                                    >
                                                        <CheckCircle size={14} /> Pay
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                                    onClick={() => handlePrintVoucher(fee)}
                                                >
                                                    <Printer size={14} /> Print Slip
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

            {/* Generate Bulk Class Vouchers Modal */}
            {showGenModal && (
                <div className="modal show d-block tab-modal-backdrop" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Generate Class Fee Vouchers</h5>
                                <button type="button" className="btn-close" onClick={() => setShowGenModal(false)}></button>
                            </div>

                            <form onSubmit={handleGenerateVouchers}>
                                <div className="modal-body py-3">
                                    {error && <div className="alert alert-danger py-2">{error}</div>}

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Select Class *</label>
                                        <select
                                            className="form-select"
                                            value={genData.classId}
                                            onChange={(e) => handleClassChange(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Select Class --</option>
                                            {classes.map(cls => (
                                                <option key={cls._id} value={cls._id}>
                                                    {cls.className || cls.name} (Sec {cls.section})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Fee Month *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. October 2026"
                                            value={genData.month}
                                            onChange={(e) => setGenData({ ...genData, month: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Monthly Tuition Fee (PKR) *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Fee amount"
                                            value={genData.tuitionFee}
                                            onChange={(e) => setGenData({ ...genData, tuitionFee: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Due Date *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={genData.dueDate}
                                            onChange={(e) => setGenData({ ...genData, dueDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowGenModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                                        {isSubmitting ? 'Generating...' : 'Generate Vouchers'}
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

export default Fees;