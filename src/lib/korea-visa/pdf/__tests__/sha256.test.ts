/**
 * sha256Hex must work with AND without Web Crypto: crypto.subtle only exists
 * in secure contexts (https/localhost), so plain-HTTP LAN access needs the
 * pure-JS fallback — and both paths must agree bit-for-bit, because the
 * template and drafts are keyed by this hash.
 */
import { sha256Hex } from '../sha256';

const VECTORS: [label: string, input: Uint8Array, hex: string][] = [
  ['empty', new Uint8Array(0), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
  [
    'abc',
    new TextEncoder().encode('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  ],
  [
    '448-bit NIST vector',
    new TextEncoder().encode('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'),
    '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
  ],
];

const realCrypto = globalThis.crypto;
const stubNoSubtle = () =>
  Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true });

afterEach(() => {
  Object.defineProperty(globalThis, 'crypto', { value: realCrypto, configurable: true });
});

describe('sha256Hex with Web Crypto (secure context)', () => {
  it.each(VECTORS)('%s', async (_label, input, hex) => {
    expect(typeof globalThis.crypto?.subtle?.digest).toBe('function'); // node has it
    expect(await sha256Hex(input)).toBe(hex);
  });
});

describe('sha256Hex without Web Crypto (plain-HTTP LAN origin)', () => {
  it.each(VECTORS)('%s', async (_label, input, hex) => {
    stubNoSubtle();
    expect(await sha256Hex(input)).toBe(hex);
  });

  it('agrees with Web Crypto across block-boundary lengths', async () => {
    // 0..130 covers both sides of the 55/56 and 119/120 padding boundaries.
    for (let len = 0; len <= 130; len++) {
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = (i * 31 + len * 7) & 0xff;
      const viaSubtle = await sha256Hex(bytes);
      stubNoSubtle();
      const viaFallback = await sha256Hex(bytes);
      Object.defineProperty(globalThis, 'crypto', { value: realCrypto, configurable: true });
      expect(viaFallback).toBe(viaSubtle);
    }
  });
});
