import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const cliPath = path.resolve(__dirname, '../build/index.js');

describe('CLI entry (build/index.js)', () => {
  it('should exist after build', () => {
    expect(fs.existsSync(cliPath)).toBe(true);
  });

  it('should be executable', () => {
    const stat = fs.statSync(cliPath);
    // Check owner execute bit
    expect(stat.mode & 0o100).toBeTruthy();
  });
});