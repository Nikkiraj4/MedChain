
import { useEffect, useState } from 'react';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const DISTRIBUTOR_ID = '6ab530a9fbb6673b7dcb2809';

function Manufacturer() {
  const [medicineName, setMedicineName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [batches, setBatches] = useState([]);

  const [selectedBatch, setSelectedBatch] = useState('');
  const [transferQuantity, setTransferQuantity] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(true);

  // Stores the QR code of the most recently created batch
  const [createdBatch, setCreatedBatch] = useState(null);

  const token = localStorage.getItem('token');

  // Load batches currently held by manufacturer
  const loadBatches = async () => {
    try {
      setLoadingBatches(true);
      setError('');

      const response = await fetch(`${API_URL}/batches/my-batches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load batches');
      }

      setBatches(data.batches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');
    setCreatedBatch(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineName,
          quantity: Number(quantity),
          manufacturingDate,
          expiryDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create batch');
      }

      // Store the newly created batch so its QR can be displayed
      setCreatedBatch(data.batch);

      setMessage(
        `Batch ${data.batch.batchId} created successfully.`
      );

      setMedicineName('');
      setQuantity('');
      setManufacturingDate('');
      setExpiryDate('');

      await loadBatches();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;

    setSelectedBatch(batchId);

    const batch = batches.find(
      (item) => item.batchId === batchId
    );

    if (batch) {
      setTransferQuantity(batch.quantity);
    } else {
      setTransferQuantity('');
    }

    setMessage('');
    setError('');
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    if (!selectedBatch) {
      setError('Please select a batch.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/batches/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: selectedBatch,
          toUserId: DISTRIBUTOR_ID,
          quantity: Number(transferQuantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Transfer failed');
      }

      setMessage(
        `Batch ${data.transaction.batchId} transferred successfully.`
      );

      setSelectedBatch('');
      setTransferQuantity('');

      // Once transferred, it is no longer held by manufacturer.
      setCreatedBatch(null);

      await loadBatches();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, Arial, sans-serif;
          background: #f5f7fb;
          color: #172033;
        }

        .manufacturer-page {
          min-height: 100vh;
        }

        .topbar {
          height: 70px;
          background: #ffffff;
          border-bottom: 1px solid #e6e9ef;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 42px;
        }

        .brand {
          font-size: 23px;
          font-weight: 800;
          color: #172033;
        }

        .brand span {
          color: #2563eb;
        }

        .user-area {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .role {
          font-size: 14px;
          font-weight: 600;
          color: #4b5563;
        }

        .logout {
          border: none;
          background: #f3f4f6;
          color: #374151;
          padding: 9px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .logout:hover {
          background: #e5e7eb;
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 38px 24px 60px;
        }

        .page-heading {
          margin-bottom: 30px;
        }

        .page-heading h1 {
          margin: 0 0 8px;
          font-size: 30px;
          color: #111827;
        }

        .page-heading p {
          margin: 0;
          color: #6b7280;
          font-size: 15px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 26px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
        }

        .card h2 {
          margin: 0 0 7px;
          font-size: 20px;
          color: #111827;
        }

        .card-description {
          margin: 0 0 22px;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 17px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          font-size: 13px;
          font-weight: 700;
          color: #374151;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          height: 44px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
          background: #ffffff;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .button {
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .button:hover {
          background: #1d4ed8;
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .full-card {
          margin-bottom: 24px;
        }

        .batch-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 30px;
          height: 26px;
          padding: 0 9px;
          margin-left: 8px;
          border-radius: 20px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 12px;
          font-weight: 700;
        }

        .batch-list {
          display: grid;
          gap: 14px;
        }

        .batch-card {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 18px;
          background: #fafbfc;
        }

        .batch-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 14px;
        }

        .batch-id {
          font-size: 15px;
          font-weight: 800;
          color: #111827;
        }

        .holder {
          background: #ecfdf5;
          color: #047857;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .batch-details {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .detail {
          background: #ffffff;
          border: 1px solid #edf0f4;
          border-radius: 8px;
          padding: 11px;
        }

        .detail-label {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .detail-value {
          font-size: 13px;
          font-weight: 700;
          color: #1f2937;
        }

        .empty {
          text-align: center;
          padding: 35px 15px;
          color: #6b7280;
          background: #f9fafb;
          border-radius: 10px;
          border: 1px dashed #d1d5db;
        }

        .alert {
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .success {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .error {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .transfer-note {
          margin-top: 12px;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
        }

        /* QR Code section */
        .qr-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }

        .qr-title {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 800;
          color: #111827;
        }

        .qr-description {
          margin: 0 0 16px;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.5;
        }

        .qr-image {
          width: 190px;
          height: 190px;
          object-fit: contain;
          padding: 10px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        }

        .qr-batch-id {
          margin-top: 12px;
          font-size: 13px;
          font-weight: 800;
          color: #2563eb;
          word-break: break-all;
        }

        .batch-with-qr {
          display: grid;
          grid-template-columns: 1fr 190px;
          gap: 24px;
          align-items: center;
        }

        .saved-qr {
          text-align: center;
          padding-left: 20px;
          border-left: 1px solid #e5e7eb;
        }

        .saved-qr img {
          width: 140px;
          height: 140px;
          object-fit: contain;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 7px;
        }

        .saved-qr-label {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
        }

        @media (max-width: 850px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .batch-details {
            grid-template-columns: repeat(2, 1fr);
          }

          .batch-with-qr {
            grid-template-columns: 1fr;
          }

          .saved-qr {
            border-left: none;
            border-top: 1px solid #e5e7eb;
            padding-left: 0;
            padding-top: 20px;
          }

          .topbar {
            padding: 0 20px;
          }
        }

        @media (max-width: 520px) {
          .content {
            padding: 25px 15px 40px;
          }

          .batch-details {
            grid-template-columns: 1fr;
          }

          .batch-top {
            align-items: flex-start;
            flex-direction: column;
          }

          .user-area {
            gap: 8px;
          }

          .role {
            display: none;
          }
        }
      `}</style>

      <div className="manufacturer-page">
        <header className="topbar">
          <div className="brand">
            <span>Med</span>Chain
          </div>

          <div className="user-area">
            <div className="role">ABC Pharmaceuticals</div>

            <button
              className="logout"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="content">
          <div className="page-heading">
            <h1>Manufacturer Dashboard</h1>
            <p>
              Create pharmaceutical batches and transfer them securely
              through the supply chain.
            </p>
          </div>

          {message && (
            <div className="alert success">
              {message}
            </div>
          )}

          {error && (
            <div className="alert error">
              {error}
            </div>
          )}

          <div className="grid">
            {/* CREATE BATCH */}
            <section className="card">
              <h2>Create Medicine Batch</h2>

              <p className="card-description">
                Create a new pharmaceutical batch and generate its
                unique QR code.
              </p>

              <form onSubmit={handleCreateBatch}>
                <div className="form-group">
                  <label>Medicine Name</label>
                  <input
                    type="text"
                    value={medicineName}
                    onChange={(e) =>
                      setMedicineName(e.target.value)
                    }
                    placeholder="e.g. Paracetamol"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value)
                    }
                    placeholder="e.g. 1000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Manufacturing Date</label>
                  <input
                    type="date"
                    value={manufacturingDate}
                    onChange={(e) =>
                      setManufacturingDate(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) =>
                      setExpiryDate(e.target.value)
                    }
                    required
                  />
                </div>

                <button
                  className="button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Batch'}
                </button>
              </form>

              {/* NEWLY CREATED BATCH QR */}
              {createdBatch && createdBatch.qrData && (
                <div className="qr-section">
                  <h3 className="qr-title">
                    Batch QR Code
                  </h3>

                  <p className="qr-description">
                    This QR code uniquely identifies the pharmaceutical
                    batch.
                  </p>

                  <img
                    src={createdBatch.qrData}
                    alt={`QR code for ${createdBatch.batchId}`}
                    className="qr-image"
                  />

                  <div className="qr-batch-id">
                    {createdBatch.batchId}
                  </div>
                </div>
              )}
            </section>

            {/* TRANSFER BATCH */}
            <section className="card">
              <h2>Transfer Batch</h2>

              <p className="card-description">
                Transfer a complete batch to the distributor. Each
                transfer creates a tamper-evident SHA-256 transaction.
              </p>

              <form onSubmit={handleTransfer}>
                <div className="form-group">
                  <label>Batch ID</label>

                  <select
                    value={selectedBatch}
                    onChange={handleBatchChange}
                    required
                  >
                    <option value="">
                      {loadingBatches
                        ? 'Loading batches...'
                        : 'Select a batch'}
                    </option>

                    {batches.map((batch) => (
                      <option
                        key={batch.batchId}
                        value={batch.batchId}
                      >
                        {batch.batchId} — {batch.medicineName} (
                        {batch.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Receiver</label>
                  <input
                    type="text"
                    value="XYZ Distribution"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Transfer Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={transferQuantity}
                    onChange={(e) =>
                      setTransferQuantity(e.target.value)
                    }
                    placeholder="Select a batch first"
                    required
                  />
                </div>

                <button
                  className="button"
                  type="submit"
                  disabled={loading || !selectedBatch}
                >
                  {loading
                    ? 'Transferring...'
                    : 'Transfer to Distributor'}
                </button>

                <div className="transfer-note">
                  For the current MVP, the complete batch quantity must
                  be transferred. Partial batch transfers are not
                  supported.
                </div>
              </form>
            </section>
          </div>

          {/* MY BATCHES */}
          <section className="card full-card">
            <h2>
              My Batches
              <span className="batch-count">
                {batches.length}
              </span>
            </h2>

            <p className="card-description">
              Pharmaceutical batches currently held by ABC
              Pharmaceuticals.
            </p>

            {loadingBatches ? (
              <div className="empty">
                Loading batches...
              </div>
            ) : batches.length === 0 ? (
              <div className="empty">
                No batches are currently held by this manufacturer.
              </div>
            ) : (
              <div className="batch-list">
                {batches.map((batch) => (
                  <div
                    className="batch-card"
                    key={batch.batchId}
                  >
                    <div className="batch-with-qr">
                      <div>
                        <div className="batch-top">
                          <div className="batch-id">
                            {batch.batchId}
                          </div>

                          <div className="holder">
                            Current Holder: ABC Pharmaceuticals
                          </div>
                        </div>

                        <div className="batch-details">
                          <div className="detail">
                            <span className="detail-label">
                              Medicine
                            </span>

                            <span className="detail-value">
                              {batch.medicineName}
                            </span>
                          </div>

                          <div className="detail">
                            <span className="detail-label">
                              Quantity
                            </span>

                            <span className="detail-value">
                              {batch.quantity}
                            </span>
                          </div>

                          <div className="detail">
                            <span className="detail-label">
                              Manufacturing
                            </span>

                            <span className="detail-value">
                              {formatDate(batch.manufacturingDate)}
                            </span>
                          </div>

                          <div className="detail">
                            <span className="detail-label">
                              Expiry
                            </span>

                            <span className="detail-value">
                              {formatDate(batch.expiryDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* STORED QR */}
                      {batch.qrData && (
                        <div className="saved-qr">
                          <img
                            src={batch.qrData}
                            alt={`QR code for ${batch.batchId}`}
                          />

                          <div className="saved-qr-label">
                            Batch QR Code
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

export default Manufacturer;

