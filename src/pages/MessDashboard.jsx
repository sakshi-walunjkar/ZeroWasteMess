import { useState, useEffect } from 'react';
import { Package, Plus, Clock, CheckCircle, Truck, TrendingUp, UtensilsCrossed, X, AlertTriangle, Trash2 } from 'lucide-react';
import { foodService, notificationService, workflowService } from '../services/database';
import '../styles/MessDashboard.css';

const MESS_LOCATIONS = {
  'Hostel A Mess': { lat: 28.6139, lng: 77.2090 },
  'Hostel B Mess': { lat: 28.6149, lng: 77.2100 },
  'Hostel C Mess': { lat: 28.6159, lng: 77.2110 },
  'Hostel D Mess': { lat: 28.6169, lng: 77.2120 },
  'Hostel E Mess': { lat: 28.6179, lng: 77.2130 },
  'Hostel F Mess': { lat: 28.6189, lng: 77.2140 },
  'Hostel G Mess': { lat: 28.6199, lng: 77.2150 },
  'Hostel H Mess': { lat: 28.6209, lng: 77.2160 },
  'Hostel I Mess': { lat: 28.6219, lng: 77.2170 },
  'Hostel J Mess': { lat: 28.6229, lng: 77.2180 },
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`mess-toast mess-toast-${type}`}>{msg}</div>;
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="mess-modal-overlay">
      <div className="mess-modal">
        <div className="mess-modal-title">{title}</div>
        <div className="mess-modal-msg">{message}</div>
        <div className="mess-modal-actions">
          <button className="mess-modal-cancel" onClick={onCancel}>Keep Entry</button>
          <button className="mess-modal-confirm danger" onClick={onConfirm}>Yes, Cancel Entry</button>
        </div>
      </div>
    </div>
  );
}

const STATUS_STEPS = ['Pending Collection', 'Collection Assigned', 'Collected', 'In Transit', 'Delivered'];
const STATUS_ICONS = ['📝', '👤', '📦', '🚚', '✅'];

