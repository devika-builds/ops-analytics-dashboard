import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ====================================================================
// HERITAGE SILVER — shared palette across the portfolio
// ====================================================================
const COLORS = {
  background:   "#E4EAF0",
  cardBg:       "#FAFBFD",
  cardBgMuted:  "#EEF1F5",
  text:         "#2A3547",
  textSecondary:"#566175",
  textTertiary: "#7F8A9C",
  borderColor:  "rgba(42, 53, 71, 0.14)",
  borderStrong: "rgba(42, 53, 71, 0.32)",
  borderSoft:   "rgba(42, 53, 71, 0.08)",
  accent:       "#6B7FAB",
  accentDim:    "rgba(107, 127, 171, 0.18)",
  accentSoft:   "rgba(107, 127, 171, 0.10)",
  critical:     "#E6D4E1",
  criticalBorder:"rgba(140, 94, 127, 0.55)",
  criticalText: "#8C5E7F",
  sage:         "#B5C3DA",
  sageBorder:   "rgba(74, 106, 148, 0.55)",
  slateBlue:    "#C4CDE3",
  slateBlueBorder:"rgba(107, 127, 171, 0.55)",
  success:      "#B5C3DA",
  successBg:    "rgba(181, 195, 218, 0.45)",
  successText:  "#2F4B6E",
  warning:      "#6B7FAB",
  warningBg:    "rgba(107, 127, 171, 0.18)",
  warningText:  "#54678F",
  error:        "#8C5E7F",
};

const FONT = "'Inter', 'Geist', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
const MONO = "'JetBrains Mono', 'Geist Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

// Chart colors — cool register, no greens/oranges
const CHART_COLORS = ["#6B7FAB", "#8C5E7F", "#B5C3DA", "#C4CDE3", "#4A6A94", "#A88CA0"];

// ====================================================================
// SAMPLE DATA — 4 weeks of realistic operational data
// ====================================================================
function generateSampleData() {
  const weeks = [];
  const startDate = new Date(2026, 4, 4); // May 4, 2026 (Mon)

  for (let w = 0; w < 4; w++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + w * 7);
    const days = [];

    for (let d = 0; d < 5; d++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + d);
      const dayName = ["Mon", "Tue", "Wed", "Thu", "Fri"][d];
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

      // Email data — varies by day-of-week pattern
      const baseEmails = [42, 38, 55, 48, 31][d];
      const emailVariance = Math.round((Math.sin(w * 2.1 + d * 0.7) * 12) + (w === 2 ? 15 : 0));
      const totalEmails = baseEmails + emailVariance;

      // Hourly email distribution (9am-5pm)
      const hourly = [];
      for (let h = 9; h <= 17; h++) {
        const peak = h === 10 || h === 14 ? 1.8 : h === 9 || h === 11 ? 1.3 : h === 17 ? 0.5 : 1;
        hourly.push({ hour: h, label: `${h > 12 ? h - 12 : h}${h >= 12 ? "pm" : "am"}`, count: Math.round((totalEmails / 9) * peak * (0.8 + Math.random() * 0.4)) });
      }

      // Email categories
      const categories = [
        { name: "Client comms", count: Math.round(totalEmails * 0.32), color: CHART_COLORS[0] },
        { name: "Internal ops", count: Math.round(totalEmails * 0.25), color: CHART_COLORS[1] },
        { name: "Scheduling", count: Math.round(totalEmails * 0.2), color: CHART_COLORS[2] },
        { name: "Vendor mgmt", count: Math.round(totalEmails * 0.13), color: CHART_COLORS[3] },
        { name: "Other", count: Math.round(totalEmails * 0.1), color: CHART_COLORS[4] },
      ];

      // Response time (minutes)
      const baseResponse = [18, 22, 15, 20, 25][d];
      const responseTime = baseResponse + Math.round(Math.sin(w * 1.5 + d) * 5) + (w === 2 ? 8 : 0);

      // Task data
      const baseTasks = [12, 10, 14, 11, 8][d];
      const taskVariance = Math.round(Math.sin(w * 1.8 + d * 1.1) * 3);
      const totalTasks = baseTasks + taskVariance + (w === 1 ? 3 : 0);
      const completedTasks = Math.round(totalTasks * (0.72 + Math.sin(w + d * 0.5) * 0.12));
      const overdueTasks = Math.max(0, Math.round(totalTasks * 0.08 + (w === 2 ? 2 : 0)));

      // Calendar data
      const baseMeetings = [6, 5, 7, 6, 4][d];
      const meetingVariance = Math.round(Math.sin(w * 2.3 + d * 0.9) * 1.5);
      const meetings = Math.max(2, baseMeetings + meetingVariance + (w === 3 ? 2 : 0));
      const meetingHours = Math.round(meetings * 0.75 * 10) / 10;
      const focusHours = Math.round((8 - meetingHours) * 10) / 10;

      // Time allocation (hours)
      const timeAlloc = [
        { name: "Exec support", hours: +(2.5 + Math.sin(w + d) * 0.8).toFixed(1), color: CHART_COLORS[0] },
        { name: "Project mgmt", hours: +(1.8 + Math.sin(w * 1.3 + d) * 0.5).toFixed(1), color: CHART_COLORS[1] },
        { name: "Communications", hours: +(1.5 + Math.sin(w * 0.7 + d) * 0.4).toFixed(1), color: CHART_COLORS[2] },
        { name: "Admin/ops", hours: +(1.2 + Math.sin(w * 1.9 + d) * 0.3).toFixed(1), color: CHART_COLORS[3] },
        { name: "Strategic work", hours: +(0.8 + Math.sin(w * 2.1 + d) * 0.4).toFixed(1), color: CHART_COLORS[4] },
      ];

      days.push({
        day: dayName, date: dateStr, fullDate: date.toISOString().slice(0, 10),
        emails: { total: totalEmails, hourly, categories, responseTime },
        tasks: { total: totalTasks, completed: completedTasks, pending: totalTasks - completedTasks - overdueTasks, overdue: overdueTasks, completionRate: Math.round((completedTasks / totalTasks) * 100) },
        calendar: { meetings, meetingHours, focusHours, utilization: Math.round((meetingHours / 8) * 100) },
        time: { allocation: timeAlloc, totalTracked: timeAlloc.reduce((s, t) => s + t.hours, 0) },
      });
    }
    weeks.push({ weekNum: w + 1, label: `Week ${w + 1}`, startDate: weekStart.toISOString().slice(0, 10), days });
  }
  return weeks;
}

