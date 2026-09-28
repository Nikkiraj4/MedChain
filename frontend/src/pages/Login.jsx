import { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect according to role
      switch (data.user.role) {
        case 'ADMIN':
          window.location.href = '/admin';
          break;

        case 'MANUFACTURER':
          window.location.href = '/manufacturer';
          break;

        case 'DISTRIBUTOR':
          window.location.href = '/distributor';
          break;

        case 'PHARMACY':
          window.location.href = '/pharmacy';
          break;

        default:
          window.location.href = '/login';
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.backgroundShapeOne}></div>
      <div style={styles.backgroundShapeTwo}></div>

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoText}>MC</span>
        </div>

        {/* Heading */}
        <div style={styles.headingSection}>
          <h1 style={styles.title}>MedChain</h1>
          <p style={styles.subtitle}>
            Pharmaceutical Supply Chain Traceability
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <span>Secure pharmaceutical supply chain management</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    background: '#f4f7fb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  },

  backgroundShapeOne: {
    position: 'absolute',
    width: '420px',
    height: '420px',
    borderRadius: '50%',
    background: '#e8f1ff',
    top: '-180px',
    left: '-140px',
  },

  backgroundShapeTwo: {
    position: 'absolute',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    background: '#eaf8f1',
    bottom: '-170px',
    right: '-120px',
  },

  card: {
    width: '100%',
    maxWidth: '430px',
    background: '#ffffff',
    borderRadius: '18px',
    padding: '42px 40px 32px',
    boxSizing: 'border-box',
    boxShadow: '0 18px 50px rgba(20, 45, 80, 0.12)',
    border: '1px solid #e7edf5',
    position: 'relative',
    zIndex: 2,
  },

  logo: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
  },

  logoText: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '0.5px',
  },

  headingSection: {
    textAlign: 'center',
    marginBottom: '32px',
  },

  title: {
    margin: '0',
    fontSize: '30px',
    fontWeight: '750',
    color: '#172033',
    letterSpacing: '-0.5px',
  },

  subtitle: {
    margin: '8px 0 0',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#68758a',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    fontSize: '14px',
    fontWeight: '650',
    color: '#344054',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 14px',
    border: '1px solid #d6deea',
    borderRadius: '9px',
    outline: 'none',
    fontSize: '15px',
    color: '#172033',
    background: '#ffffff',
  },

  error: {
    background: '#fff1f1',
    border: '1px solid #f3c5c5',
    color: '#b42318',
    borderRadius: '8px',
    padding: '11px 12px',
    fontSize: '13px',
    lineHeight: '1.4',
  },

  button: {
    width: '100%',
    border: 'none',
    borderRadius: '9px',
    padding: '14px',
    background: '#2563eb',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    marginTop: '4px',
    transition: '0.2s',
  },

  footer: {
    textAlign: 'center',
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid #edf0f5',
    color: '#8a95a6',
    fontSize: '12px',
  },
};

export default Login;