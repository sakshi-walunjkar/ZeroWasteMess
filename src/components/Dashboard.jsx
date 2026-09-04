import { Clock, Truck, CheckCircle, Building2, Calendar, Package, FileText, Bell, BarChart3 } from "lucide-react";
import { STATUS, PENDING_STATUSES } from "../constants/status";
import "../styles/Dashboard.css";

export default function Dashboard({ foodEntries }) {
  const pending   = foodEntries.filter(e => PENDING_STATUSES.includes(e.status));
  const collected = foodEntries.filter(e => e.status === STATUS.COLLECTED);
  const inTransit = foodEntries.filter(e => e.status === STATUS.IN_TRANSIT);
  const delivered = foodEntries.filter(e => e.status === STATUS.DELIVERED);

  const COLS = [
    { title: "Pending Pickup", items: pending,   icon: Clock,        status: "pending"   },
    { title: "Collected",      items: collected,  icon: Package,      status: "collected" },
    { title: "In Transit",     items: inTransit,  icon: Truck,        status: "transit"   },
    { title: "Delivered",      items: delivered,  icon: CheckCircle,  status: "delivered" },
  ];

  return (
    <section className="dashboard-section">
      <div className="page-section">
        <div className="dash-header">
          <div>
            <div className="section-label">Live Dashboard</div>
            <h2 className="section-title">Food Flow Overview</h2>
          </div>
          <div className="dash-legend">
            <span className="badge badge-pending"><Clock size={13} /> Pending: {pending.length}</span>
            <span className="badge badge-collected"><Package size={13} /> Collected: {collected.length}</span>
            <span className="badge badge-transit"><Truck size={13} /> In Transit: {inTransit.length}</span>
            <span className="badge badge-delivered"><CheckCircle size={13} /> Delivered: {delivered.length}</span>
          </div>
        </div>

        <div className="pipeline">
          {COLS.map((col) => (
            <div className="pipeline-col" key={col.title}>
              <div className={`col-header col-header-${col.status}`}>
                <col.icon size={16} />
                <span className="col-title">{col.title}</span>
                <span className="col-count">{col.items.length}</span>
              </div>
              <div className="col-items">
                {col.items.length === 0 ? (
                  <div className="col-empty">No items</div>
                ) : (
                  col.items.map((entry) => (
                    <div className="pipeline-item" key={entry.id}>
                      <div className="item-top">
                        <span className="item-name">{entry.item}</span>
                        <span className="item-qty">{entry.quantity} {entry.unit}</span>
                      </div>
                      <div className="item-meta">
                        <span><Building2 size={11} /> {entry.mess}</span>
                        <span><Calendar size={11} /> {entry.date}</span>
                      </div>
                      {entry.ngoName && (
                        <div className="item-ngo"><Package size={11} /> {entry.ngoName}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="how-it-works">
          <div className="section-label" style={{ textAlign: "center" }}>Process</div>
          <h2 className="section-title" style={{ textAlign: "center" }}>How It Works</h2>
          <div className="steps">
            {[
              { num: "01", Icon: FileText,  title: "Mess Staff Logs Food",  desc: "Staff enters leftover details — food name, quantity, mess block, and time available." },
              { num: "02", Icon: Bell,      title: "NGO Gets Notified",     desc: "Nearby NGOs receive instant notification with food details and pickup window." },
              { num: "03", Icon: Package,   title: "Pickup & Delivery",     desc: "Collection staff picks up the food; delivery staff takes it to the assigned NGO." },
              { num: "04", Icon: BarChart3, title: "Impact Tracked",        desc: "Every delivery is logged. See real-time stats of meals saved and CO₂ reduced." },
            ].map((step, i) => (
              <div className="step-card" key={step.num} style={{ animationDelay: `${i * 100}ms` }}>
                <div className="step-num">{step.num}</div>
                <div className="step-icon-wrap"><step.Icon size={22} /></div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
