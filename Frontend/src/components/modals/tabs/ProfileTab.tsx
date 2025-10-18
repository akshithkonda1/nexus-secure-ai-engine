import React, { useEffect, useState } from 'react';
import type { UserProfile } from '../../../state/profile';

type ProfileTabProps = {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile)=>void;
  onClose: ()=>void;
  onDeleteAccount: (feedback: string | null)=>void;
};

const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onProfileChange, onClose, onDeleteAccount }) => {
  const [form,setForm]=useState<UserProfile>(profile);
  const [status,setStatus]=useState<string|null>(null);
  useEffect(()=>{ setForm(profile); },[profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file){ return; }
    const reader=new FileReader();
    reader.onload=()=>{
      setForm((prev)=>({ ...prev, avatarDataUrl: typeof reader.result==='string'? reader.result : prev.avatarDataUrl }));
      setStatus('Preview updated. Remember to save your changes.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setForm((prev)=>({ ...prev, avatarDataUrl: null }));
    setStatus('Profile photo removed.');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onProfileChange(form);
    setStatus('Changes saved!');
  };

  const handleCancel = () => {
    setForm(profile);
    setStatus('Changes discarded.');
    onClose();
  };

  const handleDeleteAccount = () => {
    const confirmed=window.confirm('Delete account? This cannot be undone.');
    if(!confirmed){
      onClose();
      return;
    }
    const feedback=window.prompt('We are sorry to see you go. Please share any feedback before we deactivate your account.');
    onDeleteAccount(feedback ?? null);
    alert('Account scheduled for deletion. Thank you for the feedback.');
  };

  return (
    <form className="chatgpt-form" onSubmit={handleSubmit}>
      <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
        {form.avatarDataUrl? (
          <img src={form.avatarDataUrl} alt="Profile preview" style={{ width:56, height:56, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--chatgpt-border-color)' }}/>
        ) : (
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--chatgpt-border-color)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem', fontWeight:600 }}>
            {form.displayName?.[0]?.toUpperCase()||'N'}
          </div>
        )}
        <div>
          <label style={{ display:'block', fontSize:'0.8rem', marginBottom:'0.35rem', opacity:0.7 }}>Profile photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {form.avatarDataUrl && (
            <button type="button" className="chatgpt-button" style={{ marginTop:'0.5rem' }} onClick={handleRemovePhoto}>Remove photo</button>
          )}
        </div>
      </div>
      <div>
        <label style={{ display:'block', fontSize:'0.8rem', marginBottom:'0.35rem', opacity:0.7 }}>Display name</label>
        <input className="chatgpt-input" value={form.displayName} onChange={e=> setForm(prev=>({ ...prev, displayName: e.target.value }))} />
      </div>
      <div>
        <label style={{ display:'block', fontSize:'0.8rem', marginBottom:'0.35rem', opacity:0.7 }}>Email</label>
        <input className="chatgpt-input" value={form.email} onChange={e=> setForm(prev=>({ ...prev, email: e.target.value }))} />
      </div>
      {status && <div style={{ fontSize:'0.75rem', opacity:0.7 }}>{status}</div>}
      <div className="chatgpt-form-actions" style={{ justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
        <button type="button" className="chatgpt-button" onClick={handleCancel}>Cancel</button>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          <button
            type="button"
            className="chatgpt-button"
            style={{ background:'var(--chatgpt-error-bg, #fee2e2)', color:'var(--chatgpt-error-text, #991b1b)' }}
            onClick={handleDeleteAccount}
          >
            Delete account
          </button>
          <button type="submit" className="chatgpt-button primary">Save changes</button>
        </div>
      </div>
    </form>
  );
};

export default ProfileTab;
