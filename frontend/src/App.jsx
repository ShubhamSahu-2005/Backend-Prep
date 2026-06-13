import React, { useState, useEffect } from 'react';
import { ShoppingBag, Lock, Mail, User, LogOut, CheckCircle, AlertTriangle, CreditCard, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:3000';

const PRODUCTS_LIST = [
  { id: 'prod_1', name: 'Premium AI Code Assistant course', price: 999 },
  { id: 'prod_2', name: 'Elite Backend Prep Guide (PDF)', price: 149 },
  { id: 'prod_3', name: 'Developer Productivity Bundle', price: 299 }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [view, setView] = useState('login'); // login, register, checkout, success
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Cart state
  const [cart, setCart] = useState(
    PRODUCTS_LIST.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {})
  );
  
  // Payment success details
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (token) {
      // Decode simple JWT to show user email or name
      try {
        const payloadBase64 = token.split('.')[1];
        const decoded = JSON.parse(atob(payloadBase64));
        setUser({ email: decoded.email, id: decoded.id });
        setView('checkout');
      } catch (e) {
        handleLogout();
      }
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setView('login');
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.errors?.[0]?.message || 'Registration failed');
      
      setSuccess('Registration successful! Please log in.');
      setView('login');
      setFormData({ name: '', email: formData.email, password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid email or password');

      localStorage.setItem('token', data.accessToken);
      setToken(data.accessToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const nextVal = Math.max(0, current + change);
      return { ...prev, [id]: nextVal };
    });
  };

  const getSubtotal = () => {
    return PRODUCTS_LIST.reduce((sum, item) => sum + item.price * (cart[item.id] || 0), 0);
  };

  // Dynamic injection of Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    setError('');
    setLoading(true);

    const subtotal = getSubtotal();
    if (subtotal <= 0) {
      setError('Please add at least one item to your cart.');
      setLoading(false);
      return;
    }

    // Build items array matching model.js Order products schema
    const products = PRODUCTS_LIST.filter(p => cart[p.id] > 0).map(p => ({
      productName: p.name,
      productQuantity: String(cart[p.id])
    }));

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you offline?');
      }

      // 2. Call backend to create Razorpay Order
      const res = await fetch(`${API_BASE}/order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: subtotal,
          products,
          orderStatus: 'Pending'
        })
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || 'Failed to create order on the server');

      // 3. Configure Razorpay checkout options
      const options = {
        key: orderData.key_id || 'rzp_test_mockkeyid', // Razorpay Key ID
        amount: orderData.amount, // Amount in paise
        currency: orderData.currency,
        name: 'Backend-Prep Test Shop',
        description: 'Test Razorpay Payment Integration',
        order_id: orderData.id,
        handler: async function (response) {
          setLoading(true);
          try {
            // 4. Send response data to backend to verify signature
            const verifyRes = await fetch(`${API_BASE}/order/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message || 'Signature verification failed');

            setPaymentDetails({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id
            });
            setView('success');
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || 'Test User',
          email: user?.email || 'test@example.com'
        },
        theme: {
          color: '#66fcf1'
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`glass-container ${view === 'checkout' ? 'wide' : ''}`}>
      {error && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {view === 'login' && (
        <form onSubmit={handleLogin}>
          <h2 className="title">Login</h2>
          <p className="subtitle">Sign in to check out products</p>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-secondary)' }} size={18} />
              <input
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="developer@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-secondary)' }} size={18} />
              <input
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <p className="footer-text">
            Don't have an account?{' '}
            <span className="footer-link" onClick={() => { setView('register'); setError(''); }}>
              Register here
            </span>
          </p>
        </form>
      )}

      {view === 'register' && (
        <form onSubmit={handleRegister}>
          <h2 className="title">Register</h2>
          <p className="subtitle">Create an account to start testing payments</p>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-secondary)' }} size={18} />
              <input
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-secondary)' }} size={18} />
              <input
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="developer@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-secondary)' }} size={18} />
              <input
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Create Account'}
          </button>

          <p className="footer-text">
            Already have an account?{' '}
            <span className="footer-link" onClick={() => { setView('login'); setError(''); }}>
              Login here
            </span>
          </p>
        </form>
      )}

      {view === 'checkout' && (
        <div>
          <div className="user-profile">
            <div>
              <span className="user-name">Welcome, {user?.email}</span>
            </div>
            <span className="logout-link" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </span>
          </div>

          <h2 className="title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Checkout Center</h2>

          <div className="grid">
            {/* Products Card */}
            <div className="card">
              <h3 style={{ borderBottom: '1px solid rgba(197, 198, 199, 0.1)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                Select Products
              </h3>
              {PRODUCTS_LIST.map((prod) => (
                <div key={prod.id} className="product-item">
                  <div className="product-info">
                    <span className="product-name">{prod.name}</span>
                    <span className="product-price">₹{prod.price}</span>
                  </div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQuantity(prod.id, -1)}>-</button>
                    <span className="qty-val">{cart[prod.id] || 0}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(prod.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="card" style={{ background: 'rgba(102, 252, 241, 0.03)', border: '1px solid rgba(102, 252, 241, 0.2)' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Payment Summary</h3>
              {PRODUCTS_LIST.map(prod => cart[prod.id] > 0 ? (
                <div key={prod.id} className="summary-row">
                  <span>{prod.name} (x{cart[prod.id]})</span>
                  <span>₹{prod.price * cart[prod.id]}</span>
                </div>
              ) : null)}
              
              {getSubtotal() === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: '2rem 0', textAlign: 'center' }}>
                  Your cart is empty.
                </p>
              )}

              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{getSubtotal()}</span>
              </div>

              <button className="btn" style={{ marginTop: '1.5rem' }} onClick={handleCheckout} disabled={loading || getSubtotal() <= 0}>
                <CreditCard size={18} style={{ marginRight: '8px' }} />
                {loading ? 'Processing Order...' : 'Pay with Razorpay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'success' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <CheckCircle size={72} color="var(--success-color)" style={{ marginBottom: '1.5rem' }} />
          <h2 className="title" style={{ color: 'var(--success-color)' }}>Payment Verified!</h2>
          <p className="subtitle" style={{ marginBottom: '2.5rem' }}>Your order has been placed and verified successfully</p>

          <div className="card" style={{ textAlign: 'left', marginBottom: '2.5rem', maxWidth: '400px', marginInline: 'auto' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(197, 198, 199, 0.1)', paddingBottom: '0.5rem' }}>
              Transaction Info
            </h3>
            <div className="summary-row" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span>Order ID:</span>
              <code style={{ fontSize: '0.85rem' }}>{paymentDetails?.orderId}</code>
            </div>
            <div className="summary-row" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span>Payment ID:</span>
              <code style={{ fontSize: '0.85rem' }}>{paymentDetails?.paymentId}</code>
            </div>
            <div className="summary-row" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span>Verification Status:</span>
              <span style={{ color: 'var(--success-color)', fontWeight: '600' }}>Confirmed</span>
            </div>
          </div>

          <button className="btn btn-secondary" style={{ maxWidth: '280px' }} onClick={() => { setView('checkout'); setPaymentDetails(null); }}>
            Back to Checkout
          </button>
        </div>
      )}
    </div>
  );
}
