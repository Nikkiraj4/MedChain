
import { useEffect, useState } from 'react';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

function Pharmacy() {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const loadBatches = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const selectBatch = (batch) => {
    setSelectedBatch(batch);
    setBatchId(batch.batchId);
    setVerification(null);
    setError('');
  };

  const verifyBatch = async () => {
    if (!batchId.trim()) {
      setError('Please enter a Batch ID');
      return;
    }

    try {
      setVerifying(true);
      setVerification(null);
      setError('');

      const response = await fetch(
        `${API_URL}/batches/${batchId.trim()}/verify`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setVerification(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>MEDCHAIN</div>

          <h1 style={styles.title}>Pharmacy Dashboard</h1>

          <p style={styles.subtitle}>
            Verify pharmaceutical batches and check the integrity of their
            supply-chain history.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.refreshButton}
            onClick={loadBatches}
            disabled={loading}
          >
            ↻ Refresh
          </button>

          <button
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.container}>
        {error && <div style={styles.error}>{error}</div>}

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Verify Batch Integrity</h2>

              <p style={styles.cardDescription}>
                Enter a Batch ID to verify its complete tamper-evident
                transaction history using SHA-256.
              </p>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>Batch ID</label>

              <input
                type="text"
                value={batchId}
                onChange={(e) => {
                  setBatchId(e.target.value);
                  setVerification(null);
                }}
                placeholder="e.g. BATCH-1790260278128"
                style={styles.input}
              />
            </div>

            <button
              onClick={verifyBatch}
              disabled={verifying}
              style={styles.verifyButton}
            >
              {verifying ? 'Verifying...' : 'Verify Integrity'}
            </button>
          </div>
        </section>

        {verification && (
          <section
            style={{
              ...styles.resultCard,
              ...(verification.verified
                ? styles.successCard
                : styles.failureCard),
            }}
          >
            <div
              style={{
                ...styles.resultIcon,
                ...(verification.verified
                  ? styles.successIcon
                  : styles.failureIcon),
              }}
            >
              {verification.verified ? '✓' : '!'}
            </div>

            <div>
              <h2 style={styles.resultTitle}>
                {verification.verified
                  ? 'Supply-chain history verified'
                  : 'Integrity violation detected'}
              </h2>

              <p style={styles.resultMessage}>
                {verification.message}
              </p>

              {verification.verified && (
                <div style={styles.resultDetails}>
                  <span>
                    <strong>Batch ID:</strong>{' '}
                    {verification.batchId}
                  </span>

                  <span>
                    <strong>Transactions:</strong>{' '}
                    {verification.transactionCount}
                  </span>
                </div>
              )}

              {!verification.verified && verification.reason && (
                <div style={styles.reason}>
                  <strong>Reason:</strong>{' '}
                  {verification.reason}
                </div>
              )}
            </div>
          </section>
        )}

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.cardTitle}>My Batches</h2>

              <p style={styles.cardDescription}>
                Batches currently held by this pharmacy.
              </p>
            </div>

            <span style={styles.countBadge}>
              {batches.length}
            </span>
          </div>

          {loading ? (
            <div style={styles.emptyState}>
              Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <div style={styles.emptyState}>
              No batches are currently held by this pharmacy.
            </div>
          ) : (
            <div style={styles.batchGrid}>
              {batches.map((batch) => (
                <div
                  key={batch.batchId}
                  style={{
                    ...styles.batchCard,
                    ...(selectedBatch?.batchId === batch.batchId
                      ? styles.selectedBatch
                      : {}),
                  }}
                  onClick={() => selectBatch(batch)}
                >
                  <div style={styles.batchTop}>
                    <span style={styles.batchLabel}>
                      BATCH
                    </span>

                    <span style={styles.batchStatus}>
                      IN PHARMACY
                    </span>
                  </div>

                  <h3 style={styles.batchId}>
                    {batch.batchId}
                  </h3>

                  <div style={styles.batchInfo}>
                    <div>
                      <span style={styles.infoLabel}>
                        Medicine
                      </span>

                      <span style={styles.infoValue}>
                        {batch.medicineName}
                      </span>
                    </div>

                    <div>
                      <span style={styles.infoLabel}>
                        Quantity
                      </span>

                      <span style={styles.infoValue}>
                        {batch.quantity}
                      </span>
                    </div>

                    <div>
                      <span style={styles.infoLabel}>
                        Manufacturing
                      </span>

                      <span style={styles.infoValue}>
                        {new Date(
                          batch.manufacturingDate
                        ).toLocaleDateString('en-GB')}
                      </span>
                    </div>

                    <div>
                      <span style={styles.infoLabel}>
                        Expiry
                      </span>

                      <span style={styles.infoValue}>
                        {new Date(
                          batch.expiryDate
                        ).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>

                  <button
                    style={styles.selectButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectBatch(batch);
                    }}
                  >
                    Select for Verification
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.infoCard}>
          <div style={styles.infoIcon}>🔐</div>

          <div>
            <h3 style={styles.infoTitle}>
              How verification works
            </h3>

            <p style={styles.infoText}>
              MedChain recalculates the SHA-256 hash of every
              transaction and checks that each transaction points
              to the previous transaction. If any recorded
              transaction has been modified, the hash chain will
              no longer match and the system will report an
              integrity violation.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f7fb',
    color: '#172033',
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e5e9f0',
    padding: '28px 6%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },

  brand: {
    fontSize: '13px',
    fontWeight: '800',
    letterSpacing: '2px',
    color: '#3157d5',
    marginBottom: '8px',
  },

  title: {
    margin: 0,
    fontSize: '30px',
    fontWeight: '750',
  },

  subtitle: {
    margin: '8px 0 0',
    color: '#697386',
    fontSize: '15px',
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  refreshButton: {
    border: '1px solid #dce2ec',
    background: '#ffffff',
    padding: '10px 16px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#344054',
  },

  logoutButton: {
    border: '1px solid #f0caca',
    background: '#fff5f5',
    color: '#b42318',
    padding: '10px 16px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '600',
  },

  container: {
    width: '88%',
    maxWidth: '1250px',
    margin: '32px auto',
  },

  card: {
    background: '#ffffff',
    border: '1px solid #e5e9f0',
    borderRadius: '16px',
    padding: '26px',
    marginBottom: '22px',
    boxShadow: '0 4px 16px rgba(20, 30, 50, 0.04)',
  },

  cardHeader: {
    marginBottom: '22px',
  },

  cardTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
  },

  cardDescription: {
    margin: '7px 0 0',
    color: '#70798a',
    fontSize: '14px',
    lineHeight: 1.5,
  },

  formRow: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-end',
  },

  inputWrapper: {
    flex: 1,
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: '650',
    color: '#475467',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 14px',
    border: '1px solid #d7dce5',
    borderRadius: '9px',
    outline: 'none',
    fontSize: '14px',
    color: '#172033',
  },

  verifyButton: {
    border: 'none',
    background: '#3157d5',
    color: '#ffffff',
    padding: '13px 22px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: '700',
    minWidth: '165px',
  },

  error: {
    background: '#fff1f1',
    border: '1px solid #f2caca',
    color: '#b42318',
    padding: '13px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '14px',
  },

  resultCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '18px',
    padding: '22px',
    borderRadius: '15px',
    marginBottom: '22px',
    border: '1px solid',
  },

  successCard: {
    background: '#f0fdf4',
    borderColor: '#bbebc9',
  },

  failureCard: {
    background: '#fff7ed',
    borderColor: '#fed7aa',
  },

  resultIcon: {
    width: '42px',
    height: '42px',
    minWidth: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '800',
  },

  successIcon: {
    background: '#dcfce7',
    color: '#15803d',
  },

  failureIcon: {
    background: '#ffedd5',
    color: '#c2410c',
  },

  resultTitle: {
    margin: '0 0 6px',
    fontSize: '18px',
    fontWeight: '750',
  },

  resultMessage: {
    margin: 0,
    color: '#596273',
    fontSize: '14px',
  },

  resultDetails: {
    display: 'flex',
    gap: '25px',
    marginTop: '14px',
    fontSize: '13px',
    color: '#475467',
    flexWrap: 'wrap',
  },

  reason: {
    marginTop: '14px',
    padding: '10px 12px',
    background: '#ffffff',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#7c2d12',
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },

  countBadge: {
    background: '#eef2ff',
    color: '#3157d5',
    padding: '6px 11px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
  },

  emptyState: {
    padding: '35px',
    textAlign: 'center',
    color: '#8a93a3',
    border: '1px dashed #d8dde7',
    borderRadius: '12px',
  },

  batchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '18px',
  },

  batchCard: {
    border: '1px solid #e1e5ec',
    borderRadius: '13px',
    padding: '20px',
    cursor: 'pointer',
    background: '#ffffff',
    transition: '0.2s ease',
  },

  selectedBatch: {
    border: '2px solid #3157d5',
    boxShadow: '0 5px 18px rgba(49, 87, 213, 0.10)',
  },

  batchTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '13px',
  },

  batchLabel: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#7b8495',
  },

  batchStatus: {
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    color: '#15803d',
    background: '#dcfce7',
    padding: '5px 8px',
    borderRadius: '20px',
  },

  batchId: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '750',
    wordBreak: 'break-word',
  },

  batchInfo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    margin: '20px 0',
  },

  infoLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#8992a3',
    marginBottom: '4px',
  },

  infoValue: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '650',
    color: '#344054',
  },

  selectButton: {
    width: '100%',
    border: '1px solid #d8deea',
    background: '#f8f9fc',
    color: '#344054',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '650',
    fontSize: '13px',
  },

  infoCard: {
    display: 'flex',
    gap: '16px',
    background: '#eef4ff',
    border: '1px solid #d6e3ff',
    borderRadius: '14px',
    padding: '20px 22px',
  },

  infoIcon: {
    fontSize: '22px',
  },

  infoTitle: {
    margin: '0 0 6px',
    fontSize: '15px',
    fontWeight: '750',
  },

  infoText: {
    margin: 0,
    color: '#596273',
    fontSize: '13px',
    lineHeight: 1.6,
  },
};

export default Pharmacy;

