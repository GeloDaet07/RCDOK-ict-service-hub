import { describe, it, expect } from '@jest/globals';
import { hashPassword } from '../crypto';

describe('hashPassword', () => {
  it('hashes a string into a SHA-256 hex string', async () => {
    const password = 'mysecretpassword';
    const hash = await hashPassword(password);
    
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64);
  });

  it('produces deterministic output for the same input', async () => {
    const password = 'consistentPassword123!';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    
    expect(hash1).toBe(hash2);
  });

  it('produces different outputs for different inputs', async () => {
    const hash1 = await hashPassword('passwordA');
    const hash2 = await hashPassword('passwordB');
    
    expect(hash1).not.toBe(hash2);
  });

  it('handles empty strings', async () => {
    const hash = await hashPassword('');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64);
  });
});
