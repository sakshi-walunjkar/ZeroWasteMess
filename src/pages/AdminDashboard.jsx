import { useState, useEffect, useRef } from 'react';
import { Users, Package, Building2, TrendingUp, Clock, Truck, CheckCircle, Mail, Phone, Shield, MapPin, Navigation, Activity, Zap, ArrowRight, RefreshCw, ChevronDown } from 'lucide-react';
import { foodService, ngoService, userService, workflowService, ngoRequestService } from '../services/database';
import { STATUS, PENDING_STATUSES } from '../constants/status';
import LiveTracking from '../components/LiveTracking';
import '../styles/AdminDashboard.css';

function useCounter(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return val;
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  const count = useCounter(typeof value === 'number' ? value : 0);
  return (
    <div className={`adm-stat-card adm-stat-${color}`}>
      <div className="adm-stat-icon"><Icon size={20} /></div>
      <div className="adm-stat-body">
        <div className="adm-stat-val">{typeof value === 'number' ? count : value}</div>
        <div className="adm-stat-label">{label}</div>
        {sub && <div className="adm-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function PipelineBar({ pending, collected, transit, delivered }) {
  const total = pending + collected + transit + delivered || 1;
  return (
    <div className="pipeline-bar-wrap">
      <div className="pipeline-bar">
        {pending   > 0 && <div className="pb-seg pb-pending"   style={{ width: `${pending/total*100}%` }} title={`Pending: ${pending}`} />}
        {collected > 0 && <div className="pb-seg pb-collected" style={{ width: `${collected/total*100}%` }} title={`Collected: ${collected}`} />}
        {transit   > 0 && <div className="pb-seg pb-transit"   style={{ width: `${transit/total*100}%` }} title={`In Transit: ${transit}`} />}
        {delivered > 0 && <div className="pb-seg pb-delivered" style={{ width: `${delivered/total*100}%` }} title={`Delivered: ${delivered}`} />}
      </div>
      <div className="pipeline-legend">
        <span className="pl-item pl-pending"><span />Pending ({pending})</span>
        <span className="pl-item pl-collected"><span />Collected ({collected})</span>
        <span className="pl-item pl-transit"><span />In Transit ({transit})</span>
        <span className="pl-item pl-delivered"><span />Delivered ({delivered})</span>
      </div>
    </div>
  );
}

function ActivityFeed({ entries }) {
  const recent = [...entries]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const statusColor = { 'Pending Collection': 'amber', 'Collection Assigned': 'purple', 'Collected': 'purple', 'In Transit': 'blue', 'Delivered': 'green' };
  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  return (
    <div className="activity-feed">
      {recent.map((e, i) => (
        <div key={e.id} className="af-item" style={{ animationDelay: `${i * 60}ms` }}>
          <div className={`af-dot af-dot-${statusColor[e.status] || 'gray'}`} />
          <div className="af-body">
            <span className="af-title">{e.item}</span>
            <span className="af-meta">{e.mess} · {e.quantity} {e.unit}</span>
          </div>
          <div className="af-right">
            <span className={`af-badge af-badge-${statusColor[e.status] || 'gray'}`}>{e.status}</span>
            <span className="af-time">{timeAgo(e.createdAt)}</span>
          </div>
        </div>
      ))}
      {recent.length === 0 && <div className="af-empty">No activity yet</div>}
    </div>
  );
}

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({});
  const [foodEntries, setFoodEntries] = useState([]);
  const [ngos, setNGOs] = useState([]);
  const [users, setUsers] = useState([]);
  const [deliveryStaff, setDeliveryStaff] = useState([]);
  const [ngoRequests, setNGORequests] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [trackingFood, setTrackingFood] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [assignSelects, setAssignSelects] = useState({});
  const [toast, setToast] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = () => {
    setStats({ food: foodService.getStats(), ngo: ngoService.getStats() });
    setFoodEntries(foodService.getAll());
    setNGOs(ngoService.getAll());
    setUsers(userService.getAll());
    setDeliveryStaff(userService.getByRole('delivery_staff'));
    setNGORequests(ngoRequestService.getAll().filter(r => r.status === 'Pending'));
    setActiveDeliveries(workflowService.getActiveDeliveries());
    setLastRefresh(new Date());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => { if (!document.hidden) loadData(); }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    loadData();
    setRefreshing(false);
  };

  const setSelect = (key, value) => setAssignSelects(prev => ({ ...prev, [key]: value }));

  const handleAssignCollection = (foodId) => {
    const staffId = assignSelects[`collection-${foodId}`];
    if (!staffId) { showToast('Select a collection staff member', 'error'); return; }
    workflowService.assignCollectionStaff(foodId, parseInt(staffId));
    setAssignSelects(prev => { const n = { ...prev }; delete n[`collection-${foodId}`]; return n; });
    showToast('Collection staff assigned ✓');
    loadData();
  };

  const handleAssignDelivery = (foodId) => {
    const ngoId = assignSelects[`ngo-${foodId}`] || '';
    const staffId = assignSelects[`delivery-${foodId}`] || '';
    if (!ngoId || !staffId) { showToast('Select both NGO and delivery staff', 'error'); return; }
    const result = workflowService.assignDelivery(foodId, parseInt(ngoId), parseInt(staffId));
    if (result) {
      setAssignSelects(prev => { const n = { ...prev }; delete n[`ngo-${foodId}`]; delete n[`delivery-${foodId}`]; return n; });
      showToast('Delivery assigned ✓');
      loadData();
    } else {
      showToast('Assignment failed — try again', 'error');
    }
  };

  const handleApproveRequest = (requestId) => {
    const staffId = assignSelects[`staff-${requestId}`];
    if (!staffId) { showToast('Select delivery staff', 'error'); return; }
    ngoRequestService.approve(requestId, parseInt(staffId));
    showToast('Request approved ✓');
    loadData();
  };

  const handleRejectRequest = (requestId) => {
    const reason = prompt('Reason for rejection:');
    if (reason) { ngoRequestService.reject(requestId, reason); loadData(); }
  };

  const pendingCollection = foodEntries.filter(f => PENDING_STATUSES.includes(f.status));
  const collected = foodEntries.filter(f => f.status === STATUS.COLLECTED);
  const inTransit = foodEntries.filter(f => f.status === STATUS.IN_TRANSIT);

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'workflow', label: 'Workflow', badge: pendingCollection.length + collected.length },
    { key: 'requests', label: 'NGO Requests', badge: ngoRequests.length },
    { key: 'tracking', label: 'Live Tracking', badge: activeDeliveries.length, live: true },
    { key: 'staff', label: 'Staff & Users' },
    { key: 'roadmap', label: '🚀 Roadmap' },
  ];

  return (
    <div className="admin-dashboard">
      {toast && (
        <div className={`adm-toast adm-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <Zap size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="page-section">
        {/* Header */}
        <div className="adm-header">
          <div className="adm-header-left">
            <div className="adm-header-icon"><Shield size={18} /></div>
            <div>
              <div className="section-label">Admin Control Center</div>
              <h1 className="section-title">Supply Chain Dashboard</h1>
              <p className="dash-subtitle">Welcome back, {user.name}</p>
            </div>
          </div>
          <div className="adm-header-right">
            <div className="adm-live-badge">
              <span className="live-dot" />
              Live
            </div>
            <button className={`adm-refresh-btn ${refreshing ? 'spinning' : ''}`} onClick={handleRefresh}>
              <RefreshCw size={14} />
              {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="adm-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`adm-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.live && <span className="tab-live-dot" />}
              {t.label}
              {t.badge > 0 && <span className="tab-badge">{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="adm-overview">
            <div className="adm-stats-grid">
              <StatCard icon={Package}    label="Total Entries"    value={stats.food?.total || 0}     color="gray" />
              <StatCard icon={Clock}      label="Pending"          value={pendingCollection.length}    color="amber" />
              <StatCard icon={Truck}      label="In Transit"       value={inTransit.length}            color="blue" sub={activeDeliveries.length > 0 ? `${activeDeliveries.length} live` : null} />
              <StatCard icon={CheckCircle}label="Delivered"        value={stats.food?.delivered || 0}  color="green" />
              <StatCard icon={Building2}  label="Active NGOs"      value={stats.ngo?.active || 0}      color="teal" />
              <StatCard icon={Users}      label="Delivery Staff"   value={deliveryStaff.length}        color="purple" />
              <StatCard icon={TrendingUp} label="Food Saved"       value={`${stats.food?.totalKg || 0} kg`} color="green" />
              <StatCard icon={Activity}   label="Meals Served"     value={stats.ngo?.totalMeals || 0}  color="orange" />
            </div>

            {/* Pipeline */}
            <div className="adm-panel">
              <div className="adm-panel-header">
                <h3>Supply Chain Pipeline</h3>
                <span className="adm-panel-sub">Real-time flow of all food entries</span>
              </div>
              <PipelineBar
                pending={pendingCollection.length}
                collected={collected.length}
                transit={inTransit.length}
                delivered={stats.food?.delivered || 0}
              />
            </div>

            {/* Two-col: activity + NGO perf */}
            <div className="adm-two-col">
              <div className="adm-panel">
                <div className="adm-panel-header">
                  <h3>Live Activity Feed</h3>
                  <span className="adm-live-badge sm"><span className="live-dot" />Live</span>
                </div>
                <ActivityFeed entries={foodEntries} />
              </div>

              <div className="adm-panel">
                <div className="adm-panel-header"><h3>NGO Performance</h3></div>
                <div className="ngo-perf-list">
                  {ngos.slice(0, 6).map(ngo => (
                    <div key={ngo.id} className="ngo-perf-row">
                      <div className="ngo-perf-avatar">{ngo.name.slice(0, 2).toUpperCase()}</div>
                      <div className="ngo-perf-info">
                        <div className="ngo-perf-name">{ngo.name}</div>
                        <div className="ngo-perf-focus">{ngo.focus}</div>
                      </div>
                      <div className="ngo-perf-right">
                        <div className="ngo-perf-meals">{ngo.meals.toLocaleString()}</div>
                        <div className="ngo-perf-meals-label">meals</div>
                      </div>
                      <div className="ngo-perf-bar-wrap">
                        <div className="ngo-perf-bar" style={{ width: `${Math.min(ngo.meals / 15, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── WORKFLOW ── */}
        {activeTab === 'workflow' && (
          <div className="workflow-section">
            {/* Pending Collection */}
            <div className="adm-panel">
              <div className="adm-panel-header">
                <h3>Pending Collection <span className="count-chip amber">{pendingCollection.length}</span></h3>
                <span className="adm-panel-sub">Assign a staff member to collect from mess</span>
              </div>
              <div className="wf-grid">
                {pendingCollection.map(entry => (
                  <div key={entry.id} className="wf-card wf-pending">
                    <div className="wf-card-top">
                      <div className="wf-food-icon">🍱</div>
                      <div className="wf-food-info">
                        <div className="wf-food-name">{entry.item}</div>
                        <div className="wf-food-meta">{entry.quantity} {entry.unit} · {entry.meal}</div>
                      </div>
                      <span className="badge badge-pending">{entry.status}</span>
                    </div>
                    <div className="wf-details">
                      <div className="wf-detail-row"><MapPin size={13} />{entry.mess}</div>
                      <div className="wf-detail-row"><Clock size={13} />{new Date(entry.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="wf-assign-row">
                      <div className="wf-select-wrap">
                        <select className="wf-select" value={assignSelects[`collection-${entry.id}`] || ''} onChange={e => setSelect(`collection-${entry.id}`, e.target.value)}>
                          <option value="" disabled>Select collection staff…</option>
                          {deliveryStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <ChevronDown size={13} className="wf-select-icon" />
                      </div>
                      <button className="wf-btn wf-btn-amber" onClick={() => handleAssignCollection(entry.id)}>
                        Assign <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
                {pendingCollection.length === 0 && <div className="wf-empty">✅ All items collected</div>}
              </div>
            </div>

            {/* Collected → Assign Delivery */}
            <div className="adm-panel">
              <div className="adm-panel-header">
                <h3>Ready for Delivery <span className="count-chip purple">{collected.length}</span></h3>
                <span className="adm-panel-sub">Assign NGO and delivery staff</span>
              </div>
              <div className="wf-grid">
                {collected.map(entry => (
                  <div key={entry.id} className="wf-card wf-collected">
                    <div className="wf-card-top">
                      <div className="wf-food-icon">📦</div>
                      <div className="wf-food-info">
                        <div className="wf-food-name">{entry.item}</div>
                        <div className="wf-food-meta">{entry.quantity} {entry.unit} · by {entry.collectionStaffName}</div>
                      </div>
                      <span className="badge badge-collected">Collected</span>
                    </div>
                    <div className="wf-details">
                      <div className="wf-detail-row"><MapPin size={13} />{entry.mess}</div>
                      <div className="wf-detail-row"><Clock size={13} />{entry.collectedAt ? new Date(entry.collectedAt).toLocaleString() : '—'}</div>
                    </div>
                    <div className="wf-assign-col">
                      <div className="wf-select-wrap">
                        <select className="wf-select" value={assignSelects[`ngo-${entry.id}`] || ''} onChange={e => setSelect(`ngo-${entry.id}`, e.target.value)}>
                          <option value="" disabled>Select NGO…</option>
                          {ngos.filter(n => n.status === 'Active').map(n => <option key={n.id} value={n.id}>{n.name} · {n.distance}</option>)}
                        </select>
                        <ChevronDown size={13} className="wf-select-icon" />
                      </div>
                      <div className="wf-select-wrap">
                        <select className="wf-select" value={assignSelects[`delivery-${entry.id}`] || ''} onChange={e => setSelect(`delivery-${entry.id}`, e.target.value)}>
                          <option value="" disabled>Select delivery staff…</option>
                          {deliveryStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <ChevronDown size={13} className="wf-select-icon" />
                      </div>
                      <button className="wf-btn wf-btn-blue" onClick={() => handleAssignDelivery(entry.id)}>
                        <Truck size={13} /> Assign Delivery
                      </button>
                    </div>
                  </div>
                ))}
                {collected.length === 0 && <div className="wf-empty">No items awaiting delivery assignment</div>}
              </div>
            </div>

            {/* In Transit */}
            <div className="adm-panel">
              <div className="adm-panel-header">
                <h3>In Transit <span className="count-chip blue">{inTransit.length}</span></h3>
                <span className="adm-panel-sub">Currently being delivered</span>
              </div>
              <div className="wf-grid">
                {inTransit.map(entry => (
                  <div key={entry.id} className="wf-card wf-transit">
                    <div className="wf-card-top">
                      <div className="wf-food-icon">🚚</div>
                      <div className="wf-food-info">
                        <div className="wf-food-name">{entry.item}</div>
                        <div className="wf-food-meta">{entry.quantity} {entry.unit}</div>
                      </div>
                      <span className="badge badge-in-transit">In Transit</span>
                    </div>
                    <div className="wf-details">
                      <div className="wf-detail-row"><MapPin size={13} />To: {entry.ngoName}</div>
                      <div className="wf-detail-row"><Truck size={13} />Driver: {entry.deliveryStaffName}</div>
                    </div>
                    <button className="wf-btn wf-btn-ghost" onClick={() => setTrackingFood(entry.id)}>
                      <Navigation size={13} /> Track Live
                    </button>
                  </div>
                ))}
                {inTransit.length === 0 && <div className="wf-empty">No active deliveries</div>}
              </div>
            </div>
          </div>
        )}

        {/* ── NGO REQUESTS ── */}
        {activeTab === 'requests' && (
          <div className="adm-panel">
            <div className="adm-panel-header">
              <h3>Pending NGO Requests <span className="count-chip amber">{ngoRequests.length}</span></h3>
            </div>
            <div className="wf-grid">
              {ngoRequests.map(req => {
                const food = foodEntries.find(f => f.id === req.foodId);
                return (
                  <div key={req.id} className="wf-card wf-request">
                    <div className="wf-card-top">
                      <div className="wf-food-icon">🏢</div>
                      <div className="wf-food-info">
                        <div className="wf-food-name">{req.ngoName}</div>
                        <div className="wf-food-meta">Requesting: {food?.item} · {food?.quantity} {food?.unit}</div>
                      </div>
                      <span className="badge badge-pending">Pending</span>
                    </div>
                    {req.message && <div className="wf-message">"{req.message}"</div>}
                    <div className="wf-detail-row"><Clock size={13} />{new Date(req.requestedAt).toLocaleString()}</div>
                    <div className="wf-assign-col">
                      <div className="wf-select-wrap">
                        <select className="wf-select" value={assignSelects[`staff-${req.id}`] || ''} onChange={e => setSelect(`staff-${req.id}`, e.target.value)}>
                          <option value="" disabled>Select delivery staff…</option>
                          {deliveryStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <ChevronDown size={13} className="wf-select-icon" />
                      </div>
                      <div className="wf-req-actions">
                        <button className="wf-btn wf-btn-green" onClick={() => handleApproveRequest(req.id)}>✓ Approve</button>
                        <button className="wf-btn wf-btn-red" onClick={() => handleRejectRequest(req.id)}>✕ Reject</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {ngoRequests.length === 0 && <div className="wf-empty">No pending requests</div>}
            </div>
          </div>
        )}

        {/* ── LIVE TRACKING ── */}
        {activeTab === 'tracking' && (
          <div className="adm-panel">
            <div className="adm-panel-header">
              <h3>Active Deliveries <span className="count-chip blue">{activeDeliveries.length}</span></h3>
              <span className="adm-live-badge sm"><span className="live-dot" />Live</span>
            </div>
            <div className="wf-grid">
              {activeDeliveries.map(tracking => {
                const food = foodEntries.find(f => f.id === tracking.foodId);
                return (
                  <div key={tracking.id} className="wf-card wf-tracking">
                    <div className="wf-card-top">
                      <div className="tracking-pulse-icon"><Navigation size={18} /></div>
                      <div className="wf-food-info">
                        <div className="wf-food-name">{food?.item}</div>
                        <div className="wf-food-meta">{tracking.staffName}</div>
                      </div>
                    </div>
                    <div className="wf-details">
                      <div className="wf-detail-row"><MapPin size={13} />From: {food?.mess}</div>
                      <div className="wf-detail-row"><MapPin size={13} />To: {food?.ngoName}</div>
                      <div className="wf-detail-row"><Clock size={13} />ETA: {new Date(tracking.estimatedArrival).toLocaleTimeString()}</div>
                    </div>
                    <button className="wf-btn wf-btn-blue" onClick={() => setTrackingFood(food?.id)}>
                      <Navigation size={13} /> View Live Map
                    </button>
                  </div>
                );
              })}
              {activeDeliveries.length === 0 && <div className="wf-empty">No active deliveries right now</div>}
            </div>
          </div>
        )}

        {/* ── STAFF & USERS ── */}
        {activeTab === 'staff' && (
          <div className="adm-panel">
            <div className="adm-panel-header"><h3>All Staff & Users</h3></div>
            <div className="staff-grid">
              {users.map(u => {
                const roleIcon = { admin: '🛡️', ngo: '🏢', mess_staff: '🍽️', delivery_staff: '🚚' };
                const roleColor = { admin: 'blue', ngo: 'green', mess_staff: 'amber', delivery_staff: 'purple' };
                return (
                  <div key={u.id} className={`staff-card staff-${roleColor[u.role]}`}>
                    <div className="staff-avatar">{roleIcon[u.role] || '👤'}</div>
                    <div className="staff-info">
                      <div className="staff-name">{u.name}</div>
                      <span className={`staff-role-badge role-${roleColor[u.role]}`}>{u.role.replace('_', ' ')}</span>
                    </div>
                    <div className="staff-details">
                      <div className="staff-detail"><Mail size={12} />{u.email}</div>
                      {u.phone && <div className="staff-detail"><Phone size={12} />{u.phone}</div>}
                      {u.mess && <div className="staff-detail"><MapPin size={12} />{u.mess}</div>}
                      {u.vehicleNumber && <div className="staff-detail"><Truck size={12} />{u.vehicleNumber}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ROADMAP ── */}
        {activeTab === 'roadmap' && (
          <div className="roadmap-section">
            {[
              {
                category: '🔐 Auth & Security',
                color: 'blue',
                items: [
                  { title: 'JWT Login with session timeout', desc: 'Real login tokens, auto-logout after inactivity' },
                  { title: 'OTP verification', desc: 'SMS/email OTP when staff logs in' },
                  { title: 'Password change', desc: 'Let users change their own password from dashboard' },
                ]
              },
              {
                category: '📊 Analytics & Reports',
                color: 'purple',
                items: [
                  { title: 'Weekly/Monthly waste report', desc: 'Charts showing kg saved per mess, per week' },
                  { title: 'NGO performance leaderboard', desc: 'Ranked by meals served, response time' },
                  { title: 'Delivery staff scorecard', desc: 'On-time rate, tasks completed, declines' },
                  { title: 'Export to PDF/Excel', desc: 'Download food log reports' },
                ]
              },
              {
                category: '📱 Notifications & Alerts',
                color: 'amber',
                items: [
                  { title: 'Browser push notifications', desc: 'Alert when new food is available or task assigned' },
                  { title: 'Food expiry alert', desc: 'Auto-warn if food not collected within 1 hour' },
                  { title: 'WhatsApp/SMS integration', desc: 'Notify NGO when delivery is on the way' },
                ]
              },
              {
                category: '🗺️ Maps & Tracking',
                color: 'teal',
                items: [
                  { title: 'Real Google Maps integration', desc: 'Show actual route from mess to NGO' },
                  { title: 'Live GPS tracking', desc: 'Delivery staff shares real location via browser' },
                  { title: 'NGO map view', desc: 'See all NGOs on a map with distance markers' },
                ]
              },
              {
                category: '📷 Media & Proof',
                color: 'orange',
                items: [
                  { title: 'Photo upload on collection', desc: 'Delivery staff uploads photo as proof' },
                  { title: 'Photo upload on delivery', desc: 'NGO sees photo proof of food delivered' },
                  { title: 'QR code scan', desc: 'Scan QR at mess to confirm collection, scan at NGO to confirm delivery' },
                ]
              },
              {
                category: '🤝 Workflow Improvements',
                color: 'green',
                items: [
                  { title: 'Auto-assign nearest NGO', desc: 'System picks closest NGO automatically' },
                  { title: 'NGO capacity setting', desc: 'NGO sets max meals they can handle per day' },
                  { title: 'Food rating by NGO', desc: 'NGO rates food quality after receiving' },
                  { title: 'Recurring food schedule', desc: 'Mess pre-plans expected leftovers by day/meal' },
                ]
              },
              {
                category: '👤 User Management',
                color: 'blue',
                items: [
                  { title: 'Admin can add/remove users', desc: 'Create new mess staff or delivery staff from dashboard' },
                  { title: 'User activity log', desc: 'See who logged in, what actions they took' },
                  { title: 'Role switching', desc: 'Admin can temporarily act as any role for testing' },
                ]
              },
              {
                category: '🌐 Public & Community',
                color: 'teal',
                items: [
                  { title: 'Public impact page', desc: 'Shareable link showing total meals saved (no login needed)' },
                  { title: 'Donor portal', desc: 'External donors can fund delivery costs' },
                  { title: 'Volunteer registration', desc: 'Community members sign up as volunteer drivers' },
                ]
              },
            ].map(group => (
              <div key={group.category} className="adm-panel roadmap-group">
                <div className="adm-panel-header">
                  <h3>{group.category}</h3>
                  <span className={`count-chip ${group.color}`}>{group.items.length} features</span>
                </div>
                <div className="roadmap-grid">
                  {group.items.map((item, i) => (
                    <div key={i} className={`roadmap-card roadmap-${group.color}`}>
                      <div className="roadmap-card-title">{item.title}</div>
                      <div className="roadmap-card-desc">{item.desc}</div>
                      <span className="roadmap-tag">Planned</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {trackingFood && <LiveTracking foodId={trackingFood} onClose={() => setTrackingFood(null)} />}
    </div>
  );
}
