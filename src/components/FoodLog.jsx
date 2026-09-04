import { useState } from "react";
import { STATUS, PENDING_STATUSES } from "../constants/status";
import "../styles/FoodLog.css";

export default function FoodLog({ foodEntries, setFoodEntries, updateEntry, deleteEntry }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  const statusConfig = {
    [STATUS.PENDING_COLLECTION]: "badge-pending",
    [STATUS.COLLECTION_ASSIGNED]: "badge-pending",
    [STATUS.COLLECTED]: "badge-pending",
    [STATUS.IN_TRANSIT]: "badge-transit",
    [STATUS.DELIVERED]: "badge-delivered",
  };

  const cycleStatus = (id) => {
    const order = [
      STATUS.PENDING_COLLECTION,
      STATUS.COLLECTION_ASSIGNED,
      STATUS.COLLECTED,
      STATUS.IN_TRANSIT,
      STATUS.DELIVERED,
    ];
    const entry = foodEntries.find(e => e.id === id);
    if (entry) {
      const idx = order.indexOf(entry.status);
      // If status not in order (legacy), default to first
      const nextIdx = idx === -1 ? 0 : (idx + 1) % order.length;
      updateEntry(id, { status: order[nextIdx] });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(id);
    }
  };

  const filtered = foodEntries
    .filter(e => {
      const matchSearch = e.item.toLowerCase().includes(search.toLowerCase()) ||
        e.mess.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" ||
        (statusFilter === STATUS.PENDING_COLLECTION ? PENDING_STATUSES.includes(e.status) : e.status === statusFilter);
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "qty") return b.quantity - a.quantity;
      return a.item.localeCompare(b.item);
    });

  const totalKg = filtered.reduce((s, e) => s + (e.unit === "kg" ? e.quantity : 0), 0);

  return (
    <div className="log-page">
      <div className="page-section">
        <div className="log-header">
          <div>
            <div className="section-label">Records</div>
            <h1 className="section-title">Food Log</h1>
            <p className="log-subtitle">{filtered.length} entries · {totalKg.toFixed(1)} kg tracked</p>
          </div>
        </div>

        <div className="log-controls card">
          <input
            type="text"
            placeholder="🔍 Search by food name or mess..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="log-search"
          />
          <div className="filter-chips">
            {["All", STATUS.PENDING_COLLECTION, STATUS.IN_TRANSIT, STATUS.DELIVERED].map(s => (
              <button
                key={s}
                className={`chip ${statusFilter === s ? "chip-active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Sort: Newest First</option>
            <option value="qty">Sort: Quantity</option>
            <option value="name">Sort: Name A-Z</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="log-empty card">
            <span>🍽️</span>
            <p>No entries found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="log-table card">
            <div className="table-head">
              <div>Food Item</div>
              <div>Quantity</div>
              <div>Mess</div>
              <div>Date</div>
              <div>NGO</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {filtered.map((entry, i) => (
              <div
                className="table-row"
                key={entry.id}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="row-food">
                  <div className="food-avatar">
                    {entry.item.charAt(0)}
                  </div>
                  <span className="food-name-cell">{entry.item}</span>
                </div>
                <div className="row-qty">
                  {entry.quantity} <span className="unit-label">{entry.unit}</span>
                </div>
                <div className="row-mess">
                  <span className="mess-badge">{entry.mess}</span>
                </div>
                <div className="row-date">{entry.date}</div>
                <div className="row-ngo">
                  {entry.ngoName ? (
                    <span className="ngo-tag">{entry.ngoName}</span>
                  ) : (
                    <span className="ngo-none">—</span>
                  )}
                </div>
                <div>
                  <button
                    className={`badge ${statusConfig[entry.status] || "badge-pending"} status-btn`}
                    onClick={() => cycleStatus(entry.id)}
                    title="Click to advance status"
                  >
                    {entry.status}
                  </button>
                </div>
                <div className="row-actions">
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(entry.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
