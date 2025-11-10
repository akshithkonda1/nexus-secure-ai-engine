import { render, screen } from '@testing-library/react';
import React from 'react';

function Sample() {
  return <button className="rounded-2xl px-3 py-2">Hello</button>;
}

test('renders button', () => {
  render(<Sample />);
  expect(screen.getByRole('button', { name: /hello/i })).toBeInTheDocument();
});
