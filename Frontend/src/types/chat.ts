export type Role = 'user' | 'assistant';
export interface Message { id: string; role: Role; text: string; ts: number; meta?: string }
