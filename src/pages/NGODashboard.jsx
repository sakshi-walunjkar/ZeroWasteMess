import { useState, useEffect, useRef } from 'react';
import { Package, Clock, CheckCircle, Bell, MapPin, Send, X, AlertTriangle, Star } from 'lucide-react';
import { foodService, ngoService, notificationService, ngoRequestService, workflowService } from '../services/database';
import { PENDING_STATUSES } from '../constants/status';
import '../styles/NGODashboard.css';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`ngo-toast ngo-toast-${type}`}>{msg}</div>;
}

function FreshnessTimer({ createdAt }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const update = () => setElapsed(Math.floor((Date.now() - new Date(createdAt)) / 60000));
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [createdAt]);
  const color = elapsed < 60 ? 'green' : elapsed < 120 ? 'amber' : 'red';
  const label = elapsed < 60 ? `${elapsed}m ago` : elapsed < 1440 ? `${Math.floor(elapsed/60)}h ago` : `${Math.floor(elapsed/1440)}d ago`;
  return <span className={`freshness-badge freshness-${color}`}>⏱ {label}</span>;
}

export default function NGODashboard({ user }) {
  const [ngoData, setNGOData] = useState(null);
  const [availableFood, setAvailableFood] = useState([]);
  const [assignedDeliveries, setAssignedDeliveries] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);
  const notifRef = useRef(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  useEffect(() => {
    loadData();
    const interval = setInterval(() => { if (!document.hidden) loadData(); }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = () => {
    if (!user.ngoId) return;
    setNGOData(ngoService.getById(user.ngoId));
    setAvailableFood(foodService.getAll().filter(f => PENDING_STATUSES.includes(f.status)));
    setAssignedDeliveries(ngoService.getAssignedDeliveries(user.ngoId));
    setCompletedDeliveries(ngoService.getCompletedDeliveries(user.ngoId));
    setNotifications(notificationService.getUnread(user.id));
    const reqs = ngoRequestService.getByNGO(user.ngoId);
    setMyRequests(reqs);
  };

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pendingRequestIds = myRequests.filter(r => r.status === 'Pending').map(r => r.foodId);

  const handleRequestFood = (foodId) => {
    ngoRequestService.create(foodId, user.ngoId, 'Requesting this food for our beneficiaries');
    showToast('✅ Request sent to Admin for approval');
    loadData();
  };

  const handleCancelRequest = (foodId) => {
    const req = myRequests.find(r => r.foodId === foodId && r.status === 'Pending');
    if (!req) return;
    // Mark as cancelled in DB
    const db_key = 'zerowastemess_db';
    const db = JSON.parse(localStorage.getItem(db_key));
    const idx = db.ngoRequests.findIndex(r => r.id === req.id);
    if (idx !== -1) { db.ngoRequests[idx].status = 'Cancelled'; localStorage.setItem(db_key, JSON.stringify(db)); }
    showToast('Request cancelled', 'warning');
    loadData();
  };

  const handleConfirmReceipt = (foodId) => {
    workflowService.confirmReceipt(foodId, user.ngoId);
    showToast('🎉 Receipt confirmed — Thank you!');
    loadData();
  };

  return (
    <div className="ngo-dashboard">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-section">
        {/* Header */}
        <div className="ngo-header">
          <div className="ngo-header-left">
            <div className="ngo-org-avatar">{ngoData?.name?.slice(0,2).toUpperCase() || 'NG'}</div>
            <div>
              <div className="section-label">NGO Partner Portal</div>
              <h1 className="section-title">{ngoData?.name || 'NGO Dashboard'}</h1>
              <p className="dash-subtitle">{user.name} · {ngoData?.focus}</p>
            </div>
          </div>
          <div className="ngo-header-right">
            {ngoData?.rating > 0 && (
              <div className="ngo-rating-badge"><Star size={14} fill="#f59e0b" color="#f59e0b" />{ngoData.rating}</div>
            )}
            <div className="notif-wrap" ref={notifRef}>
              <button className={`ngo-notif-btn ${notifications.length > 0 ? 'has-notif' : ''}`} onClick={() => setShowNotifications(v => !v)}>
                <Bell size={16} />
                {notifications.length > 0 && <span className="ngo-notif-count">{notifications.length}</span>}
              </button>
              {showNotifications && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notifications ({notifications.length})</span>
                    <button className="notif-clear" onClick={() => { notificationService.markAllRead(user.id); loadData(); setShowNotifications(false); }}>Mark all read</button>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 && <div className="notif-empty">No new notifications</div>}
                    {notifications.map(n => (
                      <div key={n.id} className="notif-item">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-msg">{n.message}</div>
                        <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Permission notice */}
        <div className="ngo-permission-notice">
          <div className="ngo-perm-row"><Send size={13} className="green" /><span>You can <strong>request available food</strong> and <strong>cancel your own pending requests</strong></span></div>
          <div className="ngo-perm-row"><CheckCircle size={13} className="green" /><span>After delivery, <strong>confirm receipt</strong> to complete the chain</span></div>
          <div className="ngo-perm-row"><X size={13} className="red" /><span>You <strong>cannot</strong> assign staff, approve requests, or access other NGO data</span></div>
        </div>

        {/* Stats */}
        <div className="ngo-stats-row">
          <div className="ngo-stat ngo-stat-blue"><Package size={18} /><div><div className="ngo-stat-val">{assignedDeliveries.length}</div><div className="ngo-stat-lbl">Active Deliveries</div></div></div>
          <div className="ngo-stat ngo-stat-green"><CheckCircle size={18} /><div><div className="ngo-stat-val">{ngoData?.meals || 0}</div><div className="ngo-stat-lbl">Meals Served</div></div></div>
          <div className="ngo-stat ngo-stat-amber"><Clock size={18} /><div><div className="ngo-stat-val">{availableFood.length}</div><div className="ngo-stat-lbl">Available Now</div></div></div>
          <div className="ngo-stat ngo-stat-purple"><Package size={18} /><div><div className="ngo-stat-val">{myRequests.filter(r => r.status === 'Pending').length}</div><div className="ngo-stat-lbl">Pending Requests</div></div></div>
        </div>

        {/* Active Deliveries — with Confirm Receipt */}
        {assignedDeliveries.length > 0 && (
          <div className="ngo-section">
            <div className="ngo-section-header">
              <h2 className="section-title">Incoming Deliveries</h2>
              <span className="ngo-live-badge"><span className="live-dot" />Live</span>
            </div>
            <div className="ngo-delivery-grid">
              {assignedDeliveries.map(d => (
                <div key={d.id} className="ngo-delivery-card ngo-delivery-active">
                  <div className="ngo-delivery-top">
                    <div className="ngo-delivery-emoji">🚚</div>
                    <div className="ngo-delivery-info">
                      <div className="ngo-delivery-name">{d.item}</div>
                      <div className="ngo-delivery-qty">{d.quantity} {d.unit}</div>
                    </div>
                    <span className="badge badge-in-transit">In Transit</span>
                  </div>
                  <div className="ngo-delivery-details">
                    <div className="ngo-detail"><MapPin size={13} />From: {d.mess}</div>
                    <div className="ngo-detail"><Package size={13} />Driver: {d.deliveryStaffName || '—'}</div>
                    <div className="ngo-detail"><Clock size={13} />Assigned: {d.assignedAt ? new Date(d.assignedAt).toLocaleString() : '—'}</div>
                  </div>
                  <div className="ngo-incoming-banner">🚚 On the way — driver is en route to your location</div>
                  {d.receiptConfirmed ? (
                    <div className="ngo-confirmed-banner">✅ Receipt already confirmed</div>
                  ) : (
                    <button className="ngo-confirm-btn" onClick={() => handleConfirmReceipt(d.id)}>
                      <CheckCircle size={14} /> Confirm Receipt
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Food */}
        <div className="ngo-section">
          <div className="ngo-section-header">
            <h2 className="section-title">Available Food</h2>
            <span className="ngo-avail-count">{availableFood.length} items</span>
          </div>
          {availableFood.length === 0 ? (
            <div className="empty-state"><Package size={40} /><p>No food available right now — check back soon</p></div>
          ) : (
            <div className="ngo-delivery-grid">
              {availableFood.map(food => {
                const isRequested = pendingRequestIds.includes(food.id);
                return (
                  <div key={food.id} className={`ngo-delivery-card ${isRequested ? 'ngo-requested' : ''}`}>
                    <div className="ngo-delivery-top">
                      <div className="ngo-delivery-emoji">🍱</div>
                      <div className="ngo-delivery-info">
                        <div className="ngo-delivery-name">{food.item}</div>
                        <div className="ngo-delivery-qty">{food.quantity} {food.unit} · {food.meal}</div>
                      </div>
                      <FreshnessTimer createdAt={food.createdAt} />
                    </div>
                    <div className="ngo-delivery-details">
                      <div className="ngo-detail"><MapPin size={13} />{food.mess}</div>
                      {food.notes && <div className="ngo-detail">📝 {food.notes}</div>}
                    </div>
                    <div className="ngo-food-actions">
                      {isRequested ? (
                        <>
                          <div className="ngo-requested-label">✅ Request Sent — Awaiting Admin Approval</div>
                          <button className="ngo-cancel-req-btn" onClick={() => handleCancelRequest(food.id)}>
                            <X size={13} /> Cancel Request
                          </button>
                        </>
                      ) : (
                        <button className="btn-primary full" onClick={() => handleRequestFood(food.id)}>
                          <Send size={14} /> Request This Food
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Requests History */}
        {myRequests.length > 0 && (
          <div className="ngo-section">
            <h2 className="section-title">My Request History</h2>
            <div className="ngo-requests-list">
              {myRequests.slice(0, 8).map(req => {
                const food = foodService.getAll().find(f => f.id === req.foodId);
                const statusColor = { Pending: 'amber', Approved: 'green', Rejected: 'red', Cancelled: 'gray' };
                return (
                  <div key={req.id} className="ngo-req-row">
                    <div className="ngo-req-info">
                      <span className="ngo-req-item">{food?.item || 'Unknown item'}</span>
                      <span className="ngo-req-meta">{food?.quantity} {food?.unit} · {new Date(req.requestedAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`ngo-req-status ngo-req-${statusColor[req.status] || 'gray'}`}>{req.status}</span>
                    {req.rejectionReason && <span className="ngo-req-reason">Reason: {req.rejectionReason}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Deliveries */}
        {completedDeliveries.length > 0 && (
          <div className="ngo-section">
            <h2 className="section-title">Completed Deliveries</h2>
            <div className="ngo-completed-list">
              {completedDeliveries.slice(0, 6).map(d => (
                <div key={d.id} className="ngo-completed-row">
                  <CheckCircle size={16} className="ngo-done-icon" />
                  <div className="ngo-completed-info">
                    <span className="ngo-completed-name">{d.item} — {d.quantity} {d.unit}</span>
                    <span className="ngo-completed-meta">{d.mess} · {d.deliveredAt ? new Date(d.deliveredAt).toLocaleDateString() : '—'}</span>
                  </div>
                  {d.receiptConfirmed && <span className="ngo-receipt-tag">✅ Confirmed</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Suggestions */}
        <div className="ngo-suggestions">
          <div className="ngo-sug-title">💡 Suggested Features for Future</div>
          <div className="ngo-sug-grid">
            {[
              { icon: '📅', title: 'Scheduled Pickups', desc: 'Pre-book regular food collection slots' },
              { icon: '📊', title: 'Impact Report', desc: 'Monthly PDF report of meals served' },
              { icon: '🗺️', title: 'Map View', desc: 'See all available food on a live map' },
              { icon: '💬', title: 'Chat with Driver', desc: 'Real-time chat with delivery staff' },
            ].map(s => (
              <div key={s.title} className="ngo-sug-card">
                <span>{s.icon}</span>
                <div><div className="ngo-sug-name">{s.title}</div><div className="ngo-sug-desc">{s.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
