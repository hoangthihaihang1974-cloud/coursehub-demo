import { useEffect, useState } from "react";
import { api } from "../api.js";
import Notice from "./Notice.jsx";
const LIMIT = 10;
export default function EventHistory({ studentId, refresh, busy }) {
  const [skip, setSkip] = useState(0);
  const [type, setType] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    const params = new URLSearchParams({ student_id: studentId, skip, limit: LIMIT });
    if (type) params.set("event_type", type);
    api(`/enrollment-events?${params}`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setRows(data); })
      .catch(err => { if (!controller.signal.aborted) { setError(err.message); setRows([]); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [studentId, refresh, skip, type]);
  return <section className="panel">
    <h2>4. Lịch sử đăng ký</h2>
    <label htmlFor="event-type">Loại sự kiện </label>
    <select id="event-type" value={type} disabled={busy} onChange={e => { setType(e.target.value); setSkip(0); setLoading(true); }}>
      <option value="">Tất cả</option><option value="CREATED">Đăng ký</option><option value="CANCELLED">Hủy đăng ký</option>
    </select>
    {loading ? <Notice>Đang tải lịch sử...</Notice> : error ? <Notice kind="error">{error}</Notice> :
      !rows.length ? <p>Không có sự kiện ở trang này.</p> :
      <ul className="enrollments">{rows.map(row => <li key={row.id}>
        <strong>{row.class_section_id}</strong> · {row.event_type === "CREATED" ? "Đăng ký" : "Hủy đăng ký"}
        <span className="subtext">{row.occurred_at.replace("T", " ")}</span>
      </li>)}</ul>}
    <div className="pagination">
      <button type="button" disabled={busy || loading || skip === 0} onClick={() => { setSkip(v => Math.max(0, v - LIMIT)); setLoading(true); }}>Trang trước</button>
      <span>Trang {skip / LIMIT + 1}</span>
      <button type="button" disabled={busy || loading || !!error || rows.length < LIMIT} onClick={() => { setSkip(v => v + LIMIT); setLoading(true); }}>Trang sau</button>
    </div>
    <p className="muted">Chỉ nhật ký demo; phân trang tại PostgreSQL, tối đa 10 sự kiện mỗi lần.</p>
  </section>;
}
