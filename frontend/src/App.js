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

  const saveResult = async () => {
    if (!result) return;
    try {
      const response = await fetch('http://localhost:8000/api/save/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: studentInfo,
          marks: marks,
        }),
      });
      const data = await response.json();
      alert(data.message || 'Saved successfully');
    } catch (error) {
      alert('Error saving result');
    }
  };

  const styles = {
    page: { fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' },
    header: { backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' },
    headerInner: { display: 'flex', alignItems: 'center', gap: '20px' },
    logo: { fontSize: '2em', fontWeight: 'bold', color: '#007bff' },
    headerTitle: { fontSize: '1.5em', fontWeight: 'bold' },
    headerSub: { fontSize: '1em', color: '#666' },
    container: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    cardTitle: { fontSize: '1.2em', fontWeight: 'bold', marginBottom: '15px' },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
    field: { display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '5px', fontWeight: 'bold' },
    input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
    subjectsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' },
    subjectCard: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px' },
    subjectTitle: { fontWeight: 'bold', marginBottom: '10px' },
    markFields: { display: 'flex', gap: '10px' },
    markField: { flex: 1 },
    buttons: { display: 'flex', gap: '10px', marginTop: '20px' },
    button: { padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    calculateBtn: { backgroundColor: '#28a745', color: 'white' },
    resetBtn: { backgroundColor: '#6c757d', color: 'white' },
    saveBtn: { backgroundColor: '#007bff', color: 'white' },
    resultTable: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    th: { backgroundColor: '#f8f9fa', padding: '10px', textAlign: 'left', border: '1px solid #ddd' },
    td: { padding: '10px', border: '1px solid #ddd' },
    summary: { marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' },
    error: { color: 'red', fontSize: '0.9em', marginTop: '5px' },
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

        {/* Subjects */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Subject Marks</div>
          <div style={styles.subjectsGrid}>
            {SUBJECTS.map(({ code, name }) => (
              <div key={code} style={styles.subjectCard}>
                <div style={styles.subjectTitle}>{code} - {name}</div>
                <div style={styles.markFields}>
                  <div style={styles.markField}>
                    <label style={styles.label}>MSE</label>
                    <input
                      style={styles.input}
                      type="number"
                      placeholder="0-100"
                      value={marks[code].mse}
                      onChange={(e) => handleMark(code, 'mse', e.target.value)}
                    />
                    {errors[`${code}_mse`] && <div style={styles.error}>{errors[`${code}_mse`]}</div>}
                  </div>
                  <div style={styles.markField}>
                    <label style={styles.label}>ESE</label>
                    <input
                      style={styles.input}
                      type="number"
                      placeholder="0-100"
                      value={marks[code].ese}
                      onChange={(e) => handleMark(code, 'ese', e.target.value)}
                    />
                    {errors[`${code}_ese`] && <div style={styles.error}>{errors[`${code}_ese`]}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.buttons}>
          <button style={{...styles.button, ...styles.calculateBtn}} onClick={calculate}>Calculate</button>
          <button style={{...styles.button, ...styles.resetBtn}} onClick={reset}>Reset</button>
          <button style={{...styles.button, ...styles.saveBtn}} onClick={saveResult}>Save Result</button>
        </div>

        {/* Result */}
        {result && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>Result</div>
            <table style={styles.resultTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>MSE</th>
                  <th style={styles.th}>ESE</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Grade</th>
                  <th style={styles.th}>Points</th>
                  <th style={styles.th}>Credits</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{r.code} - {r.name}</td>
                    <td style={styles.td}>{r.mse}</td>
                    <td style={styles.td}>{r.ese}</td>
                    <td style={styles.td}>{r.total}</td>
                    <td style={styles.td}>{r.grade}</td>
                    <td style={styles.td}>{r.points}</td>
                    <td style={styles.td}>{r.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.summary}>
              <div><strong>CGPA:</strong> {result.cgpa}</div>
              <div><strong>Status:</strong> {result.status}</div>
              <div><strong>Total Credits:</strong> {result.totalCredits}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
