import { describe, it, expect } from 'vitest';
import { genId } from '../lib/id';
describe('genId',()=>{
  it('unique-ish',()=>{
    const set=new Set([genId(),genId(),genId(),genId()]);
    expect(set.size).toBe(4);
  });
});
