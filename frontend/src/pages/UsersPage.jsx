import { useEffect, useState } from 'react';
import { Shield, UserCheck, UserX, Trash2 } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import api from '../services/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  const fetch = () => api.get('/users').then(r => setUsers(r.data.data));
  useEffect(() => { fetch(); }, []);

  const updateRole = async (id, role) => {
    await api.patch(`/users/${id}/role`, { role });
    fetch();
  };
  const toggleStatus = async (id, status) => {
    await api.patch(`/users/${id}/status`, { status: status === 'active' ? 'inactive' : 'active' });
    fetch();
  };
  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    fetch();
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div><h1>User Management</h1><p className="page-sub">Admin only</p></div>
        </div>
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><div className="user-row"><div className="user-avatar sm">{u.name[0]}</div>{u.name}</div></td>
                  <td>{u.email}</td>
                  <td>
                    <select value={u.role} className={`role-select role-${u.role}`}
                      onChange={e => updateRole(u._id, e.target.value)}>
                      <option value="viewer">viewer</option>
                      <option value="analyst">analyst</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button onClick={() => toggleStatus(u._id, u.status)} className="icon-btn" title="Toggle Status">
                      {u.status === 'active' ? <UserX size={15}/> : <UserCheck size={15}/>}
                    </button>
                    <button onClick={() => deleteUser(u._id)} className="icon-btn danger" title="Delete">
                      <Trash2 size={15}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}