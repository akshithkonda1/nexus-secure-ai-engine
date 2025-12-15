export default function AuthPage() {
  return (
    <div className="auth-page">
      <div className="aurora" aria-hidden />
      <div className="auth-card">
        <div className="orb" aria-hidden />
        <div className="auth-heading">Secure access to Ryuzen</div>
        <p className="muted">Authenticate quietly with your provider or credentials.</p>
        <button type="button" className="primary full">Continue with Provider</button>
        <div className="divider">or</div>
        <form className="auth-form">
          <label className="field">
            <span>Email</span>
            <input type="email" placeholder="name@domain.com" />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" placeholder="••••••••" />
          </label>
          <button type="submit" className="secondary full">Continue</button>
        </form>
        <div className="badge-row">
          <div className="badge">No marketing. Just access.</div>
          <div className="badge">SF Pro only</div>
        </div>
      </div>
    </div>
  );
}
