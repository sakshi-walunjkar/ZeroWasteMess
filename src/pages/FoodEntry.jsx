import { useState } from "react";
import { ArrowLeft, Coffee, UtensilsCrossed, Sandwich, Soup, Building2, Calendar, ChevronRight, ChevronLeft, Minus, Plus, CheckCircle, Loader2, Plus as PlusIcon, Sparkles, ThumbsUp, Heart } from "lucide-react";
import { STATUS } from "../constants/status";
import "../styles/FoodEntry.css";

const MEAL_TYPES = [
  { key: "breakfast", label: "Breakfast", Icon: Coffee, time: "7 – 9 AM" },
  { key: "lunch", label: "Lunch", Icon: UtensilsCrossed, time: "12 – 2 PM" },
  { key: "snacks", label: "Snacks", Icon: Sandwich, time: "4 – 5 PM" },
  { key: "dinner", label: "Dinner", Icon: Soup, time: "7 – 9 PM" },
];

const FOOD_ITEMS = [
  "Dal Tadka", "Rajma", "Chole", "Rice", "Roti", "Sabzi", "Poha",
  "Upma", "Idli", "Dosa", "Paratha", "Khichdi", "Sambar", "Rasam",
  "Paneer Curry", "Biryani", "Pulao", "Curd Rice", "Other",
];

const MESS_BLOCKS = ["Block A", "Block B", "Block C", "Block D", "Block E", "Main Mess"];

const CONDITION = [
  { key: "fresh", label: "Fresh", Icon: Sparkles },
  { key: "good", label: "Good", Icon: ThumbsUp },
  { key: "donate", label: "Donate", Icon: Heart },
];

