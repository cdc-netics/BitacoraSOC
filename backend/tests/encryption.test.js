const { encrypt, decrypt } = require('../src/utils/encryption');

describe('encryption util', () => {
  test('encrypt/decrypt round trip', () => {
    const input = 'secret-password-123';
    const encrypted = encrypt(input);
    const decrypted = decrypt(encrypted);

    expect(encrypted).not.toEqual(input);
    expect(decrypted).toEqual(input);
  });

  test('decrypt empty returns empty', () => {
    expect(decrypt('')).toEqual('');
  });
});