export default function MessDashboard({ user }) {
  const [stats, setStats] = useState({});
  const [myEntries, setMyEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const BLANK_ITEM = { item: '', quantity: '', unit: 'kg', meal: 'lunch', condition: 'fresh', notes: '' };
  const [items, setItems] = useState([{ ...BLANK_ITEM }]);

  const updateItem = (i, field, val) => setItems(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  const addItem = () => setItems(prev => [...prev, { ...BLANK_ITEM }]);
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    const allEntries = foodService.getAll();
    const messEntries = allEntries.filter(e => e.loggedBy === user.email);
    setMyEntries(messEntries);
    setStats({
      total: messEntries.length,
      pending: messEntries.filter(e => ['Pending Collection', 'Collection Assigned'].includes(e.status)).length,
      collected: messEntries.filter(e => e.status === 'Collected').length,
      delivered: messEntries.filter(e => e.status === 'Delivered').length,
      totalKg: messEntries.reduce((sum, e) => {
        if (e.unit === 'kg') return sum + e.quantity;
        if (e.unit === 'pieces') return sum + e.quantity * 0.1;
        if (e.unit === 'litres') return sum + e.quantity * 0.5;
        return sum;
      }, 0)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const base = {
      mess: user.mess,
      messLocation: MESS_LOCATIONS[user.mess] || { lat: 28.6139, lng: 77.2090 },
      date: new Date().toISOString().split('T')[0],
      loggedBy: user.email,
      status: 'Pending Collection',
      workflow: 'Awaiting Collection'
    };
    items.forEach(row => {
      const entry = { ...base, ...row, quantity: parseFloat(row.quantity) };
      const newEntry = foodService.create(entry);
      notificationService.notifyNGOs(newEntry);
    });
    setItems([{ ...BLANK_ITEM }]);
    setShowForm(false);
    showToast(`✅ ${items.length} food ${items.length === 1 ? 'entry' : 'entries'} logged — Admin & NGOs notified`);
    loadData();
  };

  const handleCancelEntry = (entryId) => {
    setCancelModal(entryId);
  };

  const confirmCancel = () => {
    const result = workflowService.cancelOwnEntry(cancelModal, user.email);
    setCancelModal(null);
    if (result) {
      showToast('Entry cancelled', 'warning');
      loadData();
    } else {
      showToast('Cannot cancel — entry already in progress', 'error');
    }
  };

  const getStepIndex = (status) => STATUS_STEPS.indexOf(status);

  return (
    <div className="mess-dashboard">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {cancelModal && (
        <ConfirmModal
          title="❌ Cancel Food Entry"
          message="This will permanently remove this entry. You can only cancel entries that are still Pending Collection."
          onConfirm={confirmCancel}
          onCancel={() => setCancelModal(null)}
        />
      )}

      <div className="page-section">
        {/* Header */}
        <div className="mess-header">
          <div>
            <div className="section-label">Mess Staff Portal</div>
            <h1 className="section-title">{user.mess}</h1>
            <p className="dash-subtitle">Welcome, {user.name}</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> Log Leftover Food
          </button>
        </div>

        {/* Permission notice */}
        <div className="mess-permission-notice">
          <div className="mess-perm-row"><CheckCircle size={13} className="green" /><span>You can <strong>log new food entries</strong> and <strong>cancel your own Pending entries</strong></span></div>
          <div className="mess-perm-row"><AlertTriangle size={13} className="amber" /><span>Once Admin assigns a collector, you <strong>cannot cancel</strong> the entry</span></div>
          <div className="mess-perm-row"><X size={13} className="red" /><span>You <strong>cannot</strong> assign staff, approve NGO requests, or modify other mess entries</span></div>
        </div>

        {/* Stats */}
        <div className="mess-stats-row">
          <div className="mess-stat mess-stat-gray"><Package size={18} /><div><div className="mess-stat-val">{stats.total || 0}</div><div className="mess-stat-lbl">Total Logged</div></div></div>
          <div className="mess-stat mess-stat-amber"><Clock size={18} /><div><div className="mess-stat-val">{stats.pending || 0}</div><div className="mess-stat-lbl">Pending</div></div></div>
          <div className="mess-stat mess-stat-purple"><Package size={18} /><div><div className="mess-stat-val">{stats.collected || 0}</div><div className="mess-stat-lbl">Collected</div></div></div>
          <div className="mess-stat mess-stat-green"><CheckCircle size={18} /><div><div className="mess-stat-val">{stats.delivered || 0}</div><div className="mess-stat-lbl">Delivered</div></div></div>
          <div className="mess-stat mess-stat-teal"><TrendingUp size={18} /><div><div className="mess-stat-val">{Math.round((stats.totalKg || 0) * 10) / 10} kg</div><div className="mess-stat-lbl">Food Saved</div></div></div>
        </div>

        {/* Log Food Form */}
        {showForm && (
          <div className="mess-form-panel">
            <div className="mess-form-header">
              <h2>Log Leftover Food</h2>
              <button className="mess-close-btn" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="mess-form">
              {items.map((row, i) => (
                <div key={i} className="mess-item-block">
                  <div className="mess-item-block-header">
                    <span className="mess-item-num">Item {i + 1}</span>
                    {items.length > 1 && (
                      <button type="button" className="mess-remove-item" onClick={() => removeItem(i)}>
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                  </div>
                  <div className="mess-form-row">
                    <div className="mess-field">
                      <label>Food Item *</label>
                      <input type="text" value={row.item} onChange={e => updateItem(i, 'item', e.target.value)} placeholder="e.g., Dal Tadka, Rice" required />
                    </div>
                    <div className="mess-field">
                      <label>Quantity *</label>
                      <input type="number" step="0.1" min="0.1" value={row.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="0" required />
                    </div>
                    <div className="mess-field">
                      <label>Unit *</label>
                      <select value={row.unit} onChange={e => updateItem(i, 'unit', e.target.value)}>
                        <option value="kg">Kilograms (kg)</option>
                        <option value="pieces">Pieces</option>
                        <option value="litres">Litres</option>
                        <option value="servings">Servings</option>
                      </select>
                    </div>
                    <div className="mess-field">
                      <label>Meal Type *</label>
                      <select value={row.meal} onChange={e => updateItem(i, 'meal', e.target.value)}>
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snacks">Snacks</option>
                      </select>
                    </div>
                    <div className="mess-field">
                      <label>Condition *</label>
                      <select value={row.condition} onChange={e => updateItem(i, 'condition', e.target.value)}>
                        <option value="fresh">🟢 Fresh</option>
                        <option value="good">🟡 Good (≤2h)</option>
                        <option value="fair">🟠 Fair (2–4h)</option>
                      </select>
                    </div>
                    <div className="mess-field">
                      <label>Notes</label>
                      <input type="text" value={row.notes} onChange={e => updateItem(i, 'notes', e.target.value)} placeholder="Allergens, storage..." />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="mess-add-item-btn" onClick={addItem}>
                <Plus size={14} /> Add Another Item
              </button>
              <div className="mess-form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setItems([{ ...BLANK_ITEM }]); }}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <Plus size={16} /> Log {items.length > 1 ? `${items.length} Items` : 'Entry'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Entries */}
        <div className="mess-entries-section">
          <div className="mess-entries-header">
            <h2 className="section-title">My Food Entries</h2>
            <span className="mess-entries-count">{myEntries.length} entries</span>
          </div>

          {myEntries.length === 0 ? (
            <div className="empty-state">
              <UtensilsCrossed size={40} />
              <p>No entries yet — log your first leftover food</p>
              <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Log Food</button>
            </div>
          ) : (
            <div className="mess-entries-grid">
              {myEntries.map(entry => {
                const stepIdx = getStepIndex(entry.status);
                const canCancel = entry.status === 'Pending Collection';
                return (
                  <div key={entry.id} className={`mess-entry-card mess-entry-${entry.status.toLowerCase().replace(/ /g, '-')}`}>
                    <div className="mess-entry-top">
                      <div className="mess-entry-info">
                        <div className="mess-entry-name">{entry.item}</div>
                        <div className="mess-entry-qty">{entry.quantity} {entry.unit} · {entry.meal}</div>
                      </div>
                      <div className="mess-entry-right">
                        <span className={`badge badge-${entry.status.toLowerCase().replace(/ /g, '-')}`}>{entry.status}</span>
                        {canCancel && (
                          <button className="mess-cancel-btn" onClick={() => handleCancelEntry(entry.id)} title="Cancel this entry">
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress timeline */}
                    <div className="mess-timeline">
                      {STATUS_STEPS.map((step, i) => (
                        <div key={step} className={`mess-tl-step ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'current' : ''}`}>
                          <div className="mess-tl-icon">{i <= stepIdx ? STATUS_ICONS[i] : '○'}</div>
                          <div className="mess-tl-label">{step.replace(' Collection', '').replace(' Assigned', ' Asgn.')}</div>
                          {i < STATUS_STEPS.length - 1 && <div className={`mess-tl-line ${i < stepIdx ? 'done' : ''}`} />}
                        </div>
                      ))}
                    </div>

                    <div className="mess-entry-details">
                      {entry.collectionStaffName && <div className="mess-detail">👤 Collector: <strong>{entry.collectionStaffName}</strong></div>}
                      {entry.ngoName && <div className="mess-detail">🏢 NGO: <strong>{entry.ngoName}</strong></div>}
                      {entry.deliveryStaffName && <div className="mess-detail">🚚 Driver: <strong>{entry.deliveryStaffName}</strong></div>}
                      {entry.deliveredAt && <div className="mess-detail">✅ Delivered: <strong>{new Date(entry.deliveredAt).toLocaleString()}</strong></div>}
                      {entry.notes && <div className="mess-detail">📝 {entry.notes}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
