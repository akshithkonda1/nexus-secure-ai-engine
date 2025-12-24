/**
 * Type definitions for Toron sidebar components
 * Design System: Ultra-minimalist, precision-crafted types
 */

export type MenuType = 'chats' | 'projects';

export interface Chat {
  id: string;
  title: string;
  preview?: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  isActive?: boolean;
  isPinned?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  chatIds: string[];
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  isActive?: boolean;
}

export interface ChatGroup {
  label: string;
  chats: Chat[];
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  danger?: boolean;
  separator?: boolean;
}
