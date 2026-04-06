import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Filter } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CATEGORIES = ['salary','freelance','investment','rental','food','transport',
  'utilities','rent','entertainment','healthcare','education','shopping','other'];

export default function RecordsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ type: '', category: '', from: '', to: '', page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ amount:'', type:'income', category:'salary', date:'', notes:'' });
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== ''));
      const res = await api.get('/records', { params });
      setRecords(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, [filters]);

  const openCreate = () => {
    setEditing(null);
    setForm({ amount:'', type:'income', category:'salary', date:'', notes:'' });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditing(r._id);
    setForm({ amount: r.amount, type: r.type, category: r.category,
      date: r.date?.slice(0,10), notes: r.notes });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.patch(`/records/${editing}`, form);
      else await api.post('/records', form);
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving record.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Soft-delete this record?')) return;
    await api.delete(`/records/${id}`);
    fetchRecords();
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Financial Records</h1>
            <p className="page-sub">{pagination.total || 0} total records</p>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={16}/> Add Record
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value, page:1})}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value, page:1})}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" placeholder="From" value={filters.from}
            onChange={e => setFilters({...filters, from: e.target.value, page:1})}/>
          <input type="date" placeholder="To" value={filters.to}
            onChange={e => setFilters({...filters, to: e.target.value, page:1})}/>
          <button className="btn btn-ghost" onClick={() => setFilters({type:'',category:'',from:'',to:'',page:1})}>
            Clear
          </button>
        </div>

        {/* Table */}
        <div className="table-card">
          {loading ? <div className="loading-state">Loading...</div> : (
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Notes</th><th>By</th>
                  {isAdmin && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={7} style={{textAlign:'center', padding:'2rem', color:'var(--color-text-muted)'}}>
                    No records found.</td></tr>
                ) : records.map(r => (
                  <tr key={r._id}>
                    <td>{r.date?.slice(0,10)}</td>
                    <td><span className={`badge badge-${r.type}`}>{r.type}</span></td>
                    <td>{r.category}</td>
                    <td className={`amount ${r.type}`} style={{fontVariantNumeric:'tabular-nums'}}>
                      {r.type === 'income' ? '+' : '-'}₹{r.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="notes-cell">{r.notes || '—'}</td>
                    <td>{r.createdBy?.name || '—'}</td>
                    {isAdmin && (
                      <td className="actions-cell">
                        <button onClick={() => openEdit(r)} className="icon-btn" title="Edit"><Pencil size={15}/></button>
                        <button onClick={() => handleDelete(r._id)} className="icon-btn danger" title="Delete"><Trash2 size={15}/></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${p === filters.page ? 'active' : ''}`}
                onClick={() => setFilters({...filters, page: p})}>{p}</button>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>{editing ? 'Edit Record' : 'New Record'}</h2>
              <form onSubmit={handleSubmit}>
                <label>Amount
                  <input type="number" step="0.01" required value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}/>
                </label>
                <label>Type
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </label>
                <label>Category
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label>Date
                  <input type="date" required value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}/>
                </label>
                <label>Notes
                  <input type="text" value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})}/>
                </label>
                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editing ? 'Save' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}