import { describe, it, expect } from 'vitest';
import { priorityTier } from '../lib/priority';
describe('priorityTier',()=>{
  it('classifies',()=>{
    expect(priorityTier(1)).toBe('low');
    expect(priorityTier(3)).toBe('medium');
    expect(priorityTier(4)).toBe('high');
  });
});
