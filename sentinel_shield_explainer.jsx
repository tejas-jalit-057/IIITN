import { useState } from "react";

const data = {
  dashboards: [
    {
      id: "dashboard1",
      title: "Image 1 — SENTINEL SHIELD: Complete DDoS Detection System",
      icon: "🛡️",
      summary:
        "This is the real-time operational dashboard. It shows live traffic monitoring, signal-processing metrics, and ML model outputs — all running simultaneously to detect a DDoS attack.",
      panels: [
        {
          title: "Traffic Rate",
          color: "#3b82f6",
          what: "Plots incoming requests per second over 500 seconds. A sharp spike around t=200–400s marks the DDoS attack window.",
          why: "This is your ground truth — the raw evidence. Everything else is trying to confirm what this graph shows.",
        },
        {
          title: "Shannon Entropy",
          color: "#22c55e",
          what: "Measures how random/diverse the source IPs are. It drops sharply during the attack because botnet IPs become repetitive.",
          why: "Low entropy = suspicious. Real traffic is diverse; attack traffic is uniform.",
        },
        {
          title: "Hurst Exponent",
          color: "#ec4899",
          what: "Measures self-similarity in the traffic over time. A value > 0.5 (dashed line) indicates long-range dependence — a hallmark of DDoS.",
          why: "Normal traffic is bursty but random. Attack traffic has a persistent, repetitive pattern.",
        },
        {
          title: "Burst Intensity",
          color: "#06b6d4",
          what: "Wavelet-based burst detection. A large spike during the attack window shows abnormal traffic bursts.",
          why: "DDoS floods create unnatural bursts that normal traffic never produces.",
        },
        {
          title: "Periodicity",
          color: "#f59e0b",
          what: "Auto-correlation analysis. High periodicity during the attack means traffic is repeating at a fixed interval — classic bot behavior.",
          why: "Bots send requests on a timer. Real users don't.",
        },
        {
          title: "Frequency Peak",
          color: "#a855f7",
          what: "FFT-based power spectral analysis. A dominant frequency peak appears during the attack.",
          why: "Confirms the periodic pattern from a frequency-domain perspective.",
        },
        {
          title: "SP Anomaly Score",
          color: "#ef4444",
          what: "Signal processing anomaly score combining entropy, Hurst, burst, and periodicity. Rises during the attack.",
          why: "This is the signal-processing model's 'verdict' — a fused score from multiple indicators.",
        },
        {
          title: "ML Attack Probability",
          color: "#6366f1",
          what: "The ML ensemble's predicted attack probability. Jumps to ~1.0 during the attack and drops back after.",
          why: "This is the ML model's verdict. It confirms the SP score independently.",
        },
        {
          title: "Feature Importance",
          color: "#14b8a6",
          what: "Bar chart showing which features matter most to the ML model. CurrentRate dominates.",
          why: "Tells you what the model actually relies on — critical for debugging and trust.",
        },
        {
          title: "Confusion Matrices (SP & ML)",
          color: "#f97316",
          what: "SP matrix shows some misclassifications. ML matrix shows perfect classification (350 normal, 150 attack, 0 errors).",
          why: "SP has false positives/negatives; ML is 100% accurate here. Shows why the ensemble favors ML.",
        },
        {
          title: "Detection Comparison",
          color: "#84cc16",
          what: "Overlays ground truth, SP detection, and ML detection on the same timeline.",
          why: "Visually proves both methods detect the attack, but ML is more precise and aligned with ground truth.",
        },
      ],
    },
    {
      id: "dashboard2",
      title: "Image 2 — SENTINEL SHIELD: DDoS Analysis Report (VOLUMETRIC ATTACK)",
      icon: "📊",
      summary:
        "This is the post-attack analysis report — a structured PDF-style summary generated after an attack is detected. It's presentation-ready and tells the full story.",
      panels: [
        {
          title: "Traffic Rate Timeline",
          color: "#3b82f6",
          what: "Same traffic plot but now annotated with 'Attack Start' and 'Attack End' markers and a shaded attack window.",
          why: "Annotation makes it immediately clear when the attack occurred — essential for reporting.",
        },
        {
          title: "Shannon Entropy (IP Randomness)",
          color: "#22c55e",
          what: "Labeled with 'Normal Threshold' line. Entropy drops below the threshold during the attack.",
          why: "The threshold line makes the anomaly self-evident — no interpretation needed.",
        },
        {
          title: "Self-Similarity Analysis",
          color: "#ec4899",
          what: "Hurst Exponent with 'Attack Threshold' and 'Random Walk' reference lines.",
          why: "Contextualizes the metric: above the attack threshold = DDoS signature detected.",
        },
        {
          title: "Wavelet Burst Analysis",
          color: "#06b6d4",
          what: "Same burst intensity but labeled as a wavelet analysis for clarity.",
          why: "Naming it properly helps non-technical stakeholders understand the method.",
        },
        {
          title: "Multi-Feature Anomaly Detection",
          color: "#f59e0b",
          what: "Anomaly score with a 'Detection Threshold' dashed line. Score exceeds it during the attack.",
          why: "A single threshold crossing is the trigger event — clear and actionable.",
        },
        {
          title: "ML Ensemble Predictions",
          color: "#a855f7",
          what: "Attack probability with a 'Decision Boundary' at 0.5. Probability jumps above it during the attack.",
          why: "Decision boundary framing makes the ML output interpretable for non-ML audiences.",
        },
        {
          title: "Confusion Matrix",
          color: "#14b8a6",
          what: "Perfect classification: 350 TN, 150 TP, 0 FP, 0 FN. Color-coded green/gray.",
          why: "100% accuracy is the headline result — instantly impressive for a hackathon.",
        },
        {
          title: "ROC Curve (AUC = 1.0)",
          color: "#ef4444",
          what: "Perfect ROC curve hugging the top-left corner. AUC = 1.0 vs. random baseline.",
          why: "AUC = 1.0 is the gold standard. Proves the model perfectly separates attack from normal.",
        },
        {
          title: "Top Features",
          color: "#6366f1",
          what: "Horizontal bar chart of top 6 features by importance. CurrentRate is the most important.",
          why: "Explains model decisions — judges will ask 'why does it work?' This answers it.",
        },
        {
          title: "Text Sections",
          color: "#f97316",
          what: "Detection Performance stats, Algorithms used, and Mitigation actions (Rate Limit, IP Block, CAPTCHA).",
          why: "Turns detection into actionable defense. Shows the system doesn't just detect — it responds.",
        },
      ],
    },
  ],
  improvements: [
    {
      category: "📤 Presentation & Layout",
      color: "#3b82f6",
      items: [
        {
          title: "Unify the visual theme",
          desc: "Dashboard 1 uses mismatched colors per chart. Use a single cohesive color palette (e.g., dark background with neon accents) across all panels for a professional, polished look.",
        },
        {
          title: "Add a hero summary card",
          desc: "Put a big 'ATTACK DETECTED ⚠️' or 'SYSTEM HEALTHY ✅' status banner at the top. Judges scan quickly — give them the headline in 2 seconds.",
        },
        {
          title: "Animate the live dashboard",
          desc: "If presenting live, animate the traffic rate and detection scores updating in real time. Motion grabs attention and proves it's a working system, not static screenshots.",
        },
        {
          title: "Dark mode everywhere",
          desc: "Dashboard 2 has a white background which looks outdated for a cybersecurity tool. Dark/black backgrounds feel more authentic to the domain and are easier on eyes during presentations.",
        },
      ],
    },
    {
      category: "📈 Technical Depth",
      color: "#22c55e",
      items: [
        {
          title: "Show latency / real-time performance",
          desc: "Add a 'Detection Latency' metric (e.g., '< 50ms from attack start to detection'). Judges care about speed — how fast does it actually catch an attack?",
        },
        {
          title: "Add attack type classification",
          desc: "You detect volumetric attacks. Show it can also classify SYN floods, amplification attacks, or application-layer attacks. Breadth impresses.",
        },
        {
          title: "Show the ensemble logic",
          desc: "Add a panel explaining how SP and ML scores are fused. Do you average them? Weighted vote? This shows algorithmic sophistication.",
        },
        {
          title: "Test on multiple attack scenarios",
          desc: "One perfect run looks lucky. Show results on 3–5 different attack types/intensities to prove robustness.",
        },
      ],
    },
    {
      category: "🎯 Hackathon Strategy",
      color: "#f59e0b",
      items: [
        {
          title: "Lead with the problem, not the solution",
          desc: "Open your presentation with a 30-second clip or stat about real DDoS attacks (e.g., 'In 2024, DDoS attacks cost $X billion'). Hook judges emotionally before showing your dashboard.",
        },
        {
          title: "Have a live demo ready",
          desc: "Simulate an attack in real time during the presentation. Nothing beats a live 'attack detected' moment — it's dramatic and memorable.",
        },
        {
          title: "Prepare for the 'why not just block IPs?' question",
          desc: "Judges will challenge your approach. Have a clear answer: botnets rotate IPs, so static blocking fails. Your entropy + ML approach adapts dynamically.",
        },
        {
          title: "Add a mitigation dashboard",
          desc: "You mention Rate Limit, IP Block, CAPTCHA in the report. Show these actions being executed in real time. Detection without response is incomplete.",
        },
      ],
    },
  ],
};

