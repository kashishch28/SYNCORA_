export const localCrypto = {
  encrypt(text, password) {
    if (!password) return text;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ password.charCodeAt(i % password.length));
    }
    return btoa(unescape(encodeURIComponent(result)));
  },
  decrypt(cipher, password) {
    if (!password) return null;
    try {
      const decoded = decodeURIComponent(escape(atob(cipher)));
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ password.charCodeAt(i % password.length));
      }
      return result;
    } catch { return null; }
  },
};
