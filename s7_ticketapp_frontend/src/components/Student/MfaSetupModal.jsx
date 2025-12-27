import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";

import mfaApi from "../../api/mfapi";

export default function MfaSetupModal({ open, onClose }) {
  const [mfaUrl, setMfaUrl] = useState(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(false); // <- do I already have MFA?

  // When modal opens, check status and maybe start setup
  useEffect(() => {
    if (!open) return;

    setMfaUrl(null);
    setCode("");
    setStatus("");
    setBusy(true);
    setEnabled(false);

    (async () => {
      try {
        // 1) Ask backend if MFA is enabled
        const { enabled, pending } = await mfaApi.status();
        if (enabled) {
          setEnabled(true);
          setStatus(
            "Multi-Factor Authentication is already enabled for your account."
          );
          return; // don't start setup
        }

        // 2) If not enabled → start setup
        const { otpAuthUrl } = await mfaApi.setup();
        setMfaUrl(otpAuthUrl);
        setStatus(
          "Scan the QR code with your authenticator app, then enter the 6-digit code."
        );
      } catch (e) {
        setStatus(e.message || "Failed to initialize MFA");
      } finally {
        setBusy(false);
      }
    })();
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setStatus("Enter a valid 6-digit code.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      await mfaApi.confirm(code);
      setEnabled(true);
      setStatus("✅ MFA successfully enabled for your account.");
      setMfaUrl(null); // no need to keep showing QR
    } catch (e) {
      setStatus(e.message || "Failed to confirm MFA");
    } finally {
      setBusy(false);
    }
  };

  const disableMfa = async () => {
    if (!window.confirm("Are you sure you want to disable MFA?")) return;
    setBusy(true);
    setStatus("");
    try {
      await mfaApi.disable();
      setEnabled(false);
      setMfaUrl(null);
      setCode("");
      setStatus("MFA disabled. You can set it up again later.");
    } catch (e) {
      setStatus(e.message || "Failed to disable MFA");
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (busy) return; // prevent closing while mid-request
    onClose();
  };

  return (
    <div
      className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1050 }}
    >
      <div className="bg-white rounded-3 shadow p-4" style={{ maxWidth: 420, width: "100%" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            {enabled ? "Manage Multi-Factor Authentication" : "Set up Multi-Factor Authentication"}
          </h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleClose}
            disabled={busy}
          />
        </div>

        {/* STATUS TEXT */}
        {status && <p className="small mb-3">{status}</p>}

        {/* CASE 1: MFA already enabled → show Disable button */}
        {enabled && !mfaUrl && (
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleClose}
              disabled={busy}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={disableMfa}
              disabled={busy}
            >
              Disable MFA
            </button>
          </div>
        )}

        {/* CASE 2: MFA not enabled → show QR + confirm form */}
        {!enabled && mfaUrl && (
          <>
            <div className="d-flex justify-content-center mb-3">
              <QRCodeCanvas value={mfaUrl} size={180} />
            </div>

            <p className="small text-muted mb-3">
              Scan this QR code with Google Authenticator, Microsoft Authenticator or another TOTP app.
              Then enter the 6-digit code it shows you.
            </p>

            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">Authentication code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  inputMode="numeric"
                  disabled={busy}
                  required
                />
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClose}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={busy || !/^\d{6}$/.test(code)}
                >
                  {busy ? "Verifying…" : "Confirm"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* While initializing (no mfaUrl, not enabled yet) */}
        {!enabled && !mfaUrl && !status && (
          <p className="text-muted small mb-3">Initializing MFA setup…</p>
        )}
      </div>
    </div>
  );
}
