import React, { useEffect, useState, useContext } from 'react';
import useApi from '../../hooks/useApi';
import { SocketContext } from '../../context/SocketContext';
import { apiUrl } from '../../lib/api';

const AdminUsers = () => {
  const { data: users, loading, error, execute } = useApi(apiUrl('/api/admin/users'));
  const actionApi = useApi(apiUrl('/api/admin/users'), { method: 'PUT' });
  
  const { socket, presenceMap } = useContext(SocketContext);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
        const res = await execute(undefined, { headers: { Authorization: `Bearer ${token}` } });
        if(res && Array.isArray(res)) setUserList(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [execute]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('newUserRegistered', (newUser) => {
      setUserList(prev => [newUser, ...prev]);
    });
    
    socket.on('userLoggedIn', (userPayload) => {
      setUserList(prev => prev.map(u => u._id === userPayload._id ? { ...u, lastLogin: userPayload.lastLogin } : u));
    });

    socket.on('userUpdated', (updatedUser) => {
      setUserList(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
    });

    return () => {
      socket.off('newUserRegistered');
      socket.off('userLoggedIn');
      socket.off('userUpdated');
    };
  }, [socket]);

  const toggleBlock = async (userId) => {
    try {
      const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
      await actionApi.execute(apiUrl(`/api/admin/users/${userId}/block`), { headers: { Authorization: `Bearer ${token}` } });
      setUserList(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
    } catch(err) {
      alert("Failed to update user status");
    }
  };

  return (
    <div className="admin-page page-transition">
      <h1 className="title-section">User Management</h1>
      
      {loading ? <p>Loading directory...</p> : error ? <p style={{color: '#ef4444'}}>Failed to load users: {error}</p> : (
        <div className="admin-table-container glass">
          <table className="admin-table">
            <thead>
                <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Presence</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userList.map(u => {
                const isOnline = presenceMap && presenceMap[u._id];
                
                return (
                <tr key={u._id}>
                  <td>{u._id.substring(0, 8)}...</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span style={{textTransform:'capitalize'}}>{u.role}</span></td>
                  <td>
                    {isOnline ? (
                      <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                         <span style={{width:'8px',height:'8px',background:'#10b981',borderRadius:'50%',boxShadow:'0 0 5px #10b981'}}></span>
                         Online
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Offline</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${u.isBlocked ? 'danger' : 'success'}`}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => toggleBlock(u._id)} 
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      disabled={u.role === 'admin'}
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