export default function SentinelExplainer() {
  const [activeTab, setActiveTab] = useState("explain");
  const [expandedDashboard, setExpandedDashboard] = useState(0);
  const [expandedPanels, setExpandedPanels] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(0);

  const togglePanel = (key) => {
    setExpandedPanels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: "#0a0e1a",
        color: "#e2e8f0",
        minHeight: "100vh",
        padding: "24px 20px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "linear-gradient(135deg, #1e293b, #0f172a)",
            border: "1px solid #334155",
            borderRadius: 14,
            padding: "10px 24px",
          }}
        >
          <span style={{ fontSize: 28 }}>🛡️</span>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: 1,
              }}
            >
              SENTINEL SHIELD
            </div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2 }}>
              DDoS DETECTION SYSTEM — BREAKDOWN & HACKATHON GUIDE
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {[
          { id: "explain", label: "📖 Explain Dashboards" },
          { id: "improve", label: "🚀 Hackathon Improvements" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border:
                activeTab === tab.id ? "1px solid #38bdf8" : "1px solid #334155",
              background:
                activeTab === tab.id
                  ? "rgba(56,189,248,0.12)"
                  : "rgba(30,41,59,0.6)",
              color: activeTab === tab.id ? "#38bdf8" : "#94a3b8",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* EXPLAIN TAB */}
      {activeTab === "explain" && (
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Dashboard selector */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {data.dashboards.map((d, i) => (
              <button
                key={i}
                onClick={() => setExpandedDashboard(i)}
                style={{
                  flex: 1,
                  padding: "11px 14px",
                  borderRadius: 10,
                  border:
                    expandedDashboard === i
                      ? "1px solid #38bdf8"
                      : "1px solid #1e293b",
                  background:
                    expandedDashboard === i
                      ? "rgba(56,189,248,0.08)"
                      : "#111827",
                  color: expandedDashboard === i ? "#38bdf8" : "#64748b",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 3 }}>{d.icon}</div>
                <div>Image {i + 1}</div>
                <div
                  style={{
                    fontSize: 10,
                    color: expandedDashboard === i ? "#7dd3fc" : "#475569",
                    marginTop: 2,
                  }}
                >
                  {i === 0 ? "Live Dashboard" : "Analysis Report"}
                </div>
              </button>
            ))}
          </div>

          {/* Summary */}
          {(() => {
            const d = data.dashboards[expandedDashboard];
            return (
              <>
                <div
                  style={{
                    background: "#111827",
                    border: "1px solid #1e293b",
                    borderRadius: 12,
                    padding: "16px 20px",
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#f1f5f9",
                      marginBottom: 6,
                    }}
                  >
                    {d.title}
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                    {d.summary}
                  </div>
                </div>

                {/* Panels */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {d.panels.map((p, i) => {
                    const key = `${expandedDashboard}-${i}`;
                    const open = expandedPanels[key];
                    return (
                      <div
                        key={key}
                        style={{
                          background: "#111827",
                          border: `1px solid ${open ? p.color + "44" : "#1e293b"}`,
                          borderRadius: 10,
                          overflow: "hidden",
                          transition: "border-color 0.2s",
                        }}
                      >
                        <button
                          onClick={() => togglePanel(key)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 16px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: p.color,
                              flexShrink: 0,
                              boxShadow: open ? `0 0 8px ${p.color}66` : "none",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: open ? p.color : "#cbd5e1",
                              }}
                            >
                              {p.title}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#475569",
                              transform: open ? "rotate(180deg)" : "rotate(0)",
                              transition: "transform 0.2s",
                              display: "inline-block",
                            }}
                          >
                            ▼
                          </span>
                        </button>
                        {open && (
                          <div
                            style={{
                              padding: "0 16px 14px 38px",
                              borderTop: `1px solid ${p.color}22`,
                            }}
                          >
                            <div style={{ marginTop: 10 }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: p.color,
                                  textTransform: "uppercase",
                                  letterSpacing: 1,
                                }}
                              >
                                What it shows
                              </span>
                              <p
                                style={{
                                  fontSize: 12.5,
                                  color: "#94a3b8",
                                  lineHeight: 1.6,
                                  margin: "5px 0 0",
                                }}
                              >
                                {p.what}
                              </p>
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: "#f59e0b",
                                  textTransform: "uppercase",
                                  letterSpacing: 1,
                                }}
                              >
                                Why it matters
                              </span>
                              <p
                                style={{
                                  fontSize: 12.5,
                                  color: "#94a3b8",
                                  lineHeight: 1.6,
                                  margin: "5px 0 0",
                                }}
                              >
                                {p.why}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* IMPROVE TAB */}
      {activeTab === "improve" && (
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              fontSize: 12.5,
              color: "#fca5a5",
              lineHeight: 1.5,
            }}
          >
            💡 These suggestions are prioritized for maximum hackathon impact.
            Start with Presentation & Layout — that's what judges see first.
          </div>

          {data.improvements.map((cat, ci) => {
            const open = expandedCategory === ci;
            return (
              <div
                key={ci}
                style={{
                  marginBottom: 12,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `1px solid ${open ? cat.color + "33" : "#1e293b"}`,
                  background: "#111827",
                  transition: "border-color 0.2s",
                }}
              >
                <button
                  onClick={() => setExpandedCategory(ci)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: open ? cat.color : "#e2e8f0",
                    }}
                  >
                    {cat.category}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#475569",
                      transform: open ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.2s",
                      display: "inline-block",
                    }}
                  >
                    ▼
                  </span>
                </button>
                {open && (
                  <div style={{ padding: "0 18px 18px" }}>
                    {cat.items.map((item, ii) => (
                      <div
                        key={ii}
                        style={{
                          background: "rgba(15,23,42,0.6)",
                          borderRadius: 8,
                          padding: "12px 14px",
                          marginBottom: ii < cat.items.length - 1 ? 8 : 0,
                          borderLeft: `3px solid ${cat.color}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#f1f5f9",
                            marginBottom: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span style={{ color: cat.color }}>→</span>
                          {item.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            lineHeight: 1.55,
                          }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick Checklist */}
          <div
            style={{
              marginTop: 24,
              background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
              border: "1px solid #312e81",
              borderRadius: 12,
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#a5b4fc",
                marginBottom: 12,
                letterSpacing: 0.5,
              }}
            >
              ✅ Pre-Hackathon Checklist
            </div>
            {[
              "Dark-themed unified dashboard ready",
              "Live attack simulation demo prepared",
              "Latency metrics measured and displayed",
              "ROC + Confusion matrix results rehearsed",
              "Mitigation actions shown (not just detection)",
              "30-second 'why DDoS matters' hook written",
              "Ensemble fusion logic explained in 1 slide",
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "6px 0",
                  borderBottom:
                    i < 6 ? "1px solid rgba(99,102,241,0.15)" : "none",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: "2px solid #6366f1",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                />
                <span style={{ fontSize: 12.5, color: "#c7d2fe" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
