export default function TicketSidebar({
    tickets,
    selectedId,
    onCreate,
    onSelect,
    disabled,
  }) {
    return (
      <div className="border rounded-3 p-3 bg-white shadow-sm">
        <div className="d-grid gap-2 mb-3">
          <button className="btn btn-dark btn-lg" onClick={onCreate} disabled={disabled}>
            Create a Ticket
          </button>
        </div>
  
        {tickets.length === 0 ? (
          <div className="text-center text-muted small py-4">No tickets yet</div>
        ) : (
          <div className="list-group">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                disabled={disabled}
                className={
                  "list-group-item list-group-item-action d-flex align-items-center gap-2 py-2 px-3" +
                  (t.id === selectedId ? " active" : "")
                }
                style={{ borderRadius: 10 }}
                title={t.title}
              >
                <span className="badge bg-secondary-subtle text-dark border me-1">#{t.id}</span>
                <span className="text-truncate" style={{ maxWidth: 160 }}>
                  {t.title || "(untitled)"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
  