import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function Admin() {
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MANUFACTURER',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'MANUFACTURER',
    status: 'ACTIVE',
  });

  const token = localStorage.getItem('token');

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersResponse, batchesResponse, transactionsResponse] =
        await Promise.all([
          axios.get(`${API_URL}/api/admin/users`, { headers }),
          axios.get(`${API_URL}/api/admin/batches`, { headers }),
          axios.get(`${API_URL}/api/admin/transactions`, { headers }),
        ]);

      setUsers(usersResponse.data.users || []);
      setBatches(batchesResponse.data.batches || []);
      setTransactions(transactionsResponse.data.transactions || []);
    } catch (err) {
      console.error('Admin data error:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load admin dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setMessage('');

      await axios.post(
        `${API_URL}/api/admin/users`,
        userForm,
        { headers }
      );

      setMessage('User created successfully.');

      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'MANUFACTURER',
      });

      setShowCreateForm(false);

      fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to create user.'
      );
    }
  };

  const startEditing = (user) => {
    setEditingUser(user);

    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setMessage('');

      await axios.put(
        `${API_URL}/api/admin/users/${editingUser._id}`,
        editForm,
        { headers }
      );

      setMessage('User updated successfully.');
      setEditingUser(null);

      fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to update user.'
      );
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setError('');
      setMessage('');

      await axios.delete(
        `${API_URL}/api/admin/users/${user._id}`,
        { headers }
      );

      setMessage('User deleted successfully.');

      fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to delete user.'
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    window.location.href = '/';
  };

  const totalManufacturers = users.filter(
    (user) => user.role === 'MANUFACTURER'
  ).length;

  const totalDistributors = users.filter(
    (user) => user.role === 'DISTRIBUTOR'
  ).length;

  const totalPharmacies = users.filter(
    (user) => user.role === 'PHARMACY'
  ).length;

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shortHash = (hash) => {
    if (!hash) return 'NULL';

    if (hash.length <= 20) return hash;

    return `${hash.slice(0, 10)}...${hash.slice(-10)}`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        color: '#1f2937',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '18px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '26px',
              fontWeight: '700',
            }}
          >
            MedChain Admin
          </h1>

          <p
            style={{
              margin: '5px 0 0',
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            Pharmaceutical Supply Chain Management
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: '9px 16px',
            border: 'none',
            borderRadius: '7px',
            background: '#111827',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </header>

      <main
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '30px',
        }}
      >
        {message && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#dcfce7',
              color: '#166534',
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#fee2e2',
              color: '#991b1b',
            }}
          >
            {error}
          </div>
        )}

        {/* Statistics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '18px',
            marginBottom: '30px',
          }}
        >
          {[
            ['Total Users', users.length],
            ['Manufacturers', totalManufacturers],
            ['Distributors', totalDistributors],
            ['Pharmacies', totalPharmacies],
            ['Batches', batches.length],
            ['Transactions', transactions.length],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '20px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '14px',
                }}
              >
                {label}
              </p>

              <h2
                style={{
                  margin: '8px 0 0',
                  fontSize: '28px',
                }}
              >
                {loading ? '...' : value}
              </h2>
            </div>
          ))}
        </div>

        {/* User Management */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            marginBottom: '30px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>
                User Management
              </h2>

              <p
                style={{
                  margin: '5px 0 0',
                  color: '#6b7280',
                  fontSize: '14px',
                }}
              >
                Manage supply-chain participants
              </p>
            </div>

            <button
              onClick={() =>
                setShowCreateForm(!showCreateForm)
              }
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '7px',
                background: '#2563eb',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              {showCreateForm ? 'Close' : '+ Create User'}
            </button>
          </div>

          {/* Create User */}
          {showCreateForm && (
            <form
              onSubmit={handleCreateUser}
              style={{
                padding: '20px',
                background: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              <input
                placeholder="Name"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    name: e.target.value,
                  })
                }
                required
                style={inputStyle}
              />

              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    email: e.target.value,
                  })
                }
                required
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    password: e.target.value,
                  })
                }
                required
                style={inputStyle}
              />

              <select
                value={userForm.role}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    role: e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option value="MANUFACTURER">
                  Manufacturer
                </option>
                <option value="DISTRIBUTOR">
                  Distributor
                </option>
                <option value="PHARMACY">
                  Pharmacy
                </option>
              </select>

              <button
                type="submit"
                style={{
                  padding: '10px',
                  border: 'none',
                  borderRadius: '7px',
                  background: '#16a34a',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                Create User
              </button>
            </form>
          )}

          {/* Edit User */}
          {editingUser && (
            <form
              onSubmit={handleUpdateUser}
              style={{
                padding: '20px',
                background: '#eff6ff',
                borderBottom: '1px solid #e5e7eb',
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              <input
                placeholder="Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    name: e.target.value,
                  })
                }
                required
                style={inputStyle}
              />

              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    email: e.target.value,
                  })
                }
                required
                style={inputStyle}
              />

              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    role: e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option value="MANUFACTURER">
                  Manufacturer
                </option>
                <option value="DISTRIBUTOR">
                  Distributor
                </option>
                <option value="PHARMACY">
                  Pharmacy
                </option>
              </select>

              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    status: e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <button
                type="submit"
                style={{
                  padding: '10px',
                  border: 'none',
                  borderRadius: '7px',
                  background: '#2563eb',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() => setEditingUser(null)}
                style={{
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '7px',
                  background: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </form>
          )}

          {/* Users Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td style={tdStyle}>{user.name}</td>
                    <td style={tdStyle}>{user.email}</td>
                    <td style={tdStyle}>{user.role}</td>
                    <td style={tdStyle}>{user.status}</td>

                    <td style={tdStyle}>
                      {user.role === 'ADMIN' ? (
                        <span style={{ color: '#6b7280' }}>
                          Protected
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              startEditing(user)
                            }
                            style={actionButton}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteUser(user)
                            }
                            style={{
                              ...actionButton,
                              color: '#dc2626',
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Batches */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            marginBottom: '30px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <h2 style={{ margin: 0 }}>
              Batch Monitoring
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#6b7280',
                fontSize: '14px',
              }}
            >
              View all pharmaceutical batches in the system
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Batch ID</th>
                  <th style={thStyle}>Medicine</th>
                  <th style={thStyle}>Quantity</th>
                  <th style={thStyle}>Manufacturer</th>
                  <th style={thStyle}>Current Holder</th>
                  <th style={thStyle}>Manufactured</th>
                  <th style={thStyle}>Expiry</th>
                  <th style={thStyle}>QR</th>
                </tr>
              </thead>

              <tbody>
                {batches.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        ...tdStyle,
                        textAlign: 'center',
                        color: '#6b7280',
                      }}
                    >
                      No batches available.
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => (
                    <tr key={batch._id}>
                      <td style={tdStyle}>
                        {batch.batchId}
                      </td>

                      <td style={tdStyle}>
                        {batch.medicineName}
                      </td>

                      <td style={tdStyle}>
                        {batch.quantity}
                      </td>

                      <td style={tdStyle}>
                        {batch.manufacturer?.name || '-'}
                      </td>

                      <td style={tdStyle}>
                        {batch.currentHolder?.name || '-'}
                      </td>

                      <td style={tdStyle}>
                        {formatDate(
                          batch.manufacturingDate
                        )}
                      </td>

                      <td style={tdStyle}>
                        {formatDate(batch.expiryDate)}
                      </td>

                      <td style={tdStyle}>
                        {batch.qrData ? 'Generated' : 'Not available'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Transactions */}
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            marginBottom: '30px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <h2 style={{ margin: 0 }}>
              Transaction History
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#6b7280',
                fontSize: '14px',
              }}
            >
              Tamper-evident supply-chain transaction records
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Transaction ID</th>
                  <th style={thStyle}>Batch ID</th>
                  <th style={thStyle}>From</th>
                  <th style={thStyle}>To</th>
                  <th style={thStyle}>Quantity</th>
                  <th style={thStyle}>Timestamp</th>
                  <th style={thStyle}>Previous Hash</th>
                  <th style={thStyle}>Current Hash</th>
                </tr>
              </thead>

              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        ...tdStyle,
                        textAlign: 'center',
                        color: '#6b7280',
                      }}
                    >
                      No transactions available.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td style={tdStyle}>
                        {transaction.transactionId}
                      </td>

                      <td style={tdStyle}>
                        {transaction.batchId}
                      </td>

                      <td style={tdStyle}>
                        {transaction.from?.name || '-'}
                      </td>

                      <td style={tdStyle}>
                        {transaction.to?.name || '-'}
                      </td>

                      <td style={tdStyle}>
                        {transaction.quantity}
                      </td>

                      <td style={tdStyle}>
                        {formatDateTime(
                          transaction.timestamp
                        )}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontFamily: 'monospace',
                          fontSize: '12px',
                        }}
                      >
                        {shortHash(
                          transaction.previousHash
                        )}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontFamily: 'monospace',
                          fontSize: '12px',
                        }}
                      >
                        {shortHash(
                          transaction.currentHash
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

const inputStyle = {
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '7px',
  background: '#ffffff',
  fontSize: '14px',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: '900px',
};

const thStyle = {
  padding: '13px 16px',
  textAlign: 'left',
  background: '#f9fafb',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '13px',
  color: '#4b5563',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '13px 16px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '14px',
  whiteSpace: 'nowrap',
};

const actionButton = {
  border: 'none',
  background: 'transparent',
  color: '#2563eb',
  cursor: 'pointer',
  marginRight: '12px',
  padding: 0,
};

export default Admin;