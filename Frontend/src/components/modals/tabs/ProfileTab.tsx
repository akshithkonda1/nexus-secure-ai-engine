import React from 'react';
const ProfileTab: React.FC = () => (
  <form className="space-y-3 text-sm" onSubmit={(e)=> e.preventDefault()}>
    <div><label className="block mb-1">Display name</label><input className="w-full px-3 py-2 rounded-xl card-token" defaultValue="Akshith" /></div>
    <div><label className="block mb-1">Email</label><input className="w-full px-3 py-2 rounded-xl card-token" defaultValue="akkikonda2000@gmail.com" /></div>
    <div className="flex justify-end gap-2"><button type="button" className="px-3 py-2 rounded-xl card-token">Cancel</button><button type="submit" className="px-3 py-2 rounded-xl bg-[rgb(var(--ring))] text-white">Save changes</button></div>
  </form>
);
export default ProfileTab;
