import { Building2, UtensilsCrossed, MapPin, Star, Phone, MapPinned, Activity } from "lucide-react";
import "../styles/NGOList.css";

export default function NGOList({ ngos = [] }) {
  const totalMeals = ngos.reduce((s, n) => s + (n.meals || 0), 0);
  const avgRating  = ngos.length
    ? (ngos.reduce((s, n) => s + (n.rating || 0), 0) / ngos.length).toFixed(1)
    : "—";
  const maxDist    = ngos.length
    ? ngos.map(n => parseFloat(n.distance)).filter(Boolean).sort((a,b) => b-a)[0] + " km"
    : "—";

  return (
    <div className="ngo-page">
      <div className="page-section">
        <div className="ngo-header">
          <div className="section-label">Partner Network</div>
          <h1 className="section-title">NGO Partners</h1>
          <p className="ngo-desc">
            We work with {ngos.filter(n => n.status === "Active").length} active NGOs to ensure food reaches those who need it most.
          </p>
        </div>

        <div className="ngo-summary">
          {[
            { Icon: Building2,     val: ngos.filter(n => n.status === "Active").length, label: "Active NGOs"  },
            { Icon: UtensilsCrossed, val: totalMeals + "+",                             label: "Meals Served" },
            { Icon: MapPinned,     val: maxDist,                                        label: "Max Radius"   },
            { Icon: Star,          val: avgRating,                                      label: "Avg Rating"   },
          ].map(s => (
            <div className="summary-pill" key={s.label}>
              <div className="pill-icon"><s.Icon size={20} /></div>
              <div className="pill-content">
                <span className="pill-val">{s.val}</span>
                <span className="pill-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="ngo-grid">
          {ngos.map((ngo, i) => (
            <div className="ngo-card" key={ngo.id} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="ngo-card-top">
                <div className="ngo-avatar"><Building2 size={24} /></div>
                <div className="ngo-info">
                  <h3 className="ngo-name">{ngo.name}</h3>
                  <span className="ngo-focus">{ngo.focus}</span>
                </div>
                <div className={`ngo-status ${ngo.status === "Active" ? "status-active" : "status-busy"}`}>
                  <Activity size={12} />
                  {ngo.status}
                </div>
              </div>

              <div className="ngo-details">
                <div className="detail-row">
                  <MapPin size={14} />
                  <span>{ngo.address} · {ngo.distance}</span>
                </div>
                <div className="detail-row">
                  <Phone size={14} />
                  <span>{ngo.phone}</span>
                </div>
                <div className="detail-row">
                  <UtensilsCrossed size={14} />
                  <span><strong>{ngo.meals}</strong> meals served</span>
                </div>
              </div>

              <div className="ngo-footer">
                <div className="ngo-rating">
                  <Star size={15} fill="currentColor" />
                  <span className="rating-num">{ngo.rating}</span>
                </div>
                <a
                  className="btn-secondary ngo-btn"
                  href={`tel:${ngo.phone?.replace(/\s/g, "")}`}
                >
                  <Phone size={13} />
                  Contact
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