export default function FoodEntry({ addFoodEntry, setActivePage, user }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    meal: "", item: "", customItem: "", quantity: 5, unit: "kg",
    mess: "", condition: "", notes: "", date: new Date().toISOString().split("T")[0],
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    addFoodEntry({
      item: form.customItem || form.item,
      quantity: form.quantity,
      unit: form.unit,
      date: form.date,
      mess: form.mess,
      meal: form.meal,
      condition: form.condition,
      notes: form.notes,
      status: STATUS.PENDING_COLLECTION,
      ngo: "",
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fe-root">
        <div className="fe-success">
          <div className="success-ring">
            <CheckCircle size={48} />
          </div>
          <h2>Entry Logged!</h2>
          <p>Your food entry has been submitted. NGOs will be notified shortly.</p>
          <div className="success-summary">
            <div className="ss-item">
              <span className="ss-label">Item</span>
              <span className="ss-val">{form.customItem || form.item}</span>
            </div>
            <div className="ss-item">
              <span className="ss-label">Quantity</span>
              <span className="ss-val">{form.quantity} {form.unit}</span>
            </div>
            <div className="ss-item">
              <span className="ss-label">Mess</span>
              <span className="ss-val">{form.mess}</span>
            </div>
            <div className="ss-item">
              <span className="ss-label">Meal</span>
              <span className="ss-val">{MEAL_TYPES.find(m => m.key === form.meal)?.label}</span>
            </div>
          </div>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => { setSubmitted(false); setStep(1); setForm({ meal:"",item:"",customItem:"",quantity:5,unit:"kg",mess:"",condition:"",notes:"",date:new Date().toISOString().split("T")[0] }); }}>
              <PlusIcon size={18} />
              Log Another
            </button>
            <button className="btn-secondary" onClick={() => setActivePage("food-log")}>
              View Log
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fe-root">
      <div className="fe-header">
        <button className="fe-back" onClick={() => setActivePage("home")}>
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="fe-header-text">
          <h1>Log Food Entry</h1>
          <p>Step {step} of 3 — {["Select Meal & Block", "Food Details", "Review & Submit"][step - 1]}</p>
        </div>
        <div className="fe-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
      </div>

      <div className="fe-progress">
        <div className="fe-progress-bar" style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      <div className="fe-card">
        {step === 1 && (
          <div className="fe-step" key="step1">
            <div className="fe-section">
              <h3 className="fe-section-title">
                <UtensilsCrossed size={16} />
                Select Meal Time
              </h3>
              <div className="meal-grid">
                {MEAL_TYPES.map((m) => (
                  <button
                    key={m.key}
                    className={`meal-card ${form.meal === m.key ? "selected" : ""}`}
                    onClick={() => set("meal", m.key)}
                    type="button"
                  >
                    <m.Icon size={28} />
                    <span className="meal-label">{m.label}</span>
                    <span className="meal-time">{m.time}</span>
                    {form.meal === m.key && <CheckCircle size={20} className="meal-check" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="fe-section">
              <h3 className="fe-section-title">
                <Building2 size={16} />
                Select Mess Block
              </h3>
              <div className="block-grid">
                {MESS_BLOCKS.map((b) => (
                  <button
                    key={b}
                    className={`block-btn ${form.mess === b ? "selected" : ""}`}
                    onClick={() => set("mess", b)}
                    type="button"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="fe-section">
              <h3 className="fe-section-title">
                <Calendar size={16} />
                Date
              </h3>
              <input
                type="date"
                className="fe-date-input"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>

            <button
              className="btn-primary full"
              disabled={!form.meal || !form.mess}
              onClick={() => setStep(2)}
            >
              Continue
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fe-step" key="step2">
            <div className="fe-section">
              <h3 className="fe-section-title">What food is left?</h3>
              <div className="food-chips">
                {FOOD_ITEMS.map((item) => (
                  <button
                    key={item}
                    className={`chip ${form.item === item ? "selected" : ""}`}
                    onClick={() => { set("item", item); if (item !== "Other") set("customItem", ""); }}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
              {form.item === "Other" && (
                <input
                  className="fe-text-input"
                  placeholder="Enter food item name..."
                  value={form.customItem}
                  onChange={(e) => set("customItem", e.target.value)}
                />
              )}
            </div>

            <div className="fe-section">
              <h3 className="fe-section-title">Quantity</h3>
              <div className="quantity-row">
                <div className="qty-display">
                  <button className="qty-btn" onClick={() => set("quantity", Math.max(0.5, form.quantity - 0.5))}>
                    <Minus size={16} />
                  </button>
                  <span className="qty-val">{form.quantity}</span>
                  <button className="qty-btn" onClick={() => set("quantity", form.quantity + 0.5)}>
                    <Plus size={16} />
                  </button>
                </div>
                <div className="unit-toggle">
                  {["kg", "litres", "pieces", "portions"].map((u) => (
                    <button
                      key={u}
                      className={`unit-btn ${form.unit === u ? "selected" : ""}`}
                      onClick={() => set("unit", u)}
                      type="button"
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="range"
                className="qty-slider"
                min="0.5"
                max="50"
                step="0.5"
                value={form.quantity}
                onChange={(e) => set("quantity", parseFloat(e.target.value))}
              />
              <div className="slider-labels"><span>0.5</span><span>50</span></div>
            </div>

            <div className="fe-section">
              <h3 className="fe-section-title">Food Condition</h3>
              <div className="condition-row">
                {CONDITION.map((c) => (
                  <button
                    key={c.key}
                    className={`condition-btn ${form.condition === c.key ? "selected" : ""}`}
                    onClick={() => set("condition", c.key)}
                    type="button"
                  >
                    <c.Icon size={20} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="fe-section">
              <h3 className="fe-section-title">Additional Notes <span className="optional">(optional)</span></h3>
              <textarea
                className="fe-textarea"
                placeholder="e.g. Contains nuts, Needs pickup within 2 hours..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
              />
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                <ChevronLeft size={18} />
                Back
              </button>
              <button
                className="btn-primary"
                disabled={!form.item || !form.condition || (form.item === "Other" && !form.customItem)}
                onClick={() => setStep(3)}
              >
                Review
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fe-step" key="step3">
            <h3 className="fe-section-title" style={{ marginBottom: "1.4rem" }}>
              <CheckCircle size={16} />
              Review Entry
            </h3>

            <div className="review-card">
              <div className="review-meal-badge">
                {MEAL_TYPES.find(m => m.key === form.meal)?.label}
              </div>
              <div className="review-grid">
                {[
                  ["Food Item",  form.customItem || form.item],
                  ["Quantity",   `${form.quantity} ${form.unit}`],
                  ["Mess Block", form.mess],
                  ["Date",       form.date],
                  ["Condition",  CONDITION.find(c => c.key === form.condition)?.label],
                ].map(([k, v]) => (
                  <div key={k} className="review-row">
                    <span className="review-key">{k}</span>
                    <span className="review-val">{v}</span>
                  </div>
                ))}
                {form.notes && (
                  <div className="review-row full-width">
                    <span className="review-key">Notes</span>
                    <span className="review-val">{form.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(2)}>
                <ChevronLeft size={18} />
                Edit
              </button>
              <button
                className={`btn-primary ${submitting ? "loading" : ""}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? <><Loader2 size={18} className="spinner" /> Submitting…</> : <>Submit Entry</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