const SAMPLE_DATA = generateSampleData();

// ====================================================================
// HELPERS
// ====================================================================
function aggregateWeek(week) {
  const d = week.days;
  const totalEmails = d.reduce((s, x) => s + x.emails.total, 0);
  const avgResponse = Math.round(d.reduce((s, x) => s + x.emails.responseTime, 0) / d.length);
  const totalTasks = d.reduce((s, x) => s + x.tasks.total, 0);
  const completedTasks = d.reduce((s, x) => s + x.tasks.completed, 0);
  const overdueTasks = d.reduce((s, x) => s + x.tasks.overdue, 0);
  const totalMeetings = d.reduce((s, x) => s + x.calendar.meetings, 0);
  const avgFocus = +(d.reduce((s, x) => s + x.calendar.focusHours, 0) / d.length).toFixed(1);
  const avgUtil = Math.round(d.reduce((s, x) => s + x.calendar.utilization, 0) / d.length);

  // Aggregate email categories
  const catMap = {};
  d.forEach(day => day.emails.categories.forEach(c => { catMap[c.name] = (catMap[c.name] || 0) + c.count; }));
  const categories = Object.entries(catMap).map(([name, count]) => ({ name, count, color: d[0].emails.categories.find(c => c.name === name)?.color || CHART_COLORS[0] }));

  // Aggregate time allocation
  const timeMap = {};
  d.forEach(day => day.time.allocation.forEach(t => { timeMap[t.name] = (timeMap[t.name] || 0) + t.hours; }));
  const timeAlloc = Object.entries(timeMap).map(([name, hours]) => ({ name, hours: +hours.toFixed(1), color: d[0].time.allocation.find(t => t.name === name)?.color || CHART_COLORS[0] }));

  return { totalEmails, avgResponse, totalTasks, completedTasks, overdueTasks, completionRate: Math.round((completedTasks / totalTasks) * 100), totalMeetings, avgFocus, avgUtil, categories, timeAlloc };
}

function detectInsights(currentWeek, prevWeek) {
  const curr = aggregateWeek(currentWeek);
  const prev = prevWeek ? aggregateWeek(prevWeek) : null;
  const insights = [];

  // Email volume insights
  const peakDay = currentWeek.days.reduce((best, d) => d.emails.total > best.emails.total ? d : best);
  insights.push({ type: "pattern", category: "email", icon: "✉", title: `Peak email day: ${peakDay.day}`, body: `${peakDay.emails.total} emails on ${peakDay.day} (${peakDay.date}) — ${Math.round((peakDay.emails.total / curr.totalEmails) * 100)}% of weekly volume.` });

  // Peak hours
  const allHourly = {};
  currentWeek.days.forEach(d => d.emails.hourly.forEach(h => { allHourly[h.label] = (allHourly[h.label] || 0) + h.count; }));
  const peakHour = Object.entries(allHourly).sort((a, b) => b[1] - a[1])[0];
  insights.push({ type: "pattern", category: "email", icon: "⏰", title: `Email peak at ${peakHour[0]}`, body: `${Math.round((peakHour[1] / curr.totalEmails) * 100)}% of emails arrive around ${peakHour[0]}. Consider batching responses outside this window.` });

  // Response time trend
  if (prev) {
    const delta = curr.avgResponse - prev.avgResponse;
    const dir = delta > 0 ? "up" : "down";
    const pct = Math.abs(Math.round((delta / prev.avgResponse) * 100));
    if (pct >= 5) {
      insights.push({ type: delta > 3 ? "anomaly" : "trend", category: "email", icon: delta > 0 ? "⚠" : "✅", title: `Response time ${dir} ${pct}%`, body: `Average response time is ${curr.avgResponse} min (was ${prev.avgResponse} min). ${delta > 3 ? "This may indicate inbox overload." : "Improvement over last week."}` });
    }
  }

  // Task completion
  const lowDay = currentWeek.days.reduce((w, d) => d.tasks.completionRate < w.tasks.completionRate ? d : w);
  if (lowDay.tasks.completionRate < 65) {
    insights.push({ type: "anomaly", category: "tasks", icon: "⚠", title: `Low completion on ${lowDay.day}`, body: `Only ${lowDay.tasks.completionRate}% task completion on ${lowDay.day} (${lowDay.date}). ${lowDay.tasks.overdue} tasks overdue.` });
  }

  // Task completion trend
  const peakTaskDay = currentWeek.days.reduce((b, d) => d.tasks.completionRate > b.tasks.completionRate ? d : b);
  insights.push({ type: "pattern", category: "tasks", icon: "✅", title: `Best completion: ${peakTaskDay.day}`, body: `${peakTaskDay.tasks.completionRate}% completion on ${peakTaskDay.day} with ${peakTaskDay.tasks.completed}/${peakTaskDay.tasks.total} tasks done.` });

  // Calendar utilization
  const heavyDay = currentWeek.days.reduce((b, d) => d.calendar.utilization > b.calendar.utilization ? d : b);
  if (heavyDay.calendar.utilization > 65) {
    insights.push({ type: "anomaly", category: "calendar", icon: "📅", title: `Heavy meeting load: ${heavyDay.day}`, body: `${heavyDay.calendar.utilization}% calendar utilization on ${heavyDay.day} — only ${heavyDay.calendar.focusHours}h of focus time. Consider declining or delegating.` });
  }

  // Focus time
  insights.push({ type: "pattern", category: "calendar", icon: "🎯", title: `${curr.avgFocus}h avg focus/day`, body: `Across the week, you averaged ${curr.avgFocus} hours of uninterrupted focus per day. ${curr.avgFocus < 3 ? "Below the 3h minimum for deep work." : "On track for sustained output."}` });

  // Time allocation insight
  const topTime = curr.timeAlloc.sort((a, b) => b.hours - a.hours)[0];
  insights.push({ type: "pattern", category: "time", icon: "⏱", title: `${topTime.name}: ${topTime.hours}h this week`, body: `${topTime.name} consumed the largest share of tracked time. ${topTime.hours > 15 ? "Consider if this aligns with your priorities." : "Allocation looks balanced."}` });

  if (prev) {
    const prevTop = aggregateWeek(prevWeek).timeAlloc.sort((a, b) => b.hours - a.hours)[0];
    if (prevTop.name !== topTime.name) {
      insights.push({ type: "trend", category: "time", icon: "🔄", title: "Time allocation shifted", body: `Top category shifted from ${prevTop.name} (${prevTop.hours}h) to ${topTime.name} (${topTime.hours}h). Worth reviewing whether this was intentional.` });
    }
  }

  return insights;
}

