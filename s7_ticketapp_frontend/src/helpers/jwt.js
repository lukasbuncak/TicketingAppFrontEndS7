// Base64URL → JSON
export function decodeJwt(t) {
    try {
      const [, p] = t.split(".");
      if (!p) return null;
      const json = atob(p.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch { return null; }
  }
  
  export function isTokenExpired(token, skewMs = 30_000) {
    const expSec = decodeJwt(token)?.exp;
    if (!expSec) return true;          // treat missing exp as expired
    return Date.now() + skewMs >= expSec * 1000;
  }
  
  export function getExpMs(token) {
    const p = decodeJwt(token);
    // exp is in seconds since epoch
    return p?.exp ? p.exp * 1000 : 0;
  }
  
  
  export function willExpireSoon(token, withinMs = 120_000) {
    const expMs = getExpMs(token);
    if (!expMs) return true;
    return Date.now() + withinMs >= expMs;
  }
  