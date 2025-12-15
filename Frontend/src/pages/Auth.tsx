export default function AuthPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="orb" aria-hidden="true" />
        <div className="auth-heading">Welcome to Ryuzen</div>
        <p className="muted">Sign in to access Ryuzen</p>

        <button type="button" className="primary full">
          <span>Continue with Provider</span>
        </button>

        <div className="divider">or</div>

        <form className="auth-form">
          <div className="field">
            <label>
              <span>Email</span>
            </label>
            <input type="email" placeholder="name@domain.com" />
          </div>
          <div className="field">
            <label>
              <span>Password</span>
            </label>
            <input type="password" placeholder="••••••••" />
          </div>
          <button type="submit" className="secondary full">
            <span>Continue</span>
          </button>
        </form>

        <div className="badge-row">
          <div className="badge">Secure Authentication</div>
          <div className="badge">Privacy First</div>
        </div>
      </div>
    </div>
  );
}
