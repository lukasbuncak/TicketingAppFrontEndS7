// src/routers/Student/TicketHomePage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TicketAPI from "../../api/TicketAPI";
import TicketEditor from "../../components/Student/TicketEditor.jsx";
import TicketSidebar from "../../components/Student/TicketSideBar.jsx";

const emptyDraft = { id: null, title: "", description: "", status: "DRAFT", attachments: [] };

export default function StudentHomePage() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("view"); // "view" | "create"
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Load my tickets (backend already returns newest first)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const page = await TicketAPI.listMine(0, 50);
        const items = page?.content ?? [];
        setTickets(items);

        // If not instructed to open a new draft, preselect newest ticket if any.
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

  // Create new draft helper
  const openCreate = useCallback(() => {
    setSelected({ ...emptyDraft });
    setMode("create");
  }, []);

  // If we arrived from Login with state.openNew -> open a fresh draft once
  useEffect(() => {
    if (location.state?.openNew) {
      openCreate();
      // clear state so F5/back/forward doesn’t re-trigger
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

      // Prepend the newly created ticket (backend order is newest-first)
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

          <main className="col-12 col-md-8 col-lg-9">
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-outline-dark btn-sm" onClick={signOut}>Sign out</button>
            </div>

            {err && <div className="alert alert-danger">{err}</div>}

            <TicketEditor
              key={rightEditable ? "create" : rightTicket.id}
              ticket={rightTicket}
              editable={rightEditable}
              onSubmit={onSubmitCreate}
              busy={loading}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
