import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatList from '../ChatList';
import type { Message } from '../../../types/chat';

describe('ChatList', () => {
  const makeMsg = (id: string, text: string, role: Message['role'] = 'user'): Message => ({
    id,
    role,
    text,
    ts: Date.now(),
  });

  it('renders messages when provided', () => {
    const messages: Message[] = [makeMsg('1', 'Hello'), makeMsg('2', 'Hi there', 'assistant')];

    render(<ChatList messages={messages} />);

    expect(screen.getByText('Hello')).toBeDefined();
    expect(screen.getByText('Hi there')).toBeDefined();
  });

  it('updates when a new message arrives', () => {
    const initial: Message[] = [makeMsg('1', 'First message')];
    const { rerender } = render(<ChatList messages={initial} />);

    const next: Message[] = [...initial, makeMsg('2', 'Second message', 'assistant')];
    rerender(<ChatList messages={next} />);

    expect(screen.getByText('Second message')).toBeDefined();
  });
});
