import React, { useCallback, useState } from 'react';
import { sendFeedback } from '../../../lib/feedback';

const MAX_CHARS = 15000;

type StatusState = { tone: 'idle' | 'success' | 'error'; message: string } | null;

const SystemFeedbackTab: React.FC = () => {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<StatusState>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setStatus({ tone: 'error', message: 'Add a few words so we can understand your feedback.' });
      return;
    }
    setSubmitting(true);
    setStatus({ tone: 'idle', message: '' });
    try {
      const ok = await sendFeedback({ score: 5, note: trimmed, route: 'system-feedback' });
      if (ok) {
        setStatus({ tone: 'success', message: 'Thanks! Your feedback has been sent.' });
        setMessage('');
      } else {
        setStatus({ tone: 'error', message: 'We could not send your feedback. Please try again.' });
      }
    } catch (err) {
      console.error('Failed to submit system feedback', err);
      setStatus({ tone: 'error', message: 'We could not send your feedback. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }, [message]);

  return (
    <div className="chatgpt-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h3 style={{ margin: 0 }}>System feedback</h3>
        <p style={{ fontSize: '0.9rem', opacity: 0.75, margin: '0.35rem 0 0' }}>
          Share anything that will help us improve Nexus. There is no daily limit — send feedback whenever inspiration
          strikes.
        </p>
      </div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontWeight: 600 }}>Feedback</span>
        <textarea
          rows={8}
          maxLength={MAX_CHARS}
          value={message}
          onChange={event => {
            setMessage(event.target.value);
            if (status?.tone !== 'idle') {
              setStatus(null);
            }
          }}
          placeholder="Tell us what’s working well, what needs attention, or what you’d love to see next."
          style={{
            resize: 'vertical',
            minHeight: '8rem',
            font: 'inherit',
            padding: '0.75rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(0,0,0,0.25)',
            color: 'inherit',
          }}
        />
        <small style={{ alignSelf: 'flex-end', opacity: 0.6 }}>{message.length.toLocaleString()} / 15,000 characters</small>
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="chatgpt-button primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Sending…' : 'Send feedback'}
        </button>
      </div>
      {status && status.tone !== 'idle' && (
        <p
          role="status"
          style={{
            margin: 0,
            fontSize: '0.85rem',
            color: status.tone === 'success' ? '#4ade80' : '#f87171',
          }}
        >
          {status.message}
        </p>
      )}
    </div>
  );
};

export default SystemFeedbackTab;
