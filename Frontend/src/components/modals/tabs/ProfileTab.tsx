import React from 'react';
const ProfileTab: React.FC = () => (
  <form className="chatgpt-form" onSubmit={(e)=> e.preventDefault()}>
    <div>
      <label style={{ display:'block', fontSize:'0.8rem', marginBottom:'0.35rem', opacity:0.7 }}>Display name</label>
      <input className="chatgpt-input" defaultValue="Akshith" />
    </div>
    <div>
      <label style={{ display:'block', fontSize:'0.8rem', marginBottom:'0.35rem', opacity:0.7 }}>Email</label>
      <input className="chatgpt-input" defaultValue="akkikonda2000@gmail.com" />
    </div>
    <div className="chatgpt-form-actions">
      <button type="button" className="chatgpt-button">Cancel</button>
      <button type="submit" className="chatgpt-button primary">Save changes</button>
    </div>
  </form>
);
export default ProfileTab;