// ====================================================================
// REUSABLE COMPONENTS
// ====================================================================
function Card({ children, pad = 20, style = {} }) {
  return (
    <div style={{ background: COLORS.cardBg, borderRadius: 12, border: `1px solid ${COLORS.borderColor}`, padding: pad, ...style }}>
      {children}
    </div>
  );
}

function Kicker({ text }) {
  return (
    <div style={{ fontSize: 11, color: COLORS.textSecondary, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
      {text}
    </div>
  );
}

function TrendIndicator({ current, previous, suffix = "", invert = false }) {
  if (previous == null) return null;
  const delta = current - previous;
  const pct = Math.abs(Math.round((delta / previous) * 100));
  if (pct < 1) return <span style={{ fontSize: 12, color: COLORS.textTertiary, fontFamily: MONO }}>→ flat</span>;
  const isUp = delta > 0;
  const isGood = invert ? !isUp : isUp;
  return (
    <span style={{ fontSize: 12, fontFamily: MONO, fontWeight: 600, color: isGood ? COLORS.successText : COLORS.criticalText }}>
      {isUp ? "↑" : "↓"} {pct}%{suffix}
    </span>
  );
}

function KPICard({ label, value, suffix = "", trend, trendInvert = false, icon }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Kicker text={label} />
        <span style={{ fontSize: 18 }} aria-hidden="true">{icon}</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 36, fontWeight: 800, color: COLORS.text, lineHeight: 1, letterSpacing: -1, marginTop: 4 }}>
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      {trend != null && (
        <div style={{ marginTop: 6 }}>
          <TrendIndicator current={value} previous={trend} invert={trendInvert} />
        </div>
      )}
    </Card>
  );
}

function TabBar({ tabs, active, setActive }) {
  return (
    <div role="tablist" style={{ display: "flex", gap: 4, background: COLORS.cardBgMuted, borderRadius: 10, padding: 4, marginBottom: 24 }}>
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActive(t.id)}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: FONT, fontSize: 13, fontWeight: 600, letterSpacing: 0.2,
              background: isActive ? COLORS.cardBg : "transparent",
              color: isActive ? COLORS.text : COLORS.textSecondary,
              boxShadow: isActive ? "0 1px 3px rgba(42,53,71,0.08)" : "none",
              transition: "all 150ms ease",
            }}
          >
            {t.icon} {t.label}
          </button>
        );
      })}
    </div>
  );
}

function WeekSelector({ weeks, activeWeek, setActiveWeek }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {weeks.map((w, i) => (
        <button
          key={i}
          onClick={() => setActiveWeek(i)}
          style={{
            padding: "8px 14px", borderRadius: 8, border: `1px solid ${i === activeWeek ? COLORS.accent : COLORS.borderColor}`,
            background: i === activeWeek ? COLORS.accentDim : COLORS.cardBg,
            color: i === activeWeek ? COLORS.accent : COLORS.textSecondary,
            fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 150ms ease",
          }}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}

function InsightCard({ insight }) {
  const bgMap = { anomaly: "rgba(140, 94, 127, 0.08)", trend: COLORS.accentSoft, pattern: COLORS.cardBgMuted };
  const borderMap = { anomaly: COLORS.criticalBorder, trend: COLORS.slateBlueBorder, pattern: COLORS.borderColor };
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 10, border: `1px solid ${borderMap[insight.type]}`,
      background: bgMap[insight.type], display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 20, lineHeight: 1 }}>{insight.icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 3 }}>{insight.title}</div>
        <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>{insight.body}</div>
      </div>
    </div>
  );
}

