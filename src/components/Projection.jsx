import React, { useMemo, useState } from 'react';
import {
  buildForecast,
  formatCurrency,
  formatSigned,
  formatShort,
} from '../utils/recurrence';

const monthLabel = (d) =>
  d.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
const yearLabel = (d) => d.getFullYear().toString().slice(2);

const Projection = ({ accounts, transactions }) => {
  const [displayMode, setDisplayMode] = useState('total');
  const [horizon, setHorizon] = useState(12);
  const [hover, setHover] = useState(null);

  const forecast = useMemo(
    () => buildForecast(accounts, transactions, horizon),
    [accounts, transactions, horizon]
  );

  const series = useMemo(() => {
    if (displayMode === 'total') return forecast.map((m) => m.total);
    return forecast.map((m) => m.balances[displayMode] ?? 0);
  }, [forecast, displayMode]);

  const minVal = Math.min(...series, 0);
  const maxVal = Math.max(...series, 0);
  const range = maxVal - minVal || 1;

  const yLines = [0, 0.25, 0.5, 0.75, 1].map((p) => minVal + range * (1 - p));

  const bars = forecast.map((m, i) => {
    const v = series[i];
    const heightPct = ((v - minVal) / range) * 100;
    return { date: m.date, value: v, heightPct, isNow: i === 0 };
  });

  const points = bars.map((b, i) => ({
    x: (i / (bars.length - 1)) * 100,
    y: 100 - b.heightPct,
    value: b.value,
    date: b.date,
  }));
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');
  const areaD =
    pathD +
    ` L ${points[points.length - 1].x.toFixed(2)} 100 L 0 100 Z`;

  return (
    <div className="card forecast">
      <div className="section-head">
        <h2><span className="num">§ III</span>Forecast</h2>
        <div className="meta">{forecast.length - 1}-month projection</div>
      </div>

      <div className="forecast-toolbar">
        <div className="title">A projection with compounding</div>
        <div className="controls">
          <select
            className="select"
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value)}
          >
            <option value="total">Total net worth</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            className="select"
            value={horizon}
            onChange={(e) => setHorizon(parseInt(e.target.value, 10))}
            title="Horizon (months)"
          >
            {[6, 12, 18, 24, 36].map((h) => (
              <option key={h} value={h}>{h} mo</option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-area">
        <div className="chart-grid">
          {yLines.map((v, i) => (
            <div className="grid-line" key={i}>
              <span>{formatShort(v)}</span>
            </div>
          ))}
        </div>

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <pattern
              id="hatch"
              width="3"
              height="3"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="3" stroke="var(--accent)" strokeWidth="0.6" opacity="0.3" />
            </pattern>
          </defs>
          <path d={areaD} fill="url(#hatch)" />
          <path
            d={pathD}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="0.6"
              fill={i === 0 ? 'var(--accent)' : 'var(--ink)'}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div className="chart-bars">
          {bars.map((b, i) => (
            <div
              key={i}
              className={`bar${b.isNow ? ' now' : ''}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div className="month-label">
                <span>{monthLabel(b.date)}</span>
                {(b.date.getMonth() === 0 || i === 0) && (
                  <span className="yr">'{yearLabel(b.date)}</span>
                )}
              </div>
              {hover === i && (
                <div
                  className="tooltip"
                  style={{ bottom: `calc(${b.heightPct}% + 8px)` }}
                >
                  {b.date.toLocaleDateString('en-GB', {
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  · {formatCurrency(b.value)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <table className="forecast-table">
        <thead>
          <tr>
            <th>Month</th>
            <th className="num">Net worth</th>
            <th className="num">Δ vs prev</th>
            <th className="num">Δ vs today</th>
          </tr>
        </thead>
        <tbody>
          {forecast.map((m, i) => {
            const prev = i > 0 ? forecast[i - 1].total : forecast[0].total;
            const dPrev = m.total - prev;
            const dToday = m.total - forecast[0].total;
            return (
              <tr key={i}>
                <td>
                  {m.date.toLocaleDateString('en-GB', {
                    month: 'short',
                    year: 'numeric',
                  })}
                  {i === 0 ? ' · today' : ''}
                </td>
                <td className="num">{formatCurrency(m.total)}</td>
                <td className={`num ${dPrev >= 0 ? 'delta-pos' : 'delta-neg'}`}>
                  {i === 0 ? '—' : formatSigned(dPrev)}
                </td>
                <td className={`num ${dToday >= 0 ? 'delta-pos' : 'delta-neg'}`}>
                  {i === 0 ? '—' : formatSigned(dToday)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Projection;
