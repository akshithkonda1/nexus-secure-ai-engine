import { create } from "zustand";
type S = { theme: "light"|"dark"; setTheme:(t:S["theme"])=>void; rateLimited:boolean; setRateLimited:(b:boolean)=>void; };
export const useSession = create<S>((set)=>(
  {
    theme: "dark", setTheme:(theme)=>set({theme}),
    rateLimited:false, setRateLimited:(rateLimited)=>set({rateLimited})
  }
));
