import { useEffect, useRef } from "react";
import { UtensilsCrossed, ArrowRight, Truck, CheckCircle, Home, Leaf, Recycle, HandHeart } from "lucide-react";
import "../styles/Hero.css";

export default function Hero({ setActivePage, foodEntries = [], ngos = [] }) {
  const heroRef = useRef(null);

  useEffect(() => {
    const elements = heroRef.current.querySelectorAll("[data-delay]");
    elements.forEach((el) => { el.style.animationDelay = el.dataset.delay + "ms"; });
  }, []);

  const totalKg = Math.round(
    foodEntries.reduce((sum, e) => {
      if (e.unit === "kg")     return sum + e.quantity;
      if (e.unit === "pieces") return sum + e.quantity * 0.1;
      if (e.unit === "litres") return sum + e.quantity * 0.5;
      return sum;
    }, 0)
  );
  const totalMeals = ngos.reduce((s, n) => s + (n.meals || 0), 0);
  const activeNGOs = ngos.filter(n => n.status === "Active").length;

  const heroStats = [
    { num: `${totalKg} kg`, label: "food saved"      },
    { num: activeNGOs,      label: "NGO partners"    },
    { num: `${totalMeals}+`,label: "meals delivered" },
  ];

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-bg">
        <div className="hero-blob blob1" />
        <div className="hero-blob blob2" />
        <div className="hero-blob blob3" />
        <div className="grain-overlay" />
      </div>

      <div className="hero-content">
        <div className="hero-tag animate-fadeUp" data-delay="0">
          <span className="tag-dot" />
          Hostel Mess Management System
        </div>

        <h1 className="hero-title animate-fadeUp" data-delay="100">
          Turn Leftover Food<br />
          Into <span className="hero-accent">Hope & Help</span>
        </h1>

        <p className="hero-desc animate-fadeUp" data-delay="200">
          A smart system connecting hostel messes with nearby NGOs and needy people.
          Reduce food waste, feed communities, and make every meal count.
        </p>

        <div className="hero-actions animate-fadeUp" data-delay="300">
          <button className="btn-primary hero-btn" onClick={() => setActivePage("log-food")}>
            <UtensilsCrossed size={18} />
            Log Leftover Food
          </button>
          <button className="btn-secondary hero-btn" onClick={() => setActivePage("ngos")}>
            View NGO Partners
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="hero-stats animate-fadeUp" data-delay="400">
          {heroStats.map((s) => (
            <div className="hero-stat" key={s.label}>
              <span className="hero-stat-num">{s.num}</span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-visual animate-fadeIn" style={{ animationDelay: "300ms" }}>
        <div className="visual-card main-card">
          <div className="card-header">
            <UtensilsCrossed size={20} />
            Today's Leftovers
          </div>
          <div className="food-items">
            {[
              { name: "Dal Tadka",    kg: "4.5 kg", color: "#fbbf24" },
              { name: "Steamed Rice", kg: "7.2 kg", color: "#22c55e" },
              { name: "Mixed Veg",    kg: "2.8 kg", color: "#f97316" },
            ].map((f) => (
              <div className="food-item" key={f.name}>
                <span className="food-dot" style={{ background: f.color }} />
                <span className="food-name">{f.name}</span>
                <span className="food-qty">{f.kg}</span>
              </div>
            ))}
          </div>
          <div className="card-footer">
            <span className="footer-status"><Truck size={14} /> Driver dispatched</span>
            <span className="footer-eta">ETA 25 min</span>
          </div>
        </div>

        <div className="visual-card side-card top-card">
          <div className="side-icon"><Home size={20} /></div>
          <div>
            <div className="side-title">Asha NGO</div>
            <div className="side-sub">2.4 km away • Ready</div>
          </div>
          <div className="ping-dot" />
        </div>

        <div className="visual-card side-card bottom-card">
          <div className="check-circle"><CheckCircle size={20} /></div>
          <div>
            <div className="side-title">Delivery Complete</div>
            <div className="side-sub">{totalMeals || 127} meals served today</div>
          </div>
        </div>

        <div className="orbit-ring">
          <div className="orbit-item"><Leaf size={20} /></div>
          <div className="orbit-item"><UtensilsCrossed size={20} /></div>
          <div className="orbit-item"><HandHeart size={20} /></div>
          <div className="orbit-item"><Recycle size={20} /></div>
        </div>
      </div>

      <div className="scroll-hint">
        <div className="scroll-line" />
        <span>scroll to explore</span>
      </div>
    </section>
  );
}
