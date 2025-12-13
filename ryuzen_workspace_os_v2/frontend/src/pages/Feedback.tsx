import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const close = () => navigate("/", { replace: true });

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel glass-panel" style={{ width: 520 }}>
        <button type="button" className="close-button" aria-label="Close feedback" onClick={close}>
          ✕
        </button>
        {!submitted ? (
          <div style={{ display: "grid", gap: 12 }}>
            <h3 style={{ margin: 0 }}>We'd love your feedback</h3>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share anything — tone, quality, or what feels cosmic."
              style={{
                width: "100%",
                borderRadius: 14,
                border: "1px solid var(--border-strong)",
                background: "var(--bg-surface)",
                padding: 12,
                color: "var(--text-primary)",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="pill-button" onClick={() => setSubmitted(true)}>
                Submit
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12, textAlign: "center" }}>
            <h3 style={{ margin: 0 }}>Thank you</h3>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>Your signal keeps Ryuzen calm and precise.</p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button type="button" className="pill-button" onClick={close}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
