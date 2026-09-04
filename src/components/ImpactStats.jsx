import { useEffect, useRef, useState } from "react";
import { Wheat, Building2, UtensilsCrossed, Package } from "lucide-react";
import { STATUS } from "../constants/status";
import "../styles/ImpactStats.css";

function AnimatedNum({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    started.current = false;
    setCount(0);
  }, [target]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1600;
          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function ImpactStats({ foodEntries, ngos = [] }) {
  const totalKg = Math.round(
    foodEntries.reduce((sum, e) => {
      if (e.unit === "kg")     return sum + e.quantity;
      if (e.unit === "pieces") return sum + e.quantity * 0.1;
      if (e.unit === "litres") return sum + e.quantity * 0.5;
      return sum;
    }, 0) * 10
  ) / 10;

  const totalMeals    = ngos.reduce((s, n) => s + (n.meals || 0), 0);
  const activeNGOs    = ngos.filter(n => n.status === "Active").length;
  const totalEntries  = foodEntries.length;

  const stats = [
    { Icon: Wheat,         num: totalKg,     suffix: " kg", label: "Food Saved",      desc: "Total weight redirected from waste"  },
    { Icon: Building2,     num: activeNGOs,  suffix: "",    label: "Active NGOs",     desc: "Partner organisations in network"    },
    { Icon: UtensilsCrossed, num: totalMeals, suffix: "+",  label: "Meals Served",    desc: "Delivered to communities in need"    },
    { Icon: Package,       num: totalEntries, suffix: "",   label: "Total Entries",   desc: "Food entries logged across all messes"},
  ];

  return (
    <section className="impact-section">
      <div className="impact-inner page-section">
        <div className="impact-header">
          <div className="section-label">Our Impact</div>
          <h2 className="section-title">Every Meal Saved Matters</h2>
          <p className="impact-desc">Real-time data from all hostel messes in the network.</p>
        </div>

        <div className="stats-grid">
          {stats.map((s, i) => (
            <div className="stat-card" key={s.label} style={{ animationDelay: `${i * 100}ms` }}>
              <div className="stat-icon-wrap"><s.Icon size={22} /></div>
              <div className="stat-num"><AnimatedNum target={s.num} suffix={s.suffix} /></div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-desc">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="impact-bar-section">
          <div className="bar-title">Monthly Food Entries Trend</div>
          <div className="bars">
            {[40, 55, 48, 70, 65, 82, 95].map((h, i) => (
              <div className="bar-wrap" key={i}>
                <div className="bar-fill" style={{ "--h": h + "%", animationDelay: `${i * 80}ms` }} />
                <span className="bar-label">{["Aug","Sep","Oct","Nov","Dec","Jan","Feb"][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
