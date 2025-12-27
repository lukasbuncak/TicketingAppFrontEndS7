// src/routers/Student/TicketHomePage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import TicketAPI from "../../api/TicketAPI";
import MfaSetupModal from "../../components/Student/MfaSetupModal";
import TicketEditor from "../../components/Student/TicketEditor.jsx";
import TicketSidebar from "../../components/Student/TicketSideBar.jsx";

const emptyDraft = { id: null, title: "", description: "", status: "DRAFT", attachments: [] };

export default function StudentHomePage() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("view");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showMfa, setShowMfa] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const page = await TicketAPI.listMine(0, 50);
        const items = page?.content ?? [];
        setTickets(items);

        if (!location.state?.openNew && items.length) {
          setSelected(items[0]);
          setMode("view");
        } else {
          setSelected(null);
          setMode("create");
        }
      } catch (e) {
        setErr(e.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = useCallback(() => {
    setSelected({ ...emptyDraft });
    setMode("create");
  }, []);

  useEffect(() => {
    if (location.state?.openNew) {
      openCreate();
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate, openCreate]);

  const onSelectTicket = async (ticketId) => {
    try {
      setLoading(true);
      const t = await TicketAPI.getById(ticketId);
      setSelected(t);
      setMode("view");
      setErr("");
    } catch (e) {
      setErr(e.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitCreate = async (draft) => {
    try {
      setLoading(true);
      const created = await TicketAPI.create({
        title: (draft.title || "").trim(),
        description: (draft.description || "").trim(),
      });

      setTickets((prev) => [created, ...prev]);
      setSelected(created);
      setMode("view");
      setErr("");
    } catch (e) {
      setErr(e.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  const rightEditable = mode === "create";
  const rightTicket = useMemo(() => selected ?? emptyDraft, [selected]);

  const signOut = () => {
    localStorage.removeItem("access_token");
    navigate("/", { replace: true });
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container-xxl">
        <div className="row g-4">
          <aside className="col-12 col-md-4 col-lg-3">
            <TicketSidebar
              tickets={tickets}
              selectedId={selected?.id ?? null}
              onCreate={openCreate}
              onSelect={onSelectTicket}
              disabled={loading}
            />
          </aside>

          <main className="col-12 col-md-8 col-lg-9 position-relative">
            <div className="d-flex justify-content-end mb-3 gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={() => setShowMfa(true)}
                disabled={loading}
              >
                Set up MFA
              </button>
              <button
                className="btn btn-outline-dark btn-sm"
                onClick={signOut}
              >
                Sign out
              </button>
            </div>

            {err && <div className="alert alert-danger">{err}</div>}

            <TicketEditor
              key={rightEditable ? "create" : rightTicket.id}
              ticket={rightTicket}
              editable={rightEditable}
              onSubmit={onSubmitCreate}
              busy={loading}
            />

            <MfaSetupModal open={showMfa} onClose={() => setShowMfa(false)} />
          </main>
        </div>
      </div>
    </div>
  );
}
