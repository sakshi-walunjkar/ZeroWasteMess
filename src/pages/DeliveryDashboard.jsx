import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, AlertTriangle, ThumbsUp, ThumbsDown, MapPin, User, Hash } from 'lucide-react';
import { foodService, workflowService } from '../services/database';
import '../styles/DeliveryDashboard.css';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`dd-toast dd-toast-${type}`}>{msg}</div>;
}

function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  return (
    <div className="dd-modal-overlay">
      <div className="dd-modal">
        <div className="dd-modal-title">{title}</div>
        <div className="dd-modal-msg">{message}</div>
        <div className="dd-modal-actions">
          <button className="dd-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className={`dd-modal-confirm ${danger ? 'danger' : ''}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function DeclineModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const reasons = ['Vehicle breakdown', 'Personal emergency', 'Route not accessible', 'Already on another task', 'Other'];
  return (
    <div className="dd-modal-overlay">
      <div className="dd-modal">
        <div className="dd-modal-title">⚠️ Decline Task</div>
        <div className="dd-modal-msg">Select a reason. This task will be sent back to Admin for reassignment.</div>
        <div className="dd-decline-reasons">
          {reasons.map(r => (
            <button key={r} className={`dd-reason-btn ${reason === r ? 'selected' : ''}`} onClick={() => setReason(r)}>{r}</button>
          ))}
        </div>
        <div className="dd-modal-actions">
          <button className="dd-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="dd-modal-confirm danger" disabled={!reason} onClick={() => onConfirm(reason)}>Decline Task</button>
        </div>
      </div>
    </div>
  );
}

