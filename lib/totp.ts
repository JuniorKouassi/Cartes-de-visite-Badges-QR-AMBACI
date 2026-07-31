const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const DIGITS = 6;

export function generateTotpSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return base32Encode(bytes);
}

function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(input: string): Uint8Array {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

async function hotp(secret: Uint8Array, counter: number): Promise<string> {
  const counterBytes = new ArrayBuffer(8);
  const view = new DataView(counterBytes);
  // JS numbers are safe up to 2^53; counter (unix time / 30s) won't overflow 32 bits for ~2000 years.
  view.setUint32(4, counter, false);

  const key = await crypto.subtle.importKey(
    "raw",
    secret as BufferSource,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, counterBytes));

  const offset = signature[signature.length - 1] & 0x0f;
  const binCode =
    ((signature[offset] & 0x7f) << 24) |
    ((signature[offset + 1] & 0xff) << 16) |
    ((signature[offset + 2] & 0xff) << 8) |
    (signature[offset + 3] & 0xff);

  return String(binCode % 10 ** DIGITS).padStart(DIGITS, "0");
}

export async function generateTotpCode(secretBase32: string, forTimeMs = Date.now()): Promise<string> {
  const secret = base32Decode(secretBase32);
  const counter = Math.floor(forTimeMs / 1000 / STEP_SECONDS);
  return hotp(secret, counter);
}

/** Accepts the current time step and one step before/after to tolerate clock drift. */
export async function verifyTotpCode(secretBase32: string, code: string, window = 1): Promise<boolean> {
  const clean = code.trim();
  if (!/^\d{6}$/.test(clean)) return false;

  const secret = base32Decode(secretBase32);
  const counter = Math.floor(Date.now() / 1000 / STEP_SECONDS);

  for (let offset = -window; offset <= window; offset++) {
    const candidate = await hotp(secret, counter + offset);
    if (candidate === clean) return true;
  }
  return false;
}

export function buildOtpAuthUri(email: string, secretBase32: string, issuer = "AMBACI Vienne"): string {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
