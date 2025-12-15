export default function AuthPage() {
  return (
    <div className="auth-page">
      <div className="aurora" aria-hidden />
      <div className="auth-card glass">
        <div className="auth-heading">Access Ryuzen</div>
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
      </div>
    </div>
  );
}