function IssueModal({ onConfirm, onCancel }) {
  const [issue, setIssue] = useState('');
  const issues = ['Food quality concern', 'NGO not available', 'Wrong address', 'Quantity mismatch', 'Other'];
  return (
    <div className="dd-modal-overlay">
      <div className="dd-modal">
        <div className="dd-modal-title">🚨 Report Issue</div>
        <div className="dd-modal-msg">Select the issue type. Admin will be notified immediately.</div>
        <div className="dd-decline-reasons">
          {issues.map(r => (
            <button key={r} className={`dd-reason-btn ${issue === r ? 'selected' : ''}`} onClick={() => setIssue(r)}>{r}</button>
          ))}
        </div>
        <div className="dd-modal-actions">
          <button className="dd-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="dd-modal-confirm danger" disabled={!issue} onClick={() => onConfirm(issue)}>Report</button>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryDashboard({ user }) {
  const [myTasks, setMyTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { type, foodId }

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  useEffect(() => {
    loadData();
    const interval = setInterval(() => { if (!document.hidden) loadData(); }, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const allFood = foodService.getAll();
    const tasks = allFood.filter(f =>
      Number(f.collectionStaffId) === Number(user.id) ||
      Number(f.deliveryStaffId) === Number(user.id)
    );
    setMyTasks(tasks);
    setStats({
      assigned: tasks.filter(t => t.status === 'Collection Assigned').length,
      inProgress: tasks.filter(t => t.status === 'In Transit').length,
      completed: tasks.filter(t => t.status === 'Delivered').length,
      total: tasks.length,
    });
  };

  const handleMarkCollected = (foodId) => {
    setModal({ type: 'collect', foodId });
  };

  const handleMarkDelivered = (foodId) => {
    setModal({ type: 'deliver', foodId });
  };

  const handleDecline = (foodId) => {
    setModal({ type: 'decline', foodId });
  };

  const handleReportIssue = (foodId) => {
    setModal({ type: 'issue', foodId });
  };

  const confirmCollect = () => {
    workflowService.markCollected(modal.foodId);
    setModal(null);
    showToast('✅ Marked as collected — Admin notified');
    loadData();
  };

  const confirmDeliver = () => {
    workflowService.completeDelivery(modal.foodId);
    setModal(null);
    showToast('🎉 Delivery completed!');
    loadData();
  };

  const confirmDecline = (reason) => {
    workflowService.declineTask(modal.foodId, user.id, reason);
    setModal(null);
    showToast('Task declined — Admin will reassign', 'warning');
    loadData();
  };

  const confirmIssue = (issue) => {
    workflowService.declineTask(modal.foodId, user.id, `Issue reported: ${issue}`);
    setModal(null);
    showToast('🚨 Issue reported to Admin', 'warning');
    loadData();
  };

  // Fix: compare as numbers
  const collectionTasks = myTasks.filter(t => Number(t.collectionStaffId) === Number(user.id) && t.status === 'Collection Assigned');
  const deliveryTasks   = myTasks.filter(t => Number(t.deliveryStaffId)   === Number(user.id) && t.status === 'In Transit');
  const completedTasks  = myTasks.filter(t => t.status === 'Delivered');

  const conditionColor = { fresh: 'green', good: 'amber', fair: 'red' };

  return (
    <div className="delivery-dashboard">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {modal?.type === 'collect' && (
        <ConfirmModal title="✅ Mark as Collected" message="Confirm you have physically collected this food from the mess kitchen." confirmLabel="Yes, Collected" onConfirm={confirmCollect} onCancel={() => setModal(null)} />
      )}
      {modal?.type === 'deliver' && (
        <ConfirmModal title="🎉 Mark as Delivered" message="Confirm you have delivered this food to the NGO and they have received it." confirmLabel="Yes, Delivered" onConfirm={confirmDeliver} onCancel={() => setModal(null)} />
      )}
      {modal?.type === 'decline' && (
        <DeclineModal onConfirm={confirmDecline} onCancel={() => setModal(null)} />
      )}
      {modal?.type === 'issue' && (
        <IssueModal onConfirm={confirmIssue} onCancel={() => setModal(null)} />
      )}

      <div className="page-section">
        {/* Header */}
        <div className="dd-header">
          <div className="dd-header-left">
            <div className="dd-avatar">{user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}</div>
            <div>
              <div className="section-label">Delivery Staff Portal</div>
              <h1 className="section-title">My Tasks</h1>
              <p className="dash-subtitle">{user.name} · {user.vehicleNumber || 'No vehicle assigned'}</p>
            </div>
          </div>
          <div className="dd-header-right">
            <div className={`dd-status-pill ${stats.inProgress > 0 ? 'active' : 'idle'}`}>
              <span className="dd-status-dot" />
              {stats.inProgress > 0 ? 'On Duty' : 'Available'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="dd-stats-row">
          <div className="dd-stat dd-stat-amber">
            <Clock size={18} />
            <div><div className="dd-stat-val">{stats.assigned || 0}</div><div className="dd-stat-lbl">Assigned</div></div>
          </div>
          <div className="dd-stat dd-stat-blue">
            <Truck size={18} />
            <div><div className="dd-stat-val">{stats.inProgress || 0}</div><div className="dd-stat-lbl">In Transit</div></div>
          </div>
          <div className="dd-stat dd-stat-green">
            <CheckCircle size={18} />
            <div><div className="dd-stat-val">{stats.completed || 0}</div><div className="dd-stat-lbl">Completed</div></div>
          </div>
          <div className="dd-stat dd-stat-gray">
            <Package size={18} />
            <div><div className="dd-stat-val">{stats.total || 0}</div><div className="dd-stat-lbl">Total Tasks</div></div>
          </div>
        </div>

        {/* Permission notice */}
        <div className="dd-permission-notice">
          <div className="dd-perm-row"><ThumbsUp size={14} className="green" /><span>You can <strong>accept</strong> (mark collected/delivered) or <strong>decline</strong> any assigned task</span></div>
          <div className="dd-perm-row"><AlertTriangle size={14} className="amber" /><span>Declining sends the task back to Admin for reassignment</span></div>
          <div className="dd-perm-row"><ThumbsDown size={14} className="red" /><span>You <strong>cannot</strong> assign tasks to yourself or modify NGO/mess details</span></div>
        </div>

        {/* Collection Tasks */}
        <div className="dd-section">
          <div className="dd-section-header">
            <div className="dd-section-title">
              <Package size={16} className="amber" />
              Collection Tasks
              <span className="dd-count-chip amber">{collectionTasks.length}</span>
            </div>
            <span className="dd-section-sub">Go to mess kitchen and collect the food</span>
          </div>
          {collectionTasks.length === 0 ? (
            <div className="dd-empty">No collection tasks assigned to you</div>
          ) : (
            <div className="dd-tasks-grid">
              {collectionTasks.map(task => (
                <div key={task.id} className="dd-task-card dd-task-collection">
                  <div className="dd-task-top">
                    <div className="dd-task-emoji">🍱</div>
                    <div className="dd-task-info">
                      <div className="dd-task-name">{task.item}</div>
                      <div className="dd-task-qty">{task.quantity} {task.unit} · {task.meal}</div>
                    </div>
                    <span className={`dd-cond-badge dd-cond-${conditionColor[task.condition] || 'gray'}`}>{task.condition}</span>
                  </div>
                  <div className="dd-task-details">
                    <div className="dd-detail"><MapPin size={13} /><span>{task.mess}</span></div>
                    <div className="dd-detail"><Clock size={13} /><span>Logged {new Date(task.createdAt).toLocaleString()}</span></div>
                    {task.notes && <div className="dd-detail dd-notes">📝 {task.notes}</div>}
                  </div>
                  <div className="dd-task-actions">
                    <button className="dd-btn dd-btn-green" onClick={() => handleMarkCollected(task.id)}>
                      <CheckCircle size={14} /> Mark Collected
                    </button>
                    <button className="dd-btn dd-btn-red-outline" onClick={() => handleDecline(task.id)}>
                      <ThumbsDown size={14} /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Tasks */}
        <div className="dd-section">
          <div className="dd-section-header">
            <div className="dd-section-title">
              <Truck size={16} className="blue" />
              Delivery Tasks
              <span className="dd-count-chip blue">{deliveryTasks.length}</span>
            </div>
            <span className="dd-section-sub">Deliver collected food to the assigned NGO</span>
          </div>
          {deliveryTasks.length === 0 ? (
            <div className="dd-empty">No delivery tasks in progress</div>
          ) : (
            <div className="dd-tasks-grid">
              {deliveryTasks.map(task => (
                <div key={task.id} className="dd-task-card dd-task-delivery">
                  <div className="dd-task-top">
                    <div className="dd-task-emoji">🚚</div>
                    <div className="dd-task-info">
                      <div className="dd-task-name">{task.item}</div>
                      <div className="dd-task-qty">{task.quantity} {task.unit}</div>
                    </div>
                    <span className="dd-transit-badge">In Transit</span>
                  </div>
                  <div className="dd-route-visual">
                    <div className="dd-route-point from"><MapPin size={12} />{task.mess}</div>
                    <div className="dd-route-line"><div className="dd-route-truck">🚚</div></div>
                    <div className="dd-route-point to"><MapPin size={12} />{task.ngoName}</div>
                  </div>
                  <div className="dd-task-details">
                    <div className="dd-detail"><Clock size={13} /><span>Assigned {task.assignedAt ? new Date(task.assignedAt).toLocaleString() : '—'}</span></div>
                  </div>
                  <div className="dd-task-actions">
                    <button className="dd-btn dd-btn-green" onClick={() => handleMarkDelivered(task.id)}>
                      <CheckCircle size={14} /> Mark Delivered
                    </button>
                    <button className="dd-btn dd-btn-orange-outline" onClick={() => handleReportIssue(task.id)}>
                      <AlertTriangle size={14} /> Report Issue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed */}
        {completedTasks.length > 0 && (
          <div className="dd-section">
            <div className="dd-section-header">
              <div className="dd-section-title">
                <CheckCircle size={16} className="green" />
                Completed
                <span className="dd-count-chip green">{completedTasks.length}</span>
              </div>
            </div>
            <div className="dd-completed-list">
              {completedTasks.slice(0, 8).map(task => (
                <div key={task.id} className="dd-completed-row">
                  <CheckCircle size={16} className="dd-done-icon" />
                  <div className="dd-completed-info">
                    <span className="dd-completed-name">{task.item}</span>
                    <span className="dd-completed-meta">{task.quantity} {task.unit} → {task.ngoName || '—'}</span>
                  </div>
                  <span className="dd-completed-time">{task.deliveredAt ? new Date(task.deliveredAt).toLocaleDateString() : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Suggestions */}
        <div className="dd-suggestions">
          <div className="dd-sug-title">💡 Suggested Features for Future</div>
          <div className="dd-sug-grid">
            {[
              { icon: '📍', title: 'GPS Auto-Track', desc: 'Auto-update your location while on delivery' },
              { icon: '📷', title: 'Photo Proof', desc: 'Upload photo on collection & delivery' },
              { icon: '⭐', title: 'Performance Score', desc: 'Track your on-time delivery rate' },
              { icon: '📱', title: 'Push Notifications', desc: 'Get instant alerts for new tasks' },
            ].map(s => (
              <div key={s.title} className="dd-sug-card">
                <span className="dd-sug-icon">{s.icon}</span>
                <div><div className="dd-sug-name">{s.title}</div><div className="dd-sug-desc">{s.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
