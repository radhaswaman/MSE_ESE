import { useState } from "react";

const SUBJECTS = [
  { code: "WT", name: "Web Technology" },
  { code: "CD", name: "Compiler Design" },
  { code: "DAA", name: "Design & Analysis of Algorithms" },
  { code: "SDAM", name: "Software Design & Modeling" },
];

const GRADE_SCALE = [
  { min: 90, grade: "S", points: 10 },
  { min: 80, grade: "A", points: 9 },
  { min: 70, grade: "B", points: 8 },
  { min: 60, grade: "C", points: 7 },
  { min: 55, grade: "D", points: 6 },
  { min: 50, grade: "E", points: 5 },
  { min: 0, grade: "F", points: 0 },
];

function getGrade(total) {
  for (const g of GRADE_SCALE) {
    if (total >= g.min) return g;
  }
  return GRADE_SCALE[GRADE_SCALE.length - 1];
}

function calcTotal(mse, ese) {
  const m = parseFloat(mse) || 0;
  const e = parseFloat(ese) || 0;
  return (m * 0.3 + e * 0.7).toFixed(2);
}

export default function VITResult() {
  const initMarks = () =>
    SUBJECTS.reduce((acc, s) => {
      acc[s.code] = { mse: "", ese: "" };
      return acc;
    }, {});

  const [marks, setMarks] = useState(initMarks());
  const [studentInfo, setStudentInfo] = useState({ name: "", regNo: "", semester: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInfo = (e) => setStudentInfo({ ...studentInfo, [e.target.name]: e.target.value });

  const handleMark = (code, field, value) => {
    if (value !== "" && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
      setErrors((prev) => ({ ...prev, [`${code}_${field}`]: "0–100 only" }));
    } else {
      setErrors((prev) => {
        const e = { ...prev };
        delete e[`${code}_${field}`];
        return e;
      });
    }
    setMarks((prev) => ({ ...prev, [code]: { ...prev[code], [field]: value } }));
  };

  const validate = () => {
    const newErr = {};
    let valid = true;
    SUBJECTS.forEach(({ code }) => {
      ["mse", "ese"].forEach((f) => {
        const v = marks[code][f];
        if (v === "" || isNaN(v)) {
          newErr[`${code}_${f}`] = "Required";
          valid = false;
        } else if (parseFloat(v) < 0 || parseFloat(v) > 100) {
          newErr[`${code}_${f}`] = "0–100";
          valid = false;
        }
      });
    });
    setErrors(newErr);
    return valid;
  };

  const calculate = () => {
    if (!validate()) return;
    const rows = SUBJECTS.map(({ code, name }) => {
      const mse = parseFloat(marks[code].mse);
      const ese = parseFloat(marks[code].ese);
      const total = parseFloat(calcTotal(mse, ese));
      const { grade, points } = getGrade(total);
      return { code, name, mse, ese, total, grade, points, credits: 4 };
    });
    const totalCredits = rows.reduce((a, r) => a + r.credits, 0);
    const weightedPoints = rows.reduce((a, r) => a + r.points * r.credits, 0);
    const cgpa = (weightedPoints / totalCredits).toFixed(2);
    const failed = rows.some((r) => r.grade === "F");
    const status = failed ? "FAIL" : "PASS";
    setResult({ rows, cgpa, status, totalCredits, weightedPoints });
  };

  const reset = () => {
    setMarks(initMarks());
    setStudentInfo({ name: "", regNo: "", semester: "" });
    setResult(null);
    setErrors({});
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>VIT</div>
          <div>
            <div style={styles.headerTitle}>VIT</div>
            <div style={styles.headerSub}>Semester Result Calculator</div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Student Info */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Student Information</div>
          <div style={styles.infoGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Student Name</label>
              <input
                style={styles.input}
                name="name"
                placeholder="Enter name"
                value={studentInfo.name}
                onChange={handleInfo}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Registration No.</label>
              <input
                style={styles.input}
                name="regNo"
                placeholder="e.g. 22BCE1234"
                value={studentInfo.regNo}
                onChange={handleInfo}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Semester</label>
              <select style={styles.input} name="semester" value={studentInfo.semester} onChange={handleInfo}>
                <option value="">Select</option>
                {[1,2,3,4,5,6,7,8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Marks Entry */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Enter Marks <span style={styles.note}>(out of 100 each)</span></div>
          <div style={styles.marksGrid}>
            <div style={styles.marksHeader}>
              <span style={{ flex: 2 }}>Subject</span>
              <span style={{ flex: 1, textAlign: "center" }}>MSE (30%)</span>
              <span style={{ flex: 1, textAlign: "center" }}>ESE (70%)</span>
            </div>
            {SUBJECTS.map(({ code, name }) => (
              <div key={code} style={styles.marksRow}>
                <div style={{ flex: 2 }}>
                  <div style={styles.subjectCode}>{code}</div>
                  <div style={styles.subjectName}>{name}</div>
                </div>
                <div style={{ flex: 1, padding: "0 8px" }}>
                  <input
                    style={{
                      ...styles.markInput,
                      ...(errors[`${code}_mse`] ? styles.markInputError : {}),
                    }}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0–100"
                    value={marks[code].mse}
                    onChange={(e) => handleMark(code, "mse", e.target.value)}
                  />
                  {errors[`${code}_mse`] && <div style={styles.errMsg}>{errors[`${code}_mse`]}</div>}
                </div>
                <div style={{ flex: 1, padding: "0 8px" }}>
                  <input
                    style={{
                      ...styles.markInput,
                      ...(errors[`${code}_ese`] ? styles.markInputError : {}),
                    }}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0–100"
                    value={marks[code].ese}
                    onChange={(e) => handleMark(code, "ese", e.target.value)}
                  />
                  {errors[`${code}_ese`] && <div style={styles.errMsg}>{errors[`${code}_ese`]}</div>}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.gradeNote}>
            <strong>Grading:</strong>&nbsp; S(≥90,10) · A(≥80,9) · B(≥70,8) · C(≥60,7) · D(≥55,6) · E(≥50,5) · F(&lt;50,0)
          </div>

          <div style={styles.btnRow}>
            <button style={styles.btnPrimary} onClick={calculate}>Calculate Result</button>
            <button style={styles.btnSecondary} onClick={reset}>Reset</button>
          </div>
        </div>

        {/* Result Table */}
        {result && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>Result Sheet</div>

            {(studentInfo.name || studentInfo.regNo || studentInfo.semester) && (
              <div style={styles.studentMeta}>
                {studentInfo.name && <span><b>Name:</b> {studentInfo.name}</span>}
                {studentInfo.regNo && <span><b>Reg No:</b> {studentInfo.regNo}</span>}
                {studentInfo.semester && <span><b>Semester:</b> {studentInfo.semester}</span>}
              </div>
            )}

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["S.No","Code","Subject","Credits","MSE (30%)","ESE (70%)","Total (100%)","Grade","Grade Points","Status"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => (
                    <tr key={r.code} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{r.code}</td>
                      <td style={{ ...styles.td, textAlign: "left" }}>{r.name}</td>
                      <td style={styles.td}>{r.credits}</td>
                      <td style={styles.td}>{r.mse}</td>
                      <td style={styles.td}>{r.ese}</td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{r.total}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.gradeBadge, background: gradeColor(r.grade) }}>
                          {r.grade}
                        </span>
                      </td>
                      <td style={styles.td}>{r.points}</td>
                      <td style={styles.td}>
                        <span style={{ color: r.grade === "F" ? "#e53935" : "#2e7d32", fontWeight: 700 }}>
                          {r.grade === "F" ? "FAIL" : "PASS"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={styles.tfootRow}>
                    <td colSpan={3} style={{ ...styles.td, textAlign: "right", fontWeight: 700 }}>Total</td>
                    <td style={{ ...styles.td, fontWeight: 700 }}>{result.totalCredits}</td>
                    <td colSpan={3} style={styles.td}></td>
                    <td colSpan={2} style={styles.td}></td>
                    <td style={styles.td}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style={styles.summary}>
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>CGPA</div>
                <div style={styles.summaryValue}>{result.cgpa}</div>
              </div>
              <div style={styles.summaryBox}>
                <div style={styles.summaryLabel}>Total Credits</div>
                <div style={styles.summaryValue}>{result.totalCredits}</div>
              </div>
              <div style={{ ...styles.summaryBox, background: result.status === "PASS" ? "#e8f5e9" : "#ffebee" }}>
                <div style={styles.summaryLabel}>Result</div>
                <div style={{
                  ...styles.summaryValue,
                  color: result.status === "PASS" ? "#2e7d32" : "#c62828"
                }}>
                  {result.status}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        © VIT University · Semester Result System
      </div>
    </div>
  );
}

function gradeColor(g) {
  const map = { S: "#1565c0", A: "#2e7d32", B: "#558b2f", C: "#f9a825", D: "#ef6c00", E: "#e65100", F: "#c62828" };
  return map[g] || "#555";
}

const styles = {
  page: { minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif", color: "#1a1a2e" },
  header: { background: "#1a237e", color: "#fff", padding: "16px 0" },
  headerInner: { maxWidth: 900, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 16 },
  logo: { background: "#fff", color: "#1a237e", fontWeight: 900, fontSize: 22, borderRadius: 8, padding: "6px 14px", letterSpacing: 1 },
  headerTitle: { fontWeight: 700, fontSize: 20, letterSpacing: 0.5 },
  headerSub: { fontSize: 13, opacity: 0.8, marginTop: 2 },
  container: { maxWidth: 900, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: "20px 24px" },
  cardTitle: { fontWeight: 700, fontSize: 16, color: "#1a237e", marginBottom: 16, borderBottom: "2px solid #e8eaf6", paddingBottom: 8 },
  note: { fontWeight: 400, fontSize: 12, color: "#666" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { border: "1.5px solid #c5cae9", borderRadius: 6, padding: "8px 12px", fontSize: 14, outline: "none", background: "#fafafa" },
  marksGrid: { display: "flex", flexDirection: "column", gap: 0 },
  marksHeader: { display: "flex", background: "#e8eaf6", padding: "8px 12px", borderRadius: "6px 6px 0 0", fontWeight: 700, fontSize: 12, color: "#3949ab", textTransform: "uppercase", letterSpacing: 0.5 },
  marksRow: { display: "flex", alignItems: "center", padding: "10px 12px", borderBottom: "1px solid #f0f0f0", background: "#fff" },
  subjectCode: { fontWeight: 700, fontSize: 13, color: "#3949ab" },
  subjectName: { fontSize: 12, color: "#666", marginTop: 2 },
  markInput: { width: "100%", border: "1.5px solid #c5cae9", borderRadius: 6, padding: "7px 10px", fontSize: 14, textAlign: "center", outline: "none", boxSizing: "border-box" },
  markInputError: { borderColor: "#e53935", background: "#fff8f8" },
  errMsg: { fontSize: 11, color: "#e53935", marginTop: 3, textAlign: "center" },
  gradeNote: { fontSize: 12, color: "#666", marginTop: 12, padding: "8px 12px", background: "#f5f5f5", borderRadius: 6 },
  btnRow: { display: "flex", gap: 12, marginTop: 16 },
  btnPrimary: { background: "#1a237e", color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  btnSecondary: { background: "#fff", color: "#1a237e", border: "2px solid #1a237e", borderRadius: 6, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  studentMeta: { display: "flex", gap: 24, flexWrap: "wrap", fontSize: 14, color: "#333", marginBottom: 14, padding: "10px 12px", background: "#f5f5f5", borderRadius: 6 },
  tableWrap: { width: "100%", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 700 },
  th: { background: "#283593", color: "#fff", padding: "10px 12px", textAlign: "center", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", borderRight: "1px solid #3949ab" },
  td: { padding: "9px 12px", textAlign: "center", borderBottom: "1px solid #e8eaf6", whiteSpace: "nowrap" },
  trEven: { background: "#fff" },
  trOdd: { background: "#f5f7ff" },
  tfootRow: { background: "#e8eaf6", fontWeight: 700 },
  gradeBadge: { color: "#fff", padding: "2px 10px", borderRadius: 12, fontWeight: 700, fontSize: 13 },
  summary: { display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" },
  summaryBox: { flex: 1, minWidth: 120, background: "#f0f4f8", borderRadius: 8, padding: "14px 20px", textAlign: "center" },
  summaryLabel: { fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 },
  summaryValue: { fontSize: 26, fontWeight: 800, color: "#1a237e", marginTop: 4 },
  footer: { textAlign: "center", padding: "20px", fontSize: 12, color: "#999", borderTop: "1px solid #e0e0e0", marginTop: 8 },
};
