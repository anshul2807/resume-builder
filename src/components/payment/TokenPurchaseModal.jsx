import React, { useState } from 'react';
import { BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const PLANS = [
  { id: 'starter', price: 50, tokens: 50, label: 'Starter',  perToken: '₹1.00' },
  { id: 'popular', price: 100, tokens: 120, label: 'Popular', perToken: '₹0.83', badge: 'Best Value' },
  { id: 'pro',     price: 200, tokens: 250, label: 'Pro',     perToken: '₹0.80', badge: 'Most Tokens' },
];

/** Load Razorpay checkout script once */
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const TokenPurchaseModal = ({ isOpen, onClose }) => {
  const { token, user, refreshUsage } = useAuth();
  const [selected, setSelected] = useState('popular');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handlePurchase = async () => {
    setStatus('loading');
    setErrorMsg('');

    const ok = await loadRazorpay();
    if (!ok) {
      setErrorMsg('Failed to load payment gateway. Please try again.');
      setStatus('error');
      return;
    }

    try {
      // 1. Create order on backend
      const res = await fetch(`${BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planId: selected }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create order.');
      }
      const { orderId, amount, currency, keyId } = await res.json();
      const plan = PLANS.find((p) => p.id === selected);

      // 2. Open Razorpay checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Draft2paper',
        description: `${plan.tokens} AI Tokens`,
        order_id: orderId,
        prefill: { email: user?.email || '', name: user?.name || '' },
        theme: { color: '#4f46e5' },
        handler: async (response) => {
          // 3. Verify on backend
          try {
            const verifyRes = await fetch(`${BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: selected,
              }),
            });
            if (!verifyRes.ok) throw new Error('Verification failed');
            setStatus('success');
            refreshUsage();
            setTimeout(() => { onClose(); setStatus('idle'); }, 2000);
          } catch {
            setErrorMsg('Payment received but verification failed. Contact support.');
            setStatus('error');
          }
        },
        modal: {
          ondismiss: () => setStatus('idle'),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setErrorMsg('Payment failed. Please try again.');
        setStatus('error');
      });
      rzp.open();
      setStatus('idle');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong.');
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="token-modal-overlay" onClick={(e) => e.target === e.currentTarget && status !== 'loading' && onClose()}>
      <div className="token-modal">

        {/* Header */}
        <div className="token-modal-header">
          <div>
            <h2 className="token-modal-title">Get More Tokens</h2>
            <p className="token-modal-subtitle">Power your AI features with token packs</p>
          </div>
          <button className="token-modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
          </button>
        </div>

        {/* Plans */}
        <div className="token-modal-body">
          {status === 'success' ? (
            <div className="token-success">
              <div className="token-success-icon">✓</div>
              <p className="token-success-title">Tokens Added!</p>
              <p className="token-success-sub">Your account has been topped up successfully.</p>
            </div>
          ) : (
            <>
              <div className="token-plans">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    className={`token-plan-card ${selected === plan.id ? 'token-plan-selected' : ''}`}
                    onClick={() => setSelected(plan.id)}
                  >
                    {plan.badge && <span className="token-plan-badge">{plan.badge}</span>}
                    <p className="token-plan-tokens">{plan.tokens}</p>
                    <p className="token-plan-tokens-label">tokens</p>
                    <p className="token-plan-price">₹{plan.price}</p>
                    <p className="token-plan-per">{plan.perToken}/token</p>
                  </button>
                ))}
              </div>

              {/* What tokens do */}
              <div className="token-info-grid">
                {[
                  { icon: '✦', text: 'AI text enhancement', cost: '1 token' },
                  { icon: '📊', text: 'ATS score check', cost: '1 token' },
                  { icon: '📥', text: 'Download PDF', cost: '5 tokens' },
                  { icon: '📄', text: 'Import resume', cost: '10 tokens' },
                ].map((item) => (
                  <div key={item.text} className="token-info-row">
                    <span className="token-info-icon">{item.icon}</span>
                    <span className="token-info-text">{item.text}</span>
                    <span className="token-info-cost">{item.cost}</span>
                  </div>
                ))}
              </div>

              {errorMsg && (
                <div className="token-error">{errorMsg}</div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {status !== 'success' && (
          <div className="token-modal-footer">
            <button className="token-cancel-btn" onClick={onClose} disabled={status === 'loading'}>Cancel</button>
            <button className="token-buy-btn" onClick={handlePurchase} disabled={status === 'loading'}>
              {status === 'loading' ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Processing…</>
              ) : (
                <>Buy {PLANS.find(p => p.id === selected)?.tokens} Tokens — ₹{PLANS.find(p => p.id === selected)?.price}</>
              )}
            </button>
          </div>
        )}

        {/* Secure badge */}
        <p className="token-secure-note">
          <svg viewBox="0 0 20 20" fill="currentColor" style={{width:12,height:12}}><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
          Secured by Razorpay • 256-bit encryption
        </p>
      </div>
    </div>
  );
};

export default TokenPurchaseModal;
