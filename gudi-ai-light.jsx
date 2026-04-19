import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

// ── Brand tokens ──────────────────────────────────────────────
const C = {
  purple: "#6d28d9",
  purpleLight: "#ede9fe",
  purpleMid: "#8b5cf6",
  teal: "#0891b2",
  tealLight: "#e0f2fe",
  green: "#059669",
  greenLight: "#d1fae5",
  text: "#1e1b4b",
  textSub: "#6b7280",
  border: "#e5e7eb",
  bg: "#f9fafb",
  white: "#ffffff",
  card: "#ffffff",
};

const CAT_COLORS = {
  Climate:   { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  Community: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  Health:    { bg: "#fce7f3", text: "#9d174d", dot: "#ec4899" },
  Education: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  "Small Wins": { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6" },
  Technology:{ bg: "#cffafe", text: "#155e75", dot: "#06b6d4" },
  Other:     { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af" },
};

const STATUS_COLORS = {
  Idea:        { bg: "#fef9c3", text: "#854d0e" },
  "In Progress": { bg: "#dbeafe", text: "#1e40af" },
  Live:        { bg: "#d1fae5", text: "#065f46" },
};

const INITIAL_PROJECTS = [
  { id: 1, title: "AI Food Waste Tracker", category: "Climate", shortDesc: "AI system to track and redistribute excess food in real time.", fullDesc: "AI Food Waste Tracker helps reduce food waste by connecting businesses with excess food inventory to nonprofit organizations and shelters. Uses AI to predict food spoilage windows, match supply to nearby demand, and automate pickup notifications for volunteers.", projectPlans: "Uses AI to predict food spoilage windows, match supply to nearby demand, and automate pickup notifications for volunteers.", impactGoal: "Reduce local food waste by 25% and support 500+ families per month.", costNeeded: 5000, fundsRaised: 320, status: "Idea", votes: 42, voted: false, lastUpdated: "4/1/2026" },
  { id: 2, title: "Homeless Help", category: "Community", shortDesc: "AI help with homelessness — connecting people to resources.", fullDesc: "A compassionate AI tool that helps individuals experiencing homelessness navigate available resources, find nearby shelters, access mental health support, and connect with case workers.", projectPlans: "Mobile-first interface connecting users to local shelters, food banks, and mental health services via AI-guided conversations.", impactGoal: "Connect 1,000+ individuals with services monthly.", costNeeded: 3500, fundsRaised: 150, status: "In Progress", votes: 31, voted: false, lastUpdated: "4/1/2026" },
  { id: 3, title: "Clean Water Connect", category: "Community", shortDesc: "AI matching water donations with underserved communities.", fullDesc: "Uses AI to identify water-insecure communities and match them with donors, NGOs, and government programs. Tracks impact transparently.", projectPlans: "Build a matching algorithm that connects water NGOs with identified high-need regions.", impactGoal: "Bring clean water access to 200+ families.", costNeeded: 8000, fundsRaised: 0, status: "Idea", votes: 18, voted: false, lastUpdated: "4/2/2026" },
  { id: 4, title: "AI Mental Health Buddy", category: "Health", shortDesc: "Free AI emotional support for underserved communities.", fullDesc: "A culturally aware AI companion providing 24/7 emotional support, crisis resources, and mental wellness exercises.", projectPlans: "Train a culturally sensitive model on diverse mental wellness datasets; partner with licensed therapists for oversight.", impactGoal: "Support 5,000+ users in underserved areas.", costNeeded: 6000, fundsRaised: 0, status: "Idea", votes: 27, voted: false, lastUpdated: "4/3/2026" },
  { id: 5, title: "EduBridge AI", category: "Education", shortDesc: "Personalized AI tutoring for under-resourced schools.", fullDesc: "Adaptive AI tutoring that meets each student where they are, filling gaps in core subjects like math and reading.", projectPlans: "Partner with 3 pilot schools; build adaptive quiz engine; measure outcomes over 6 months.", impactGoal: "Improve literacy and math scores for 2,000 students.", costNeeded: 4200, fundsRaised: 800, status: "In Progress", votes: 35, voted: false, lastUpdated: "4/4/2026" },
];

// ── Helpers ───────────────────────────────────────────────────
const fmt$ = (n) => n === 0 ? "$0" : `$${n.toLocaleString()}`;
const pct = (raised, needed) => needed ? Math.min(100, Math.round((raised / needed) * 100)) : 0;

function Tag({ label, scheme }) {
  const c = scheme || { bg: "#f3f4f6", text: "#374151" };
  return (
    <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: c.bg, color: c.text, fontFamily: "inherit", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div style={{ height: 6, borderRadius: 3, background: "#e5e7eb", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: `linear-gradient(90deg, ${C.purple}, ${C.teal})`, borderRadius: 3, transition: "width .5s ease" }} />
    </div>
  );
}

function VoteBtn({ votes, voted, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
      borderRadius: 99, border: `1.5px solid ${voted ? C.purple : "#d1d5db"}`,
      background: voted ? C.purpleLight : C.white,
      color: voted ? C.purple : C.textSub,
      fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
      transition: "all .15s",
    }}>
      <span>{voted ? "💜" : "🤍"}</span> {votes}
    </button>
  );
}

// ── NAV ───────────────────────────────────────────────────────
function Nav({ view, setView, onSubmit }) {
  return (
    <nav style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 26 }}>🧠</span>
        <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, background: `linear-gradient(135deg,${C.purple},${C.teal})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 400 }}>Gudi AI</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[["projects","Browse Projects"],["dashboard","Impact Dashboard"]].map(([v,label]) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            background: view === v ? C.purpleLight : "transparent",
            color: view === v ? C.purple : C.textSub,
            border: view === v ? `1.5px solid ${C.purpleMid}` : "1.5px solid transparent",
          }}>{label}</button>
        ))}
        <button onClick={onSubmit} style={{
          padding: "7px 18px", borderRadius: 99, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          background: `linear-gradient(135deg,${C.purple},${C.teal})`, color: "#fff", border: "none",
          boxShadow: "0 2px 8px rgba(109,40,217,.25)",
        }}>+ Submit Idea</button>
      </div>
    </nav>
  );
}

// ── SUBMIT FORM ───────────────────────────────────────────────
function SubmitForm({ onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", category: "", shortDesc: "", fullDesc: "", projectPlans: "", impactGoal: "", costNeeded: "", attachment: null });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate1 = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.category) e.category = "Required";
    if (!form.shortDesc.trim()) e.shortDesc = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };
  const validate2 = () => {
    const e = {};
    if (!form.fullDesc.trim()) e.fullDesc = "Required";
    if (!form.impactGoal.trim()) e.impactGoal = "Required";
    if (!form.costNeeded) e.costNeeded = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => { if (validate1()) { setErrors({}); setStep(2); } };
  const back = () => { setErrors({}); setStep(1); };
  const submit = () => {
    if (!validate2()) return;
    onSubmit(form);
    onClose();
  };

  const inp = (error) => ({
    width: "100%", padding: "10px 14px", borderRadius: 10, fontFamily: "inherit",
    border: `1.5px solid ${error ? "#ef4444" : C.border}`, fontSize: 14,
    outline: "none", background: C.white, color: C.text, boxSizing: "border-box",
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: 20, padding: 36, maxWidth: 520, width: "100%", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,.15)", animation: "slideUp .25s ease" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ fontSize: 32 }}>🧠</span>
          <h2 style={{ margin: "6px 0 0", fontFamily: "'DM Serif Display',serif", fontSize: 24, color: C.text }}>Submit an Idea</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textSub }}>Step {step} of 2</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {[1,2].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? C.purple : C.border, transition: "background .3s" }} />
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Project Name *</label>
              <input style={inp(errors.title)} placeholder="Project Name" value={form.title} onChange={e => set("title", e.target.value)} />
              {errors.title && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>{errors.title}</p>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Category *</label>
              <select style={{ ...inp(errors.category), appearance: "none", cursor: "pointer" }} value={form.category} onChange={e => set("category", e.target.value)}>
                <option value="">Select a category</option>
                {Object.keys(CAT_COLORS).map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.category && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>{errors.category}</p>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Short Description *</label>
              <textarea style={{ ...inp(errors.shortDesc), minHeight: 80, resize: "vertical" }} placeholder="Tell us what your project does" value={form.shortDesc} onChange={e => set("shortDesc", e.target.value)} />
              {errors.shortDesc && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>{errors.shortDesc}</p>}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 99, border: `1.5px solid ${C.border}`, background: C.white, color: C.textSub, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={next} style={{ flex: 2, padding: "11px", borderRadius: 99, border: "none", background: `linear-gradient(135deg,${C.purple},${C.teal})`, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Next →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Full Description *</label>
              <textarea style={{ ...inp(errors.fullDesc), minHeight: 90, resize: "vertical" }} placeholder="Share how to make this project come to life" value={form.fullDesc} onChange={e => set("fullDesc", e.target.value)} />
              {errors.fullDesc && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>{errors.fullDesc}</p>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Project Plans</label>
              <textarea style={{ ...inp(false), minHeight: 70, resize: "vertical" }} placeholder="How would you build or launch this?" value={form.projectPlans} onChange={e => set("projectPlans", e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Impact Goal *</label>
              <input style={inp(errors.impactGoal)} placeholder="What positive outcome will this create?" value={form.impactGoal} onChange={e => set("impactGoal", e.target.value)} />
              {errors.impactGoal && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>{errors.impactGoal}</p>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Cost Needed ($) *</label>
              <input type="number" style={inp(errors.costNeeded)} placeholder="e.g. 5000" value={form.costNeeded} onChange={e => set("costNeeded", e.target.value)} />
              {errors.costNeeded && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>{errors.costNeeded}</p>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Upload Attachments</label>
              <div style={{ border: `1.5px dashed ${C.border}`, borderRadius: 10, padding: "20px", textAlign: "center", color: C.textSub, fontSize: 13, cursor: "pointer", background: C.bg }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>⬆️</div>
                {form.attachment ? <span style={{ color: C.purple, fontWeight: 600 }}>{form.attachment}</span> : <span>Click to upload or drag & drop</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={back} style={{ flex: 1, padding: "11px", borderRadius: 99, border: `1.5px solid ${C.border}`, background: C.white, color: C.textSub, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
              <button onClick={submit} style={{ flex: 2, padding: "11px", borderRadius: 99, border: "none", background: `linear-gradient(135deg,${C.purple},${C.teal})`, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Submit 🚀</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PROJECT CARD ──────────────────────────────────────────────
function ProjectCard({ project, rank, expanded, onToggle, onVote, onSupportClick }) {
  const cat = CAT_COLORS[project.category] || CAT_COLORS.Other;
  const stat = STATUS_COLORS[project.status] || STATUS_COLORS.Idea;
  const progress = pct(project.fundsRaised, project.costNeeded);

  return (
    <div style={{
      background: C.white, borderRadius: 14,
      border: `1.5px solid ${expanded ? C.purpleMid : C.border}`,
      overflow: "hidden", transition: "border-color .2s, box-shadow .2s",
      boxShadow: expanded ? `0 4px 20px rgba(109,40,217,.1)` : "0 1px 4px rgba(0,0,0,.04)",
    }}>
      {rank === 0 && (
        <div style={{ background: `linear-gradient(90deg,${C.purple},${C.teal})`, padding: "4px 16px", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.08em" }}>
          🔥 TOP VOTED
        </div>
      )}

      {/* Card row */}
      <div onClick={onToggle} style={{ padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 10, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
          {project.category === "Climate" ? "🌿" : project.category === "Community" ? "🤝" : project.category === "Health" ? "💊" : project.category === "Education" ? "📚" : project.category === "Technology" ? "⚙️" : "⭐"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
            <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: C.text, fontWeight: 400 }}>{project.title}</span>
            <Tag label={project.category} scheme={cat} />
            <Tag label={project.status} scheme={stat} />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: C.textSub, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{project.shortDesc}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <VoteBtn votes={project.votes} voted={project.voted} onClick={e => { e.stopPropagation(); onVote(project.id); }} />
          <span style={{ color: C.textSub, fontSize: 18, transition: "transform .2s", transform: expanded ? "rotate(180deg)" : "none", display: "inline-block" }}>⌄</span>
        </div>
      </div>

      {/* Expanded details — linked to submission fields */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "20px 20px 24px", animation: "fadeIn .2s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "4px 16px", marginBottom: 16, padding: "12px 16px", background: C.bg, borderRadius: 10, fontSize: 12 }}>
            {[["Project Name", project.title], ["Status", project.status], ["Last Updated", project.lastUpdated], ["Category", project.category]].map(([k, v]) => (
              <div key={k}>
                <p style={{ margin: "0 0 2px", color: C.textSub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 10 }}>{k}</p>
                <p style={{ margin: 0, color: C.text, fontWeight: 600 }}>{v}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>Full Description</p>
              <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.6 }}>{project.fullDesc}</p>
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>Project Plans</p>
              <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.6 }}>{project.projectPlans || "—"}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>Impact Goal</p>
              <p style={{ margin: 0, fontSize: 13, color: C.text }}>{project.impactGoal}</p>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>Funds Raised</p>
                <span style={{ fontSize: 12, color: C.textSub }}>{fmt$(project.fundsRaised)} / {fmt$(project.costNeeded)}</span>
              </div>
              <ProgressBar value={progress} />
              <p style={{ margin: "4px 0 0", fontSize: 11, color: C.textSub }}>{progress}% funded</p>
            </div>
          </div>

          <a href="https://gofund.me/839bac11" target="_blank" rel="noopener noreferrer" style={{
  padding: "11px 24px", borderRadius: 99, border: "none",
  background: `linear-gradient(135deg,${C.purple},${C.teal})`,
  color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  boxShadow: "0 4px 14px rgba(109,40,217,.25)", textDecoration: "none", display: "inline-block"
}}>💚 Support This Project</a>
        </div>
      )}
    </div>
  );
}

// ── PROJECTS VIEW ─────────────────────────────────────────────
function ProjectsView({ projects, onVote, onSubmit }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const sorted = [...projects].sort((a, b) => b.votes - a.votes);
  const allCats = ["All", ...Array.from(new Set(projects.map(p => p.category)))];
  const filtered = sorted.filter(p =>
    (filterCat === "All" || p.category === filterCat) &&
    (filterStatus === "All" || p.status === filterStatus) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.shortDesc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, background: C.purple, color: "#fff", padding: "11px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, animation: "slideUp .25s ease", boxShadow: "0 6px 20px rgba(109,40,217,.35)" }}>{toast}</div>
      )}

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <span style={{ display: "inline-block", padding: "3px 14px", borderRadius: 99, background: C.purpleLight, color: C.purple, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>✦ AI for Good</span>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(32px,5vw,50px)", fontWeight: 400, color: C.text, margin: "0 0 12px", lineHeight: 1.15 }}>
          Build what matters.<br />Do good with AI.
        </h1>
        <p style={{ fontSize: 15, color: C.textSub, maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.7 }}>
          Discover, support, and build AI-powered projects that create real impact for people, communities, and the planet.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onSubmit} style={{ padding: "12px 26px", borderRadius: 99, border: "none", background: `linear-gradient(135deg,${C.purple},${C.teal})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(109,40,217,.3)" }}>Submit a Project</button>
          <a href="https://gofund.me/839bac11" target="_blank" rel="noopener noreferrer" style={{ padding: "12px 26px", borderRadius: 99, border: `1.5px solid ${C.border}`, background: C.white, color: C.textSub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none" }}>💚 Support a Project</a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: C.border, borderRadius: 14, overflow: "hidden", marginBottom: 48, border: `1px solid ${C.border}` }}>
        {[
          { icon: "✦", val: projects.length, label: "Projects Live" },
          { icon: "💜", val: projects.reduce((a,b) => a + b.votes, 0), label: "Community Votes" },
          { icon: "🌱", val: Array.from(new Set(projects.map(p => p.category))).length, label: "Causes Supported" },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, padding: "22px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: C.purple }}>{s.val}</div>
            <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: C.text, margin: "0 0 2px" }}>Community Projects</h2>
            <p style={{ margin: 0, fontSize: 13, color: C.textSub }}>Explore ideas and initiatives built for global good.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 99, padding: "8px 16px" }}>
            <span style={{ color: C.textSub }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…" style={{ border: "none", outline: "none", fontSize: 13, color: C.text, background: "transparent", width: "100%", fontFamily: "inherit" }} />
          </div>
          {[["filterCat", allCats, filterCat, setFilterCat], ["filterStatus", ["All","Idea","In Progress","Live"], filterStatus, setFilterStatus]].map(([key, opts, val, setter]) => (
            <select key={key} value={val} onChange={e => setter(e.target.value)} style={{ padding: "8px 14px", borderRadius: 99, border: `1.5px solid ${C.border}`, background: C.white, color: C.text, fontSize: 13, cursor: "pointer", fontFamily: "inherit", outline: "none" }}>
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: C.textSub }}>No projects found. <span style={{ color: C.purple, cursor: "pointer", fontWeight: 600 }} onClick={onSubmit}>Submit the first one! 🚀</span></div>
        ) : filtered.map((p, i) => (
          <div key={p.id} style={{ animation: `fadeIn .3s ease ${i * 0.04}s both` }}>
            <ProjectCard
              project={p} rank={i}
              expanded={expanded === p.id}
              onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
              onVote={(id) => { onVote(id); const proj = projects.find(x => x.id === id); if (!proj.voted) showToast(`Voted for "${proj.title}"! 💜`); }}
              onSupportClick={() => showToast("Support flow coming soon! 💚")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────
function Dashboard({ projects }) {
  const totalFunds = projects.reduce((a, b) => a + b.fundsRaised, 0);
  const totalNeeded = projects.reduce((a, b) => a + b.costNeeded, 0);
  const totalVotes = projects.reduce((a, b) => a + b.votes, 0);

  const catData = Object.entries(
    projects.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + p.fundsRaised; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const voteData = [...projects].sort((a, b) => b.votes - a.votes).slice(0, 5).map(p => ({ name: p.title.split(" ").slice(0,3).join(" "), votes: p.votes }));

  const trendData = [
    { month: "Nov", funds: 120, projects: 2 },
    { month: "Dec", funds: 280, projects: 3 },
    { month: "Jan", funds: 450, projects: 4 },
    { month: "Feb", funds: 620, projects: 4 },
    { month: "Mar", funds: 980, projects: 5 },
    { month: "Apr", funds: totalFunds, projects: projects.length },
  ];

  const PIE_COLORS = ["#6d28d9","#0891b2","#059669","#f59e0b","#ec4899","#06b6d4"];

  const StatCard = ({ icon, label, value, sub, accent }) => (
    <div style={{ background: C.white, borderRadius: 14, padding: "22px 24px", border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 30, color: accent || C.purple, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: C.text, margin: "0 0 4px" }}>Impact Dashboard</h2>
        <p style={{ margin: 0, fontSize: 14, color: C.textSub }}>Live metrics across all Gudi AI community projects.</p>
      </div>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard icon="💰" label="Total Funds Raised" value={fmt$(totalFunds)} sub={`of ${fmt$(totalNeeded)} needed`} accent={C.green} />
        <StatCard icon="💜" label="Community Votes" value={totalVotes} sub="across all projects" />
        <StatCard icon="📋" label="Projects Submitted" value={projects.length} sub={`${projects.filter(p=>p.status==="In Progress").length} in progress`} />
        <StatCard icon="🌍" label="Causes Supported" value={Array.from(new Set(projects.map(p=>p.category))).length} sub="unique categories" accent={C.teal} />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Funding trend */}
        <div style={{ background: C.white, borderRadius: 14, padding: 24, border: `1px solid ${C.border}` }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, color: C.text, fontFamily: "'DM Serif Display',serif" }}>Funding Over Time</h3>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: C.textSub }}>Cumulative funds raised by month</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.purple} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textSub }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textSub }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => [`$${v}`, "Funds"]} contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <Area type="monotone" dataKey="funds" stroke={C.purple} strokeWidth={2} fill="url(#fundGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Funds by category donut */}
        <div style={{ background: C.white, borderRadius: 14, padding: 24, border: `1px solid ${C.border}` }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, color: C.text, fontFamily: "'DM Serif Display',serif" }}>Funds by Cause</h3>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: C.textSub }}>Distribution across categories</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={2}>
                  {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [fmt$(v)]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {catData.map((d, i) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: 12, color: C.textSub, fontWeight: 600 }}>{fmt$(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vote bar chart */}
      <div style={{ background: C.white, borderRadius: 14, padding: 24, border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 15, color: C.text, fontFamily: "'DM Serif Display',serif" }}>Top Voted Projects</h3>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: C.textSub }}>Community vote counts</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={voteData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11, fill: C.textSub }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: C.textSub }} axisLine={false} tickLine={false} width={130} />
            <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }} />
            <Bar dataKey="votes" radius={[0,4,4,0]} fill={C.purple} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Project funding progress */}
      <div style={{ background: C.white, borderRadius: 14, padding: 24, border: `1px solid ${C.border}` }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, color: C.text, fontFamily: "'DM Serif Display',serif" }}>Funding Progress by Project</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {projects.map(p => {
            const cat = CAT_COLORS[p.category] || CAT_COLORS.Other;
            const progress = pct(p.fundsRaised, p.costNeeded);
            return (
              <div key={p.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.dot }} />
                    <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{p.title}</span>
                    <Tag label={p.category} scheme={cat} />
                  </div>
                  <span style={{ fontSize: 12, color: C.textSub }}>{fmt$(p.fundsRaised)} / {fmt$(p.costNeeded)} ({progress}%)</span>
                </div>
                <ProgressBar value={progress} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [view, setView] = useState("projects");
  const [showSubmit, setShowSubmit] = useState(false);

  const handleVote = (id) => setProjects(prev => prev.map(p => p.id === id ? { ...p, votes: p.voted ? p.votes - 1 : p.votes + 1, voted: !p.voted } : p));

  const handleSubmit = (form) => {
    setProjects(prev => [...prev, {
      id: Date.now(),
      title: form.title,
      category: form.category,
      shortDesc: form.shortDesc,
      fullDesc: form.fullDesc,
      projectPlans: form.projectPlans,
      impactGoal: form.impactGoal,
      costNeeded: parseFloat(form.costNeeded) || 0,
      fundsRaised: 0,
      status: "Idea",
      votes: 0,
      voted: false,
      lastUpdated: new Date().toLocaleDateString(),
    }]);
    setView("projects");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        select option { background: white; color: #1e1b4b; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 2px; }
      `}</style>

      <Nav view={view} setView={setView} onSubmit={() => setShowSubmit(true)} />

      {showSubmit && <SubmitForm onClose={() => setShowSubmit(false)} onSubmit={handleSubmit} />}

      {view === "projects" && <ProjectsView projects={projects} onVote={handleVote} onSubmit={() => setShowSubmit(true)} />}
      {view === "dashboard" && <Dashboard projects={projects} />}

      <div style={{ borderTop: `1px solid ${C.border}`, padding: "20px 24px", textAlign: "center", fontSize: 13, color: C.textSub, background: C.white }}>
        Built with 💜 by Gudi AI — AI for the good of people, communities & the planet.
      </div>
    </div>
  );
}