// Custom Recharts tooltip
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: COLORS.cardBg, border: `1px solid ${COLORS.borderColor}`, borderRadius: 8,
      padding: "10px 14px", boxShadow: "0 4px 12px rgba(42,53,71,0.12)", fontFamily: FONT,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, color: COLORS.textSecondary, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
          {p.name}: <span style={{ fontWeight: 600, color: COLORS.text, fontFamily: MONO }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ====================================================================
// DASHBOARD TABS
// ====================================================================

// --- EMAIL TAB ---
function EmailTab({ week, prevWeek }) {
  const agg = aggregateWeek(week);
  const prev = prevWeek ? aggregateWeek(prevWeek) : null;

  // Daily email volume for chart
  const dailyData = week.days.map(d => ({ name: d.day, emails: d.emails.total, response: d.emails.responseTime }));

  // Aggregate hourly across the week
  const hourlyMap = {};
  week.days.forEach(d => d.emails.hourly.forEach(h => { hourlyMap[h.label] = (hourlyMap[h.label] || 0) + h.count; }));
  const hourlyData = Object.entries(hourlyMap).map(([label, count]) => ({ name: label, emails: count }));

  return (
    <div>
      <div className="oad-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard label="Total emails" value={agg.totalEmails} trend={prev?.totalEmails} icon={"✉"} />
        <KPICard label="Avg response" value={agg.avgResponse} suffix="m" trend={prev?.avgResponse} trendInvert={true} icon={"⏱"} />
        <KPICard label="Client comms" value={agg.categories.find(c => c.name === "Client comms")?.count || 0} icon={"💼"} />
        <KPICard label="Daily avg" value={Math.round(agg.totalEmails / 5)} trend={prev ? Math.round(prev.totalEmails / 5) : null} icon={"📊"} />
      </div>

      <div className="oad-chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <Kicker text="Email volume by day" />
          <div style={{ height: 220, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderColor} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.textSecondary, fontFamily: FONT }} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.textTertiary, fontFamily: MONO }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="emails" fill={COLORS.accent} radius={[4, 4, 0, 0]} name="Emails" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Kicker text="Hourly distribution (week)" />
          <div style={{ height: 220, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderColor} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.textSecondary, fontFamily: FONT }} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.textTertiary, fontFamily: MONO }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="emails" stroke={COLORS.accent} fill={COLORS.accentDim} strokeWidth={2} name="Emails" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="oad-chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <Kicker text="Response time trend" />
          <div style={{ height: 200, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderColor} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.textSecondary, fontFamily: FONT }} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.textTertiary, fontFamily: MONO }} unit="m" />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="response" stroke={COLORS.criticalText} strokeWidth={2} dot={{ r: 4, fill: COLORS.cardBg, stroke: COLORS.criticalText, strokeWidth: 2 }} name="Avg response (min)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Kicker text="Email categories" />
          <div style={{ height: 200, marginTop: 12, display: "flex", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={agg.categories} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} strokeWidth={2} stroke={COLORS.cardBg}>
                  {agg.categories.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: FONT }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

// --- TASKS TAB ---
function TasksTab({ week, prevWeek }) {
  const agg = aggregateWeek(week);
  const prev = prevWeek ? aggregateWeek(prevWeek) : null;

  const dailyData = week.days.map(d => ({
    name: d.day, completed: d.tasks.completed, pending: d.tasks.pending, overdue: d.tasks.overdue, rate: d.tasks.completionRate,
  }));

  return (
    <div>
      <div className="oad-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard label="Total tasks" value={agg.totalTasks} trend={prev?.totalTasks} icon={"☑"} />
        <KPICard label="Completed" value={agg.completedTasks} trend={prev?.completedTasks} icon={"✅"} />
        <KPICard label="Completion rate" value={agg.completionRate} suffix="%" trend={prev?.completionRate} icon={"🎯"} />
        <KPICard label="Overdue" value={agg.overdueTasks} trend={prev?.overdueTasks} trendInvert={true} icon={"⚠"} />
      </div>

      <div className="oad-chart-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <Card>
          <Kicker text="Task breakdown by day" />
          <div style={{ height: 240, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderColor} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.textSecondary, fontFamily: FONT }} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.textTertiary, fontFamily: MONO }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="completed" stackId="a" fill={COLORS.accent} name="Completed" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" stackId="a" fill={COLORS.slateBlue} name="Pending" radius={[0, 0, 0, 0]} />
                <Bar dataKey="overdue" stackId="a" fill={COLORS.criticalText} name="Overdue" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: FONT }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Kicker text="Completion rate trend" />
          <div style={{ height: 240, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderColor} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.textSecondary, fontFamily: FONT }} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.textTertiary, fontFamily: MONO }} unit="%" domain={[40, 100]} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="rate" stroke={COLORS.accent} strokeWidth={2.5} dot={{ r: 5, fill: COLORS.cardBg, stroke: COLORS.accent, strokeWidth: 2 }} name="Completion %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

