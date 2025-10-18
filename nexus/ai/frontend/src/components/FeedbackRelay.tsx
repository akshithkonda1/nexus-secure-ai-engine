import React, { useState } from 'react';

const FeedbackRelay: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, email, timestamp: new Date().toISOString() }),
      });
      setStatus('sent');
      setFeedback('');
      setEmail('');
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'sent') return <div>Thank you for your feedback!</div>;
  if (status === 'error')
    return <div style={{ color: 'red' }}>There was a problem sending your feedback. Please try again.</div>;

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16, background: '#f6f6f8', borderRadius: 8 }}>
      <label>
        Your Feedback:<br />
        <textarea
          required
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          style={{ width: '100%', margin: '8px 0' }}
        />
      </label>
      <label>
        (Optional) Email for follow-up:<br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', margin: '8px 0' }}
        />
      </label>
      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Send Feedback'}
      </button>
    </form>
  );
};

export default FeedbackRelay;
