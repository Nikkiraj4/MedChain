import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function Distributor() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [transferForm, setTransferForm] = useState({
    batchId: '',
    toUserId: '6ab531f25b8ef3ab3c66b4f4',
    quantity: '',
  });

  const [transferResult, setTransferResult] = useState(null);
  const [transferError, setTransferError] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${API_URL}/api/batches/my-batches`,
        { headers }
      );

      setBatches(response.data.batches || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to load batches.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleTransferChange = (e) => {
    setTransferForm({
      ...transferForm,
      [e.target.name]: e.target.value,
    });
  };

  const selectedBatch = batches.find(
    (batch) => batch.batchId === transferForm.batchId
  );

  const transferBatch = async (e) => {
    e.preventDefault();

    setTransferError('');
    setTransferResult(null);
    setTransferLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/batches/transfer`,
        {
          batchId: transferForm.batchId,
          toUserId: transferForm.toUserId,
          quantity: Number(transferForm.quantity),
        },
        { headers }
      );

      setTransferResult(response.data.transaction);

      setTransferForm({
        batchId: '',
        toUserId: '6ab531f25b8ef3ab3c66b4f4',
        quantity: '',
      });

      await loadBatches();
    } catch (error) {
      setTransferError(
        error.response?.data?.message ||
          'Unable to transfer batch.'
      );
    } finally {
      setTransferLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="distributor-page">

      {/* Header */}
      <header className="distributor-header">
        <div>
          <h1>MedChain</h1>
          <p>Distributor Dashboard</p>
        </div>

        <div className="distributor-user">
          <div className="user-info">
            <strong>{user?.name}</strong>
            <span>Distributor</span>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="distributor-main">

        {/* Welcome */}
        <section className="distributor-welcome">
          <div>
            <span className="page-label">
              DISTRIBUTION CENTER
            </span>

            <h2>Welcome, {user?.name}</h2>

            <p>
              Manage pharmaceutical batches received from
              manufacturers and transfer them to pharmacies.
            </p>
          </div>

          <div className="batch-summary">
            <span>{batches.length}</span>
            <small>Active Batches</small>
          </div>
        </section>

        {/* Received Batches */}
        <section className="distributor-card">

          <div className="card-heading">
            <div>
              <h3>Received Batches</h3>
              <p>
                Pharmaceutical batches currently held by
                your distribution center.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="state-message">
              Loading batches...
            </div>
          ) : error ? (
            <div className="state-message error-state">
              {error}
            </div>
          ) : batches.length === 0 ? (
            <div className="state-message">
              No batches currently held by you.
            </div>
          ) : (
            <div className="batch-list">

              {batches.map((batch) => (
                <div
                  className="batch-item"
                  key={batch.batchId}
                >

                  <div className="batch-main">
                    <div className="batch-icon">
                      💊
                    </div>

                    <div className="batch-name">
                      <span>Batch ID</span>
                      <strong>{batch.batchId}</strong>
                      <small>{batch.medicineName}</small>
                    </div>
                  </div>

                  <div className="batch-detail">
                    <span>Quantity</span>
                    <strong>
                      {batch.quantity.toLocaleString()}
                    </strong>
                  </div>

                  <div className="batch-detail">
                    <span>Manufacturer</span>
                    <strong>
                      {batch.manufacturer?.name || '-'}
                    </strong>
                  </div>

                  <div className="batch-detail">
                    <span>Manufactured</span>
                    <strong>
                      {formatDate(
                        batch.manufacturingDate
                      )}
                    </strong>
                  </div>

                  <div className="batch-detail">
                    <span>Expiry</span>
                    <strong>
                      {formatDate(batch.expiryDate)}
                    </strong>
                  </div>

                  <div className="holder-status">
                    <span>Current Holder</span>
                    <strong>
                      {batch.currentHolder?.name ||
                        user?.name}
                    </strong>
                  </div>

                </div>
              ))}

            </div>
          )}
        </section>

        {/* Transfer Section */}
        <section className="distributor-card transfer-card">

          <div className="card-heading">
            <div>
              <h3>Transfer Batch</h3>
              <p>
                Transfer a batch from the distribution
                center to a registered pharmacy.
              </p>
            </div>

            <div className="chain-badge">
              SHA-256
              <span>Hash Chain</span>
            </div>
          </div>

          <form onSubmit={transferBatch}>

            <div className="transfer-grid">

              <div className="field">
                <label>Batch</label>

                <select
                  name="batchId"
                  value={transferForm.batchId}
                  onChange={handleTransferChange}
                  required
                >
                  <option value="">
                    Select a batch
                  </option>

                  {batches.map((batch) => (
                    <option
                      key={batch.batchId}
                      value={batch.batchId}
                    >
                      {batch.batchId} —{' '}
                      {batch.medicineName}
                    </option>
                  ))}
                </select>

                {selectedBatch && (
                  <small>
                    Available quantity:{' '}
                    {selectedBatch.quantity.toLocaleString()}
                  </small>
                )}
              </div>

              <div className="field">
                <label>Receiver</label>

                <input
                  type="text"
                  value="City Care Pharmacy"
                  disabled
                />

                <small>
                  Registered pharmacy
                </small>
              </div>

              <div className="field">
                <label>Transfer Quantity</label>

                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max={selectedBatch?.quantity || undefined}
                  value={transferForm.quantity}
                  onChange={handleTransferChange}
                  placeholder="Enter quantity"
                  required
                />

                {selectedBatch && (
                  <small>
                    Maximum:{' '}
                    {selectedBatch.quantity.toLocaleString()}
                  </small>
                )}
              </div>

            </div>

            {transferError && (
              <div className="transfer-error">
                {transferError}
              </div>
            )}

            <div className="transfer-action">
              <button
                type="submit"
                disabled={
                  transferLoading ||
                  batches.length === 0
                }
              >
                {transferLoading
                  ? 'Processing Transfer...'
                  : 'Transfer to Pharmacy →'}
              </button>
            </div>

          </form>
        </section>

        {/* Transaction Result */}
        {transferResult && (
          <section className="transaction-success">

            <div className="success-heading">
              <div className="success-icon">
                ✓
              </div>

              <div>
                <h3>Transfer Successful</h3>
                <p>
                  The transaction has been added to the
                  tamper-evident chain.
                </p>
              </div>
            </div>

            <div className="transaction-grid">

              <div>
                <span>Transaction ID</span>
                <strong>
                  {transferResult.transactionId}
                </strong>
              </div>

              <div>
                <span>Batch ID</span>
                <strong>
                  {transferResult.batchId}
                </strong>
              </div>

              <div>
                <span>Quantity</span>
                <strong>
                  {transferResult.quantity}
                </strong>
              </div>

              <div className="hash-field">
                <span>Previous Hash</span>
                <code>
                  {transferResult.previousHash}
                </code>
              </div>

              <div className="hash-field full-width">
                <span>Current Hash</span>
                <code>
                  {transferResult.currentHash}
                </code>
              </div>

            </div>
          </section>
        )}

      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .distributor-page {
          min-height: 100vh;
          background: #f5f7fa;
          color: #1f2937;
          font-family: Arial, Helvetica, sans-serif;
        }

        .distributor-header {
          height: 76px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5%;
        }

        .distributor-header h1 {
          margin: 0;
          font-size: 23px;
          font-weight: 700;
        }

        .distributor-header p {
          margin: 4px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        .distributor-user {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-info strong {
          font-size: 14px;
        }

        .user-info span {
          font-size: 12px;
          color: #6b7280;
          margin-top: 3px;
        }

        .logout-button {
          border: 1px solid #d1d5db;
          background: #ffffff;
          border-radius: 7px;
          padding: 9px 16px;
          cursor: pointer;
          font-size: 13px;
        }

        .logout-button:hover {
          background: #f3f4f6;
        }

        .distributor-main {
          width: 90%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 38px 0 60px;
        }

        .distributor-welcome {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 28px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .page-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #6b7280;
        }

        .distributor-welcome h2 {
          margin: 7px 0 8px;
          font-size: 25px;
        }

        .distributor-welcome p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }

        .batch-summary {
          min-width: 120px;
          text-align: center;
          border-left: 1px solid #e5e7eb;
          padding-left: 30px;
        }

        .batch-summary span {
          display: block;
          font-size: 30px;
          font-weight: 700;
        }

        .batch-summary small {
          color: #6b7280;
          font-size: 12px;
        }

        .distributor-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 26px;
          margin-bottom: 24px;
        }

        .card-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 22px;
        }

        .card-heading h3 {
          margin: 0;
          font-size: 18px;
        }

        .card-heading p {
          margin: 6px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        .batch-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .batch-item {
          display: grid;
          grid-template-columns:
            minmax(240px, 1.7fr)
            0.7fr
            1fr
            0.9fr
            0.9fr
            1fr;
          align-items: center;
          gap: 18px;
          padding: 17px;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          background: #fafafa;
        }

        .batch-main {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .batch-icon {
          width: 42px;
          height: 42px;
          border-radius: 9px;
          background: #eef2f7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          flex-shrink: 0;
        }

        .batch-name {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .batch-name span,
        .batch-detail span,
        .holder-status span,
        .transaction-grid span {
          color: #6b7280;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .35px;
        }

        .batch-name strong {
          font-family: monospace;
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .batch-name small {
          color: #4b5563;
          font-size: 12px;
        }

        .batch-detail,
        .holder-status {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }

        .batch-detail strong,
        .holder-status strong {
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .holder-status strong {
          display: inline-block;
          width: fit-content;
          background: #eef2f7;
          padding: 5px 8px;
          border-radius: 5px;
          font-size: 11px;
        }

        .state-message {
          padding: 30px;
          border: 1px dashed #d1d5db;
          border-radius: 8px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }

        .error-state,
        .transfer-error {
          color: #b42318;
          background: #fef3f2;
          border-color: #fecdca;
        }

        .chain-badge {
          background: #f3f4f6;
          border-radius: 7px;
          padding: 8px 12px;
          font-family: monospace;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .chain-badge span {
          display: block;
          color: #6b7280;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 9px;
          font-weight: 500;
          margin-top: 2px;
          text-align: center;
        }

        .transfer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 20px;
        }

        .field {
          display: flex;
          flex-direction: column;
        }

        .field label {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .field input,
        .field select {
          width: 100%;
          height: 44px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          padding: 0 12px;
          background: #ffffff;
          font-size: 13px;
          outline: none;
        }

        .field input:focus,
        .field select:focus {
          border-color: #9ca3af;
        }

        .field input:disabled {
          background: #f3f4f6;
          color: #4b5563;
        }

        .field small {
          color: #6b7280;
          font-size: 11px;
          margin-top: 6px;
        }

        .transfer-error {
          padding: 11px 14px;
          border: 1px solid #fecdca;
          border-radius: 7px;
          margin-top: 18px;
          font-size: 13px;
        }

        .transfer-action {
          display: flex;
          justify-content: flex-end;
          margin-top: 22px;
        }

        .transfer-action button {
          height: 44px;
          border: none;
          border-radius: 7px;
          padding: 0 22px;
          background: #1f2937;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .transfer-action button:hover {
          background: #111827;
        }

        .transfer-action button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .transaction-success {
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 26px;
        }

        .success-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 22px;
        }

        .success-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #f0fdf4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
        }

        .success-heading h3 {
          margin: 0;
          font-size: 17px;
        }

        .success-heading p {
          margin: 4px 0 0;
          color: #6b7280;
          font-size: 12px;
        }

        .transaction-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .transaction-grid > div {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 13px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          min-width: 0;
        }

        .transaction-grid strong {
          font-size: 13px;
          word-break: break-word;
        }

        .hash-field {
          grid-column: span 2;
        }

        .hash-field.full-width {
          grid-column: 1 / -1;
        }

        .hash-field code {
          font-family: monospace;
          font-size: 11px;
          line-height: 1.5;
          word-break: break-all;
          color: #374151;
        }

        @media (max-width: 1100px) {
          .batch-item {
            grid-template-columns: repeat(3, 1fr);
          }

          .batch-main {
            grid-column: span 3;
          }

          .transfer-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .distributor-header {
            height: auto;
            padding: 16px 5%;
            gap: 15px;
          }

          .distributor-user {
            gap: 10px;
          }

          .user-info {
            display: none;
          }

          .distributor-main {
            width: 94%;
            padding-top: 20px;
          }

          .distributor-welcome {
            align-items: flex-start;
            gap: 20px;
          }

          .batch-summary {
            min-width: 80px;
            padding-left: 15px;
          }

          .batch-item {
            grid-template-columns: 1fr 1fr;
          }

          .batch-main {
            grid-column: span 2;
          }

          .transaction-grid {
            grid-template-columns: 1fr;
          }

          .hash-field,
          .hash-field.full-width {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}

export default Distributor;