// --- CALENDAR TAB ---
function CalendarTab({ week, prevWeek }) {
  const agg = aggregateWeek(week);
  const prev = prevWeek ? aggregateWeek(prevWeek) : null;

  const dailyData = week.days.map(d => ({
    name: d.day, meetings: d.calendar.meetings, focus: d.calendar.focusHours, utilization: d.calendar.utilization,
  }));

  // Heatmap-style grid
  const hours = Array.from({ length: 9 }, (_, i) => i + 9);

  return (
    <div>
      <div className="oad-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard label="Total meetings" value={agg.totalMeetings} trend={prev?.totalMeetings} trendInvert={true} icon={"📅"} />
        <KPICard label="Avg utilization" value={agg.avgUtil} suffix="%" trend={prev?.avgUtil} trendInvert={true} icon={"⏰"} />
        <KPICard label="Avg focus/day" value={agg.avgFocus} suffix="h" trend={prev?.avgFocus} icon={"🎯"} />
        <KPICard label="Meeting hours" value={Math.round(week.days.reduce((s, d) => s + d.calendar.meetingHours, 0))} suffix="h" icon={"⌚"} />
      </div>

      <div className="oad-chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <Kicker text="Meetings vs Focus time" />
          <div style={{ height: 240, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderColor} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.textSecondary, fontFamily: FONT }} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.textTertiary, fontFamily: MONO }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="meetings" fill={COLORS.criticalText} name="Meetings" radius={[4, 4, 0, 0]} />
                <Bar dataKey="focus" fill={COLORS.sage} name="Focus hours" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: FONT }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Kicker text="Calendar utilization %" />
          <div style={{ height: 240, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderColor} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.textSecondary, fontFamily: FONT }} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.textTertiary, fontFamily: MONO }} unit="%" domain={[0, 100]} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="utilization" stroke={COLORS.accent} fill={COLORS.accentDim} strokeWidth={2} name="Utilization %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Calendar heatmap */}
      <Card>
        <Kicker text="Weekly heatmap — meeting density by hour" />
        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${hours.length}, 1fr)`, gap: 3 }}>
            <div />
            {hours.map(h => (
              <div key={h} style={{ fontSize: 10, fontFamily: MONO, color: COLORS.textTertiary, textAlign: "center", padding: "4px 0" }}>
                {h > 12 ? h - 12 : h}{h >= 12 ? "p" : "a"}
              </div>
            ))}
            {week.days.map(d => (
              <React.Fragment key={d.day}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "flex", alignItems: "center", fontFamily: FONT }}>{d.day}</div>
                {hours.map(h => {
                  const hourData = d.emails.hourly.find(hd => {
                    const hourNum = parseInt(hd.label);
                    const isPm = hd.label.includes("pm");
                    const h24 = isPm && hourNum !== 12 ? hourNum + 12 : (!isPm && hourNum === 12 ? 0 : hourNum);
                    return h24 === h;
                  });
                  const intensity = hourData ? Math.min(1, hourData.count / 15) : 0;
                  // Use meeting-adjacent proxy — higher email = likely busier hour
                  const meetingProb = d.calendar.meetings > 5 ? 0.7 : d.calendar.meetings > 3 ? 0.5 : 0.3;
                  const heat = Math.min(1, intensity * 0.6 + meetingProb * 0.4 * (h >= 10 && h <= 15 ? 1 : 0.3));
                  return (
                    <div key={h} style={{
                      height: 28, borderRadius: 4,
                      background: heat > 0.6 ? COLORS.criticalText : heat > 0.35 ? COLORS.accent : heat > 0.15 ? COLORS.slateBlue : COLORS.cardBgMuted,
                      opacity: 0.3 + heat * 0.7,
                      transition: "background 200ms ease",
                    }} title={`${d.day} ${h}:00 — activity: ${Math.round(heat * 100)}%`} />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 11, color: COLORS.textTertiary, fontFamily: FONT }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS.cardBgMuted }} /> Low</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS.slateBlue }} /> Medium</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS.accent }} /> High</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS.criticalText }} /> Peak</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// --- TIME TAB ---
function TimeTab({ week, prevWeek }) {
  const agg = aggregateWeek(week);
  const prev = prevWeek ? aggregateWeek(prevWeek) : null;
  const totalHours = agg.timeAlloc.reduce((s, t) => s + t.hours, 0);

  const dailyData = week.days.map(d => {
    const obj = { name: d.day };
    d.time.allocation.forEach(t => { obj[t.name] = t.hours; });
    return obj;
  });

  return (
    <div>
      <div className="oad-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard label="Total tracked" value={Math.round(totalHours)} suffix="h" icon={"⏱"} />
        <KPICard label="Exec support" value={Math.round(agg.timeAlloc.find(t => t.name === "Exec support")?.hours || 0)} suffix="h" icon={"👑"} />
        <KPICard label="Strategic work" value={+(agg.timeAlloc.find(t => t.name === "Strategic work")?.hours || 0).toFixed(1)} suffix="h" icon={"🧠"} />
        <KPICard label="Utilization" value={Math.round((totalHours / 40) * 100)} suffix="%" icon={"📊"} />
      </div>

      <div className="oad-chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <Kicker text="Time allocation breakdown" />
          <div style={{ height: 260, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={agg.timeAlloc} dataKey="hours" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} strokeWidth={2} stroke={COLORS.cardBg}>
                  {agg.timeAlloc.map((t, i) => <Cell key={i} fill={t.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: FONT }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Kicker text="Daily allocation stacked" />
          <div style={{ height: 260, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderColor} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: COLORS.textSecondary, fontFamily: FONT }} />
                <YAxis tick={{ fontSize: 11, fill: COLORS.textTertiary, fontFamily: MONO }} unit="h" />
                <Tooltip content={<ChartTooltip />} />
                {agg.timeAlloc.map((t, i) => (
                  <Bar key={t.name} dataKey={t.name} stackId="time" fill={t.color} name={t.name} radius={i === agg.timeAlloc.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                ))}
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: FONT }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Category breakdown cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {agg.timeAlloc.sort((a, b) => b.hours - a.hours).map((t) => {
          const pct = Math.round((t.hours / totalHours) * 100);
          return (
            <Card key={t.name} pad={14}>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 6 }}>{t.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 800, color: COLORS.text }}>{t.hours}h</div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: COLORS.cardBgMuted, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: t.color, borderRadius: 2, transition: "width 500ms ease" }} />
              </div>
              <div style={{ fontSize: 11, color: COLORS.textTertiary, marginTop: 4, fontFamily: MONO }}>{pct}% of week</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// --- INSIGHTS TAB ---
function InsightsTab({ week, prevWeek }) {
  const insights = detectInsights(week, prevWeek);
  const categories = ["all", "email", "tasks", "calendar", "time"];
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? insights : insights.filter(i => i.category === filter);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: "6px 14px", borderRadius: 20, border: `1px solid ${c === filter ? COLORS.accent : COLORS.borderColor}`,
            background: c === filter ? COLORS.accentDim : "transparent",
            color: c === filter ? COLORS.accent : COLORS.textSecondary,
            fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((insight, i) => <InsightCard key={i} insight={insight} />)}
        {filtered.length === 0 && (
          <Card pad={40} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 15, color: COLORS.textSecondary }}>No insights for this category this week.</div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ====================================================================
// DASHBOARD DEMO (inner component — rendered inside the demo frame)
// ====================================================================
function DashboardDemo() {
  const [activeWeek, setActiveWeek] = useState(3);
  const [activeTab, setActiveTab] = useState("email");

  const week = SAMPLE_DATA[activeWeek];
  const prevWeek = activeWeek > 0 ? SAMPLE_DATA[activeWeek - 1] : null;

  const tabs = [
    { id: "email", label: "Email", icon: "✉" },
    { id: "tasks", label: "Tasks", icon: "☑" },
    { id: "calendar", label: "Calendar", icon: "📅" },
    { id: "time", label: "Time", icon: "⏱" },
    { id: "insights", label: "Insights", icon: "💡" },
  ];

  return (
    <div style={{ fontFamily: FONT, color: COLORS.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>Operations Dashboard</div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>{week.label} — May {4 + activeWeek * 7}–{8 + activeWeek * 7}, 2026</div>
        </div>
        <WeekSelector weeks={SAMPLE_DATA} activeWeek={activeWeek} setActiveWeek={setActiveWeek} />
      </div>

      <TabBar tabs={tabs} active={activeTab} setActive={setActiveTab} />

      {activeTab === "email" && <EmailTab week={week} prevWeek={prevWeek} />}
      {activeTab === "tasks" && <TasksTab week={week} prevWeek={prevWeek} />}
      {activeTab === "calendar" && <CalendarTab week={week} prevWeek={prevWeek} />}
      {activeTab === "time" && <TimeTab week={week} prevWeek={prevWeek} />}
      {activeTab === "insights" && <InsightsTab week={week} prevWeek={prevWeek} />}
    </div>
  );
}

// ====================================================================
// PORTFOLIO SHELL — matches Schedule Conflict Resolver / EA Control Center / Zapier Visualizer
// ====================================================================
const SHELL = { maxW: 1200 };

function AnimatedCounter({ value, suffix = "", duration = 1400 }) {
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || done) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setDisplay(value); setDone(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !done) {
          setDone(true);
          const start = performance.now();
          const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(Math.floor(value * eased));
            if (t < 1) requestAnimationFrame(tick);
            else setDisplay(value);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    if (counterRef.current) io.observe(counterRef.current);
    return () => io.disconnect();
  }, [value, duration, done]);

  return <span ref={counterRef}>{display}{suffix}</span>;
}

function ShellTopNav() {
  return (
    <nav role="navigation" aria-label="Portfolio navigation" style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(250, 251, 253, 0.88)", backdropFilter: "saturate(180%) blur(12px)", WebkitBackdropFilter: "saturate(180%) blur(12px)",
      borderBottom: `1px solid ${COLORS.borderColor}`, fontFamily: FONT,
    }}>
      <div style={{ maxWidth: SHELL.maxW, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <a href="#top" aria-label="Devika Ramkaran — back to top" style={{ display: "inline-flex", alignItems: "center", gap: 10, color: COLORS.text, textDecoration: "none", fontWeight: 700, fontSize: 14, letterSpacing: 0.2 }}>
          <span aria-hidden="true" style={{ width: 26, height: 26, borderRadius: 7, background: COLORS.accent, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>DR</span>
          <span className="oad-nav-brand-name">Devika Ramkaran</span>
        </a>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <a href="#demo" className="oad-nav-link">Demo</a>
          <a href="#case-study" className="oad-nav-link">Case study</a>
          <a href="mailto:vikkir29@gmail.com" style={{ padding: "8px 16px", borderRadius: 8, background: COLORS.accent, color: "#FFFFFF", textDecoration: "none", fontSize: 13, fontWeight: 700, marginLeft: 6, fontFamily: FONT }}>Contact →</a>
        </div>
      </div>
    </nav>
  );
}

function ShellHero() {
  const stack = ["React", "Recharts", "Inline-CSS", "Pattern-Detection", "A11y"];
  return (
    <header id="top" style={{ maxWidth: SHELL.maxW, margin: "0 auto", padding: "80px 24px 40px", fontFamily: FONT }}>
      <div style={{ fontSize: 11, color: COLORS.textSecondary, letterSpacing: 2.2, textTransform: "uppercase", fontWeight: 700, borderLeft: `3px solid ${COLORS.accent}`, paddingLeft: 10, marginBottom: 18 }}>
        Portfolio · Operations Intelligence
      </div>
      <h1 className="oad-hero-headline" style={{ margin: 0, fontSize: 44, fontWeight: 700, color: COLORS.text, lineHeight: 1.1, letterSpacing: -0.5, maxWidth: 880 }}>
        An operations dashboard that finds <span style={{ color: COLORS.accent }}>patterns you'd miss</span> in the noise.
      </h1>
      <p style={{ fontSize: 18, color: COLORS.textSecondary, lineHeight: 1.55, maxWidth: 680, marginTop: 20, marginBottom: 28 }}>
        Four weeks of operational data — email volume, task completion, calendar utilization,
        and time allocation — visualized with anomaly detection, trend analysis, and
        actionable insights. Built to show how an operations specialist thinks about
        workflow data at scale.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 30 }}>
        {stack.map((s) => (
          <span key={s} className="oad-stack-chip" style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, background: COLORS.cardBg, border: `1px solid ${COLORS.borderColor}`, borderRadius: 20, padding: "6px 12px", fontFamily: MONO, letterSpacing: 0.3 }}>{s}</span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="#demo" style={{ padding: "12px 20px", borderRadius: 9, background: COLORS.accent, color: "#FFFFFF", textDecoration: "none", fontSize: 14, fontWeight: 700, letterSpacing: 0.2, fontFamily: FONT }}>Explore the demo ↓</a>
        <a href="#case-study" style={{ padding: "12px 20px", borderRadius: 9, background: "transparent", color: COLORS.text, textDecoration: "none", fontSize: 14, fontWeight: 700, border: `1px solid ${COLORS.borderStrong}`, letterSpacing: 0.2, fontFamily: FONT }}>Read the case study</a>
      </div>
    </header>
  );
}

function ShellMetricsBand() {
  const metrics = [
    { value: 4, suffix: "", unit: "data categories", hero: true, hint: "email · tasks · calendar · time" },
    { value: 8, suffix: "+", unit: "insight patterns", hint: "anomalies, trends, and actionable signals" },
    { value: 12, suffix: "", unit: "visualization types", hint: "bar, line, area, pie, heatmap, KPI" },
  ];
  return (
    <section aria-label="Design metrics" style={{ background: COLORS.text, color: COLORS.cardBg, padding: "48px 24px", fontFamily: FONT, marginTop: 8 }}>
      <div className="oad-metrics-grid" style={{ maxWidth: SHELL.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40, alignItems: "end" }}>
        {metrics.map((m) => (
          <div key={m.unit}>
            <div style={{ fontFamily: MONO, fontSize: m.hero ? 78 : 56, fontWeight: 800, lineHeight: 1, color: m.hero ? COLORS.cardBg : "rgba(250, 251, 253, 0.78)", letterSpacing: -2, fontVariantNumeric: "tabular-nums" }}>
              <AnimatedCounter value={m.value} suffix={m.suffix} />
            </div>
            <div style={{ fontSize: m.hero ? 15 : 13, color: "rgba(250, 251, 253, 0.72)", marginTop: 12, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>{m.unit}</div>
            <div style={{ fontSize: 12, color: "rgba(250, 251, 253, 0.52)", marginTop: 6, lineHeight: 1.4 }}>{m.hint}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShellDemoFrame({ children }) {
  return (
    <section id="demo" aria-label="Live demo" style={{ maxWidth: SHELL.maxW, margin: "0 auto", padding: "72px 24px 40px", fontFamily: FONT }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: COLORS.textSecondary, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, borderLeft: `3px solid ${COLORS.accent}`, paddingLeft: 10 }}>Live demo</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 6px", letterSpacing: -0.3, color: COLORS.text }}>Four dimensions, one operational picture</h2>
        <p style={{ fontSize: 15, color: COLORS.textSecondary, margin: 0, maxWidth: 680, lineHeight: 1.55 }}>
          Switch between weeks to watch patterns shift. Each tab surfaces a different dimension of operational data with trend indicators and anomaly detection built in.
        </p>
      </div>
      <div className="oad-demo-frame" style={{
        background: COLORS.cardBg, borderRadius: 14, border: `1px solid ${COLORS.borderColor}`, overflow: "hidden",
        boxShadow: "0 1px 2px rgba(42,53,71,0.06), 0 18px 40px rgba(42,53,71,0.08), 0 40px 80px rgba(42,53,71,0.06)",
      }}>
        <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: COLORS.cardBgMuted, borderBottom: `1px solid ${COLORS.borderColor}` }}>
          <span style={{ display: "flex", gap: 6 }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#E6D4E1" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#C4CDE3" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#B5C3DA" }} />
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.textSecondary, background: COLORS.cardBg, borderRadius: 6, padding: "4px 10px", border: `1px solid ${COLORS.borderColor}`, flex: 1, maxWidth: 360, textAlign: "center" }}>
            ops-analytics-dashboard.vercel.app
          </span>
        </div>
        <div style={{ padding: "24px 20px 28px" }}>{children}</div>
      </div>
    </section>
  );
}

function ShellCaseStudy() {
  const sections = [
    {
      id: "problem", title: "The problem",
      body: "Operations roles generate enormous volumes of data across email, task lists, calendars, and time tracking tools. But this data lives in silos. An EA might handle 250 emails a week, close 50 tasks, sit in 30 meetings, and track time across 5 project categories — yet have no single view that shows how these dimensions interact. When email volume spikes, does task completion drop? When meetings consume 70% of the calendar, where does focus time go? Without this cross-dimensional view, operations professionals optimize in isolation and miss the systemic patterns that compound over weeks."
    },
    {
      id: "approach", title: "My approach",
      body: "I built four data categories that mirror actual operational workflows: email (volume, timing, response latency, categorization), tasks (completion rate, overdue tracking, daily throughput), calendar (meeting load, focus time, utilization percentage), and time allocation (project-level tracking with category breakdown). Each category has its own tab with dedicated KPIs, trend indicators comparing to the previous week, and multiple chart types chosen for the specific data shape — bar charts for daily comparisons, area charts for distributions, line charts for trends, and a heatmap for calendar density. An insights engine runs across all four categories to surface patterns, anomalies, and week-over-week shifts that a human reviewer would take 30 minutes to spot."
    },
    {
      id: "decisions", title: "Technical decisions",
      body: "Single-file React component with Recharts for visualization — the only external dependency beyond React itself. Inline styles with the Heritage Silver palette maintain visual consistency with the rest of the portfolio. The data generation uses deterministic functions with seeded variance so each week tells a coherent story: Week 3 has higher email volume and slower response times (simulating an inbox overload period), Week 2 has more tasks (simulating a project push). The insights engine uses simple threshold detection and week-over-week deltas rather than statistical models — the goal is to show operational thinking, not data science. Every chart has a custom tooltip, every KPI card shows a trend indicator, and the tab navigation uses proper ARIA roles."
    },
    {
      id: "reflections", title: "What I'd change next",
      body: "Real API integration is the obvious next step — connecting Gmail, Google Calendar, and a task manager would make this a live tool rather than a demo. I'd add a PDF export for weekly operational reports, a notification system for threshold breaches (e.g., response time exceeding 30 minutes triggers an alert), and correlation analysis across categories (mapping meeting load against task completion to quantify the meeting tax). The heatmap could extend to a full month view with drill-down into individual days. Long-term, this becomes the foundation for predictive operational modeling — forecasting next week's bottlenecks based on four weeks of pattern data."
    },
  ];

  return (
    <section id="case-study" aria-label="Case study" style={{ background: COLORS.background, padding: "80px 24px 60px", fontFamily: FONT, borderTop: `1px solid ${COLORS.borderColor}` }}>
      <div style={{ maxWidth: SHELL.maxW, margin: "0 auto" }}>
        <div style={{ fontSize: 11, color: COLORS.textSecondary, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, borderLeft: `3px solid ${COLORS.accent}`, paddingLeft: 10 }}>Case study</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 32px", color: COLORS.text, letterSpacing: -0.3 }}>How this got built</h2>
        <div className="oad-case-grid" style={{ display: "grid", gridTemplateColumns: "minmax(180px, 220px) 1fr", gap: 48, alignItems: "start" }}>
          <nav aria-label="Case study sections" className="oad-case-toc" style={{ position: "sticky", top: 80, fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.4, color: COLORS.textSecondary, fontWeight: 700, marginBottom: 8 }}>On this page</div>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="oad-toc-link" style={{ color: COLORS.textSecondary, textDecoration: "none", padding: "6px 0 6px 12px", borderLeft: `2px solid ${COLORS.borderColor}`, fontWeight: 600 }}>{s.title}</a>
            ))}
          </nav>
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {sections.map((s) => (
              <article id={s.id} key={s.id}>
                <h3 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px", color: COLORS.text, letterSpacing: -0.2 }}>{s.title}</h3>
                <p style={{ fontSize: 16, color: COLORS.text, lineHeight: 1.65, margin: 0, maxWidth: 640 }}>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ShellFooterCTA() {
  return (
    <footer role="contentinfo" style={{ background: COLORS.text, color: COLORS.cardBg, fontFamily: FONT, padding: "72px 24px 36px" }}>
      <div style={{ maxWidth: SHELL.maxW, margin: "0 auto" }}>
        <div className="oad-footer-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, alignItems: "end", marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "rgba(250, 251, 253, 0.55)", fontWeight: 700, marginBottom: 12 }}>Next piece →</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, margin: 0, lineHeight: 1.15, letterSpacing: -0.4, maxWidth: 560 }}>Need someone who thinks in systems?</h2>
            <p style={{ fontSize: 16, color: "rgba(250, 251, 253, 0.7)", lineHeight: 1.55, marginTop: 14, marginBottom: 0, maxWidth: 480 }}>
              I'm open to EA, chief-of-staff, and operations roles. If the data-driven approach here maps to a seat you're trying to fill, I'd love to talk.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <a href="mailto:vikkir29@gmail.com" style={{ padding: "14px 22px", borderRadius: 10, background: COLORS.cardBg, color: COLORS.text, textDecoration: "none", fontSize: 15, fontWeight: 700, fontFamily: FONT }}>Get in touch →</a>
            <a href="https://github.com/devika-builds/ops-analytics-dashboard" target="_blank" rel="noopener noreferrer" style={{ padding: "14px 22px", borderRadius: 10, background: "transparent", color: COLORS.cardBg, textDecoration: "none", fontSize: 15, fontWeight: 700, border: "1px solid rgba(250, 251, 253, 0.3)", fontFamily: FONT }}>View source ↗</a>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(250, 251, 253, 0.4)", borderTop: "1px solid rgba(250, 251, 253, 0.15)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span>© 2026 Devika Ramkaran · Built with React + Recharts + Inline-CSS</span>
          <span>vikkir29@gmail.com</span>
        </div>
      </div>
    </footer>
  );
}

function ShellShortcutOverlay() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      const el = e.target;
      const inField = el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (inField) return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) { e.preventDefault(); setOpen((o) => !o); }
      else if (e.key === "Escape") { setOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  if (!open) return null;
  const shortcuts = [
    { key: "Tab", desc: "Move focus forward" },
    { key: "Shift + Tab", desc: "Move focus back" },
    { key: "Enter / Space", desc: "Activate focused element" },
    { key: "Esc", desc: "Close this overlay" },
    { key: "?", desc: "Toggle shortcuts" },
  ];
  return (
    <div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={() => setOpen(false)} style={{
      position: "fixed", inset: 0, zIndex: 100, background: "rgba(42, 53, 71, 0.45)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: FONT,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: COLORS.cardBg, borderRadius: 14, padding: "28px 32px", maxWidth: 440, width: "100%",
        boxShadow: "0 30px 80px rgba(42, 53, 71, 0.35)", border: `1px solid ${COLORS.borderColor}`,
      }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: COLORS.textSecondary, fontWeight: 700, marginBottom: 4 }}>Keyboard</div>
        <h3 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: COLORS.text }}>Shortcuts</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shortcuts.map((s) => (
            <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, padding: "4px 10px", borderRadius: 6, background: COLORS.cardBgMuted, border: `1px solid ${COLORS.borderColor}`, color: COLORS.text, fontWeight: 600 }}>{s.key}</span>
              <span style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: "right" }}>{s.desc}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setOpen(false)} style={{
          marginTop: 24, background: COLORS.accent, color: "#FFFFFF", border: "none", borderRadius: 8,
          padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: FONT,
        }}>Got it</button>
      </div>
    </div>
  );
}

function ShellKeyboardNudge() {
  return (
    <div aria-hidden="true" className="oad-nudge" style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 40, background: COLORS.cardBg,
      border: `1px solid ${COLORS.borderColor}`, borderRadius: 20, padding: "6px 14px",
      fontSize: 11, color: COLORS.textSecondary, fontFamily: FONT, fontWeight: 600,
      boxShadow: "0 2px 8px rgba(42, 53, 71, 0.08)", pointerEvents: "none",
    }}>
      Press{" "}
      <kbd style={{ fontFamily: MONO, background: COLORS.cardBgMuted, padding: "1px 6px", borderRadius: 4, fontSize: 10, border: `1px solid ${COLORS.borderColor}`, color: COLORS.text, marginLeft: 2 }}>?</kbd>{" "}
      for shortcuts
    </div>
  );
}

// ====================================================================
// APP — full portfolio page
// ====================================================================
export default function App() {
  return (
    <div style={{ background: COLORS.background, minHeight: "100vh", color: COLORS.text, fontFamily: FONT }}>
      <style>{`
        html { scroll-behavior: smooth; }
        .oad-nav-link, .oad-toc-link {
          padding: 8px 14px; border-radius: 8px; text-decoration: none;
          font-size: 13px; font-weight: 600; color: #566175;
          transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
        }
        .oad-nav-link:hover, .oad-toc-link:hover { color: #2A3547; background: rgba(107, 127, 171, 0.08); }
        .oad-nav-link:focus-visible, .oad-toc-link:focus-visible { outline: 2px solid #6B7FAB; outline-offset: 2px; }
        .oad-stack-chip { transition: border-color 150ms ease, transform 150ms ease; }
        .oad-stack-chip:hover { border-color: rgba(107, 127, 171, 0.5); transform: translateY(-1px); }
        .oad-nudge { animation: oad-nudge-in 400ms 1.2s backwards cubic-bezier(.2,.7,.2,1); }
        @keyframes oad-nudge-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        a:focus-visible, button:focus-visible { outline: 2px solid #6B7FAB; outline-offset: 2px; border-radius: 6px; }
        /* KPI grid responsive */
        @media (max-width: 960px) {
          .oad-metrics-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          .oad-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 820px) {
          .oad-metrics-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .oad-case-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .oad-case-toc { position: static !important; flex-direction: row !important; flex-wrap: wrap !important; }
          .oad-case-toc a { border-left: none !important; border-bottom: 2px solid rgba(42,53,71,0.14); padding: 6px 12px !important; }
          .oad-footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; align-items: start !important; }
          .oad-hero-headline { font-size: 34px !important; }
          .oad-chart-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .oad-hero-headline { font-size: 28px !important; }
          .oad-nav-brand-name { display: none; }
          .oad-kpi-grid { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } .oad-nudge { animation: none; } }
      `}</style>
      <ShellTopNav />
      <ShellHero />
      <ShellMetricsBand />
      <ShellDemoFrame>
        <DashboardDemo />
      </ShellDemoFrame>
      <ShellCaseStudy />
      <ShellFooterCTA />
      <ShellShortcutOverlay />
      <ShellKeyboardNudge />
    </div>
  );
}
