import { useState, useEffect, useRef } from "react";

// ── STORAGE HELPERS ─────────────────────────────────────────
async function sget(key, fallback = null) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : fallback; }
  catch { return fallback; }
}
async function sset(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ── CONSTANTS ────────────────────────────────────────────────
const ADMIN_PASS = "makeover2024";

const DEFAULT_CONTESTANTS = [
  { id: 1, name: "Amara Diallo",  age: 24, hometown: "Dar es Salaam", bio: "Fashion enthusiast with a passion for bold looks and vibrant colours.", specialty: "Glam & Bold",      img: "" },
  { id: 2, name: "Zara Okonkwo",  age: 27, hometown: "Nairobi",        bio: "Self-taught artist who transforms everyday women into queens.",          specialty: "Natural Beauty", img: "" },
  { id: 3, name: "Keisha Mensah", age: 22, hometown: "Accra",          bio: "Beauty school graduate with a love for avant-garde art.",                specialty: "Avant-Garde",   img: "" },
  { id: 4, name: "Fatima Camara", age: 29, hometown: "Lagos",          bio: "Bridal specialist who has worked with over 200 brides across Africa.",   specialty: "Bridal Glow",   img: "" },
];

// ── SMALL COMPONENTS ─────────────────────────────────────────
function Avatar({ img, name, size = 100 }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const palette = ["#e91e8c","#c2185b","#ad1457","#d81b60","#880e4f"];
  const bg = palette[name.charCodeAt(0) % palette.length];
  if (img) return <img src={img} alt={name} style={{ width: size, height: size, objectFit: "cover", borderRadius: "50%", display: "block" }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${bg},#ff6baa)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display',serif", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Toast({ msg }) {
  return (
    <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#c2185b,#e91e8c)", color: "#fff", padding: "12px 26px", borderRadius: 14, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, boxShadow: "0 8px 32px rgba(194,24,91,0.35)", opacity: msg ? 1 : 0, transition: "opacity 0.3s", pointerEvents: "none", zIndex: 9999, whiteSpace: "nowrap" }}>{msg || "‎"}</div>
  );
}

function VoteBar({ pct }) {
  return (
    <div style={{ height: 7, background: "#fce4ec", borderRadius: 99, overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg,#c2185b,#e91e8c,#ff6baa)", borderRadius: 99, transition: "width 0.9s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function Badge({ label }) {
  return <span style={{ fontSize: 10, background: "#fce4ec", color: "#c2185b", borderRadius: 99, padding: "3px 10px", fontWeight: 800, letterSpacing: "0.5px", border: "1px solid #f8bbd0" }}>{label}</span>;
}

// ── CONTESTANT MODAL ─────────────────────────────────────────
function ContestantModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: "", age: "", hometown: "", bio: "", specialty: "", img: "" });
  const [preview, setPreview] = useState(initial?.img || "");
  const fileRef = useRef();

  function handleImg(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setPreview(ev.target.result); setForm(f => ({ ...f, img: ev.target.result })); };
    reader.readAsDataURL(file);
  }

  const valid = form.name.trim() && form.age && form.bio.trim();
  const inp = (key, label, type = "text", ph = "") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, color: "#c2185b", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 5, fontWeight: 700 }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
        style={{ width: "100%", background: "#fff5f8", border: "1.5px solid #f8bbd0", borderRadius: 10, padding: "11px 14px", color: "#3d0020", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(194,24,91,0.08)", backdropFilter: "blur(10px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", border: "2px solid #f8bbd0", borderRadius: 24, padding: "36px 32px", width: "min(100%,480px)", boxShadow: "0 24px 80px rgba(194,24,91,0.18)" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#880e4f", marginBottom: 24, fontStyle: "italic" }}>{initial ? "Edit Contestant" : "Add Contestant ✨"}</h2>

        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div onClick={() => fileRef.current.click()} style={{ cursor: "pointer", display: "inline-block", position: "relative" }}>
            <Avatar img={preview} name={form.name || "?"} size={86} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#c2185b,#e91e8c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, boxShadow: "0 2px 8px rgba(194,24,91,0.35)", color: "#fff" }}>📷</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
          <div style={{ fontSize: 11, color: "#e91e8c", marginTop: 6, fontWeight: 600 }}>Tap to upload photo</div>
        </div>

        {inp("name", "Full Name", "text", "e.g. Amara Diallo")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {inp("age", "Age", "number", "e.g. 24")}
          {inp("hometown", "Hometown", "text", "e.g. Nairobi")}
        </div>
        {inp("specialty", "Specialty", "text", "e.g. Glam & Bold")}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 11, color: "#c2185b", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 5, fontWeight: 700 }}>Bio</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Describe this contestant…" rows={3}
            style={{ width: "100%", background: "#fff5f8", border: "1.5px solid #f8bbd0", borderRadius: 10, padding: "11px 14px", color: "#3d0020", fontSize: 14, fontFamily: "inherit", resize: "none", outline: "none" }} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1.5px solid #f8bbd0", background: "#fff", color: "#c2185b", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14 }}>Cancel</button>
          <button onClick={() => valid && onSave(form)} disabled={!valid}
            style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: valid ? "linear-gradient(135deg,#c2185b,#e91e8c)" : "#fce4ec", color: valid ? "#fff" : "#f48fb1", cursor: valid ? "pointer" : "not-allowed", fontFamily: "inherit", fontWeight: 800, fontSize: 14, boxShadow: valid ? "0 4px 20px rgba(194,24,91,0.3)" : "none" }}>
            {initial ? "Save Changes" : "Add Contestant"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN LOGIN ──────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  function attempt() {
    if (pw === ADMIN_PASS) { onLogin(); setErr(false); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(255,240,246,0.85)", backdropFilter: "blur(16px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", border: "2px solid #f8bbd0", borderRadius: 24, padding: "48px 36px", width: "min(100%,400px)", textAlign: "center", boxShadow: "0 24px 80px rgba(194,24,91,0.15)" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: "#880e4f", marginBottom: 6, fontStyle: "italic" }}>Admin Access</h2>
        <p style={{ color: "#e91e8c", fontSize: 13, marginBottom: 28, fontWeight: 600 }}>Enter the admin password to continue</p>
        <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === "Enter" && attempt()}
          placeholder="Password"
          style={{ width: "100%", background: err ? "#fff0f3" : "#fff5f8", border: `2px solid ${err ? "#e91e8c" : "#f8bbd0"}`, borderRadius: 12, padding: "13px 18px", color: "#3d0020", fontSize: 15, fontFamily: "inherit", outline: "none", textAlign: "center", letterSpacing: 3, marginBottom: 14, transition: "border-color 0.2s" }} />
        {err && <div style={{ color: "#e91e8c", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>❌ Incorrect password</div>}
        <button onClick={attempt}
          style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#c2185b,#e91e8c)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 24px rgba(194,24,91,0.35)" }}>
          Unlock Admin Panel →
        </button>
        <div style={{ marginTop: 16, fontSize: 11, color: "#f48fb1" }}>Hint: makeover2024</div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────
export default function TheMakeover() {
  const [contestants, setContestants] = useState(DEFAULT_CONTESTANTS);
  const [votes, setVotes] = useState({});
  const [votedIds, setVotedIds] = useState([]);
  const [page, setPage] = useState("home"); // "home" | "vote" | "admin"
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const toastRef = useRef();

  useEffect(() => {
    (async () => {
      const [v, c, vid] = await Promise.all([sget("mk-votes", {}), sget("mk-contestants", null), sget("mk-voted", [])]);
      setVotes(v);
      if (c) setContestants(c);
      setVotedIds(vid);
      setLoaded(true);
    })();
  }, []);

  function toast_(msg) { setToast(msg); clearTimeout(toastRef.current); toastRef.current = setTimeout(() => setToast(""), 2600); }

  async function castVote(id) {
    if (votedIds.includes(id)) { toast_("You've already voted for this contestant! 💄"); return; }
    const nv = { ...votes, [id]: (votes[id] || 0) + 1 };
    const nvid = [...votedIds, id];
    setVotes(nv); setVotedIds(nvid);
    await sset("mk-votes", nv); await sset("mk-voted", nvid);
    const c = contestants.find(x => x.id === id);
    toast_(`✨ Your vote for ${c?.name} is counted!`);
  }

  async function addContestant(form) {
    const nc = { ...form, id: Date.now(), age: Number(form.age) };
    const upd = [...contestants, nc];
    setContestants(upd); await sset("mk-contestants", upd);
    setModal(null); toast_(`🎉 ${nc.name} added to the show!`);
  }

  async function editContestant(form) {
    const upd = contestants.map(c => c.id === modal.id ? { ...modal, ...form, age: Number(form.age) } : c);
    setContestants(upd); await sset("mk-contestants", upd);
    setModal(null); toast_("✅ Contestant updated!");
  }

  async function removeContestant(id) {
    const upd = contestants.filter(c => c.id !== id);
    const nv = { ...votes }; delete nv[id];
    setContestants(upd); setVotes(nv);
    await sset("mk-contestants", upd); await sset("mk-votes", nv);
    toast_("Contestant removed.");
  }

  async function resetVotes() {
    setVotes({}); setVotedIds([]);
    await sset("mk-votes", {}); await sset("mk-voted", []);
    toast_("🔄 All votes have been reset.");
  }

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
  const sorted = [...contestants].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));

  if (!loaded) return (
    <div style={{ height: "100vh", background: "#fff0f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#e91e8c", fontSize: 26, fontFamily: "'Playfair Display',serif", fontStyle: "italic" }}>Loading The Make Over…</div>
    </div>
  );

  // ── PUBLIC: HOME ──────────────────────────────────────────
  const HomePage = () => (
    <div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #fff0f6 0%, #fce4ec 50%, #fff 100%)", textAlign: "center", padding: "80px 20px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(233,30,140,0.08), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(194,24,91,0.07), transparent 70%)", pointerEvents: "none" }} />

        {/* Show logo text */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
          <div style={{ width: 40, height: 2, background: "linear-gradient(90deg,transparent,#e91e8c)" }} />
          <span style={{ fontSize: 11, letterSpacing: "4px", color: "#e91e8c", fontWeight: 800, textTransform: "uppercase" }}>Season 1</span>
          <div style={{ width: 40, height: 2, background: "linear-gradient(90deg,#e91e8c,transparent)" }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, lineHeight: 1 }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "clamp(13px,2.5vw,16px)", color: "#880e4f", letterSpacing: 8, textTransform: "uppercase", marginBottom: 6 }}>THE &nbsp; MAKE</span>
          </div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 900, fontSize: "clamp(72px,14vw,130px)", lineHeight: 0.85, background: "linear-gradient(135deg,#880e4f 0%,#c2185b 30%,#e91e8c 60%,#ff6baa 85%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Over
          </div>
        </div>

        <div style={{ width: 60, height: 3, background: "linear-gradient(90deg,#c2185b,#e91e8c)", borderRadius: 99, margin: "20px auto 20px" }} />
        <p style={{ color: "#ad1457", fontSize: 16, maxWidth: 540, margin: "0 auto 36px", lineHeight: 1.7, fontWeight: 600 }}>
          Africa's most glamorous transformation show. Watch ordinary become extraordinary — and vote for your favourite contestant to win the crown! 👑
        </p>

        <button onClick={() => setPage("vote")}
          style={{ padding: "16px 48px", borderRadius: 99, border: "none", background: "linear-gradient(135deg,#c2185b,#e91e8c)", color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 32px rgba(194,24,91,0.35)", letterSpacing: "0.5px", transition: "transform 0.2s, box-shadow 0.2s" }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 40px rgba(194,24,91,0.45)"; }}
          onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = "0 8px 32px rgba(194,24,91,0.35)"; }}>
          💄 Vote Now
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ background: "#fce4ec", borderTop: "1px solid #f8bbd0", borderBottom: "1px solid #f8bbd0", padding: "18px 20px", display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
        {[["👯 Contestants", contestants.length], ["🗳️ Votes Cast", totalVotes], ["✨ Season", "1"]].map(([label, val]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: "#c2185b" }}>{val}</div>
            <div style={{ fontSize: 12, color: "#ad1457", fontWeight: 700, letterSpacing: "0.5px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Contestants preview */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,5vw,42px)", fontStyle: "italic", color: "#880e4f", marginBottom: 8 }}>Meet the Contestants</h2>
          <p style={{ color: "#e91e8c", fontSize: 14, fontWeight: 600 }}>Click on a contestant to learn more</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 24 }}>
          {contestants.map((c, i) => (
            <div key={c.id} onClick={() => setSelectedCard(selectedCard?.id === c.id ? null : c)}
              style={{ background: "#fff", border: `2px solid ${selectedCard?.id === c.id ? "#e91e8c" : "#fce4ec"}`, borderRadius: 20, overflow: "hidden", cursor: "pointer", transition: "all 0.25s", boxShadow: selectedCard?.id === c.id ? "0 12px 40px rgba(194,24,91,0.2)" : "0 4px 16px rgba(194,24,91,0.08)", animation: `fadeUp 0.5s ease ${i * 0.08}s both`, transform: selectedCard?.id === c.id ? "translateY(-4px)" : "" }}>
              <div style={{ height: 180, background: "linear-gradient(160deg,#fce4ec,#fff0f6)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {c.img ? <img src={c.img} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <Avatar img={c.img} name={c.name} size={90} />}
              </div>
              <div style={{ padding: "16px 18px" }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: "#880e4f", fontWeight: 700, marginBottom: 4 }}>{c.name}</h3>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#ad1457", fontWeight: 600 }}>Age {c.age}</span>
                  {c.hometown && <span style={{ fontSize: 11, color: "#ad1457" }}>· {c.hometown}</span>}
                </div>
                {c.specialty && <Badge label={c.specialty} />}
                {selectedCard?.id === c.id && (
                  <p style={{ marginTop: 10, fontSize: 13, color: "#7b1fa2", lineHeight: 1.6 }}>{c.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button onClick={() => setPage("vote")}
            style={{ padding: "14px 40px", borderRadius: 99, border: "2px solid #e91e8c", background: "#fff", color: "#e91e8c", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.background = "#e91e8c"; e.target.style.color = "#fff"; }}
            onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.color = "#e91e8c"; }}>
            Cast Your Vote →
          </button>
        </div>
      </div>
    </div>
  );

  // ── PUBLIC: VOTE ──────────────────────────────────────────
  const VotePage = () => (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 20px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,5vw,42px)", fontStyle: "italic", color: "#880e4f", marginBottom: 8 }}>Cast Your Vote</h2>
        <p style={{ color: "#e91e8c", fontSize: 14, fontWeight: 600 }}>You may vote for each contestant once. Support your favourite!</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 26 }}>
        {contestants.map((c, i) => {
          const hasVoted = votedIds.includes(c.id);
          return (
            <div key={c.id} style={{ background: "#fff", border: `2px solid ${hasVoted ? "#e91e8c" : "#fce4ec"}`, borderRadius: 22, overflow: "hidden", boxShadow: hasVoted ? "0 12px 40px rgba(194,24,91,0.18)" : "0 4px 16px rgba(194,24,91,0.07)", animation: `fadeUp 0.5s ease ${i * 0.08}s both`, transition: "transform 0.25s,box-shadow 0.25s", position: "relative" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 20px 56px rgba(194,24,91,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = hasVoted ? "0 12px 40px rgba(194,24,91,0.18)" : "0 4px 16px rgba(194,24,91,0.07)"; }}>

              {hasVoted && (
                <div style={{ position: "absolute", top: 12, right: 12, background: "linear-gradient(135deg,#c2185b,#e91e8c)", borderRadius: 99, padding: "4px 12px", fontSize: 10, fontWeight: 800, color: "#fff", zIndex: 2, letterSpacing: "1px" }}>✓ VOTED</div>
              )}

              <div style={{ height: 200, background: "linear-gradient(160deg,#fff0f6,#fce4ec)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {c.img ? <img src={c.img} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <Avatar img={c.img} name={c.name} size={100} />}
              </div>

              <div style={{ padding: "18px 20px 20px" }}>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: "#880e4f", fontWeight: 700, marginBottom: 4 }}>{c.name}</h3>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "#ad1457" }}>Age {c.age}</span>
                  {c.hometown && <span style={{ fontSize: 12, color: "#ad1457" }}>· {c.hometown}</span>}
                  {c.specialty && <Badge label={c.specialty} />}
                </div>
                <p style={{ fontSize: 13, color: "#7b1fa2", lineHeight: 1.6, marginBottom: 16 }}>{c.bio}</p>

                <button onClick={() => castVote(c.id)} disabled={hasVoted}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: hasVoted ? "#fce4ec" : "linear-gradient(135deg,#c2185b,#e91e8c)", color: hasVoted ? "#f48fb1" : "#fff", fontWeight: 800, fontSize: 14, cursor: hasVoted ? "default" : "pointer", fontFamily: "inherit", boxShadow: hasVoted ? "none" : "0 4px 20px rgba(194,24,91,0.3)", transition: "all 0.2s", letterSpacing: "0.3px" }}>
                  {hasVoted ? "✓ Vote Cast" : `💄 Vote for ${c.name.split(" ")[0]}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── ADMIN DASHBOARD ───────────────────────────────────────
  const AdminPage = () => {
    if (!isAdmin) return null;
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "2px", color: "#e91e8c", fontWeight: 800, textTransform: "uppercase", marginBottom: 4 }}>🔐 Admin Panel</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, color: "#880e4f", fontStyle: "italic", margin: 0 }}>Control Centre</h2>
          </div>
          <button onClick={() => { setIsAdmin(false); setPage("home"); toast_("Logged out."); }}
            style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid #f8bbd0", background: "#fff", color: "#c2185b", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            🔓 Log Out
          </button>
        </div>

        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16, marginBottom: 36 }}>
          {[["Total Votes", totalVotes, "🗳️"], ["Contestants", contestants.length, "👯"], ["Leading", sorted[0]?.name.split(" ")[0] || "—", "👑"], ["Votes Today", totalVotes, "📈"]].map(([label, val, icon]) => (
            <div key={label} style={{ background: "#fff", border: "2px solid #fce4ec", borderRadius: 16, padding: "20px 18px", boxShadow: "0 4px 16px rgba(194,24,91,0.07)" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: "#c2185b" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#ad1457", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Live Results */}
        <div style={{ background: "#fff", border: "2px solid #fce4ec", borderRadius: 20, padding: "28px 24px", marginBottom: 28, boxShadow: "0 4px 20px rgba(194,24,91,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#880e4f", fontStyle: "italic", margin: 0 }}>📊 Live Vote Results</h3>
            <button onClick={resetVotes} style={{ padding: "8px 16px", borderRadius: 9, border: "1.5px solid #ffcdd2", background: "#fff5f5", color: "#e53935", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>🔄 Reset Votes</button>
          </div>
          {sorted.length === 0 ? <div style={{ textAlign: "center", color: "#f48fb1", padding: "24px 0" }}>No votes yet.</div>
            : sorted.map((c, i) => {
              const cv = votes[c.id] || 0;
              const pct = totalVotes > 0 ? Math.round((cv / totalVotes) * 100) : 0;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < sorted.length - 1 ? "1px solid #fce4ec" : "none" }}>
                  <div style={{ fontSize: 22, minWidth: 32 }}>{medals[i] || `#${i + 1}`}</div>
                  <Avatar img={c.img} name={c.name} size={42} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: "#880e4f", fontWeight: 700 }}>{c.name}</div>
                    <VoteBar pct={pct} />
                  </div>
                  <div style={{ textAlign: "right", minWidth: 56 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? "#e91e8c" : "#c2185b" }}>{pct}%</div>
                    <div style={{ fontSize: 11, color: "#f48fb1" }}>{cv} votes</div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Manage Contestants */}
        <div style={{ background: "#fff", border: "2px solid #fce4ec", borderRadius: 20, padding: "28px 24px", boxShadow: "0 4px 20px rgba(194,24,91,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#880e4f", fontStyle: "italic", margin: 0 }}>👯 Manage Contestants</h3>
            <button onClick={() => setModal("add")}
              style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#c2185b,#e91e8c)", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(194,24,91,0.3)" }}>
              + Add Contestant
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contestants.map((c, i) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#fff5f8", border: "1.5px solid #fce4ec", borderRadius: 14, flexWrap: "wrap", gap: 12 }}>
                <Avatar img={c.img} name={c.name} size={46} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: "#880e4f", fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#ad1457" }}>Age {c.age} · {c.hometown || "—"} · <strong style={{ color: "#e91e8c" }}>{votes[c.id] || 0} votes</strong></div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setModal(c)} style={{ padding: "8px 14px", borderRadius: 9, border: "1.5px solid #f8bbd0", background: "#fff", color: "#c2185b", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.target.style.background = "#fce4ec"; }}
                    onMouseLeave={e => { e.target.style.background = "#fff"; }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => removeContestant(c.id)} style={{ padding: "8px 14px", borderRadius: 9, border: "1.5px solid #ffcdd2", background: "#fff", color: "#e53935", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.target.style.background = "#fff5f5"; }}
                    onMouseLeave={e => { e.target.style.background = "#fff"; }}>
                    🗑 Remove
                  </button>
                </div>
              </div>
            ))}
            {contestants.length === 0 && <div style={{ textAlign: "center", color: "#f48fb1", padding: "32px 0", fontSize: 14 }}>No contestants yet. Add one above!</div>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8fb", fontFamily: "'Nunito',sans-serif", color: "#3d0020" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700;1,900&family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, button { font-family: inherit; }
        input:focus, textarea:focus { border-color: #e91e8c !important; box-shadow: 0 0 0 3px rgba(233,30,140,0.1) !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ background: "#fff", borderBottom: "2px solid #fce4ec", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 16px rgba(194,24,91,0.07)" }}>
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: "#880e4f", letterSpacing: 3, textTransform: "uppercase" }}>THE MAKE</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 26, fontWeight: 900, color: "#e91e8c", lineHeight: 1 }}>Over</span>
          <span style={{ fontSize: 14, marginLeft: 2 }}>💄</span>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[["home", "Home"], ["vote", "Vote"]].map(([p, label]) => (
            <button key={p} onClick={() => setPage(p)}
              style={{ padding: "8px 16px", borderRadius: 99, border: `1.5px solid ${page === p ? "#e91e8c" : "#fce4ec"}`, background: page === p ? "#fce4ec" : "transparent", color: page === p ? "#c2185b" : "#ad1457", fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
          <button onClick={() => { if (isAdmin) { setPage("admin"); } else { setShowLogin(true); } }}
            style={{ padding: "8px 16px", borderRadius: 99, border: `1.5px solid ${page === "admin" ? "#e91e8c" : "#f8bbd0"}`, background: isAdmin && page === "admin" ? "#fce4ec" : "#fff", color: "#c2185b", fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
            {isAdmin ? "⚙️ Admin" : "🔒 Admin"}
          </button>
        </div>
      </nav>

      {/* ── PAGES ── */}
      {page === "home" && <HomePage />}
      {page === "vote" && <VotePage />}
      {page === "admin" && isAdmin && <AdminPage />}

      {/* ── ADMIN LOGIN MODAL ── */}
      {showLogin && (
        <AdminLogin onLogin={() => { setIsAdmin(true); setShowLogin(false); setPage("admin"); toast_("🔓 Welcome, Admin!"); }} />
      )}
      {showLogin && <div onClick={() => setShowLogin(false)} style={{ position: "fixed", inset: 0, zIndex: 998 }} />}
      {showLogin && <AdminLogin onLogin={() => { setIsAdmin(true); setShowLogin(false); setPage("admin"); toast_("🔓 Welcome, Admin!"); }} />}

      {/* ── CONTESTANT MODALS ── */}
      {modal === "add" && <ContestantModal onSave={addContestant} onClose={() => setModal(null)} />}
      {modal && modal !== "add" && <ContestantModal initial={modal} onSave={editContestant} onClose={() => setModal(null)} />}

      <Toast msg={toast} />

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "28px 20px", borderTop: "2px solid #fce4ec", background: "#fff" }}>
        <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", color: "#e91e8c", fontSize: 18 }}>The Make Over</span>
        <span style={{ color: "#f48fb1", fontSize: 13 }}> · All Rights Reserved · Season 1</span>
      </footer>
    </div>
  );
}
