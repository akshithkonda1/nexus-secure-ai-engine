declare module "vitest" {
  export const describe: (...args: any[]) => void;
  export const it: (...args: any[]) => void;
  export const expect: any;
}

declare module "zustand" {
  type PartialState<T> = Partial<T> | ((state: T) => Partial<T>);
  type SetState<T> = (partial: PartialState<T>, replace?: boolean) => void;
  type GetState<T> = () => T;
  type StoreApi<T> = {
    setState: SetState<T>;
    getState: GetState<T>;
    subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  };
  export type StateCreator<T> = (set: SetState<T>, get: GetState<T>, api: StoreApi<T>) => T;
  export function create<T>(initializer: StateCreator<T>): StoreApi<T> & (() => T);
}

declare module "@/lib/api" {
  export const API_URL: string;
  export const api: {
    ask: (body: { prompt: string }) => Promise<any>;
    feedback: (body: { answerId: string; rating: "up" | "down"; tag?: string }) => Promise<any>;
    events: (events: any[]) => Promise<any>;
  };
}
