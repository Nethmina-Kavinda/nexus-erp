import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { companyAverage } from '../lib/format';

/**
 * One compact row per department (highest first) with a company-average
 * marker. Hover shows the gap to average; click opens Risk Scoring
 * filtered to the department.
 */
export default function DepartmentRisk({ departments = [] }) {
  const [hover, setHover] = useState(null);
  const navigate = useNavigate();

  const rows = [...departments].sort((a, b) => (b.avg_risk || 0) - (a.avg_risk || 0));
  const avg = companyAverage(rows);

  return (
    <ol className="-mx-2.5 -my-1" onMouseLeave={() => setHover(null)}>
      {rows.map((d, i) => {
        const score = d.avg_risk || 0;
        const diff = score - avg;
        const isHover = hover === d._id;
        return (
          <li key={d._id}>
            <button
              type="button"
              onMouseEnter={() => setHover(d._id)}
              onFocus={() => setHover(d._id)}
              onBlur={() => setHover(null)}
              onClick={() => navigate(`/risk?dept=${encodeURIComponent(d._id)}`)}
              aria-label={`${d._id}: average risk ${score.toFixed(1)}, ${d.count} people. Open in Risk Scoring`}
              className={clsx(
                'w-full grid grid-cols-[minmax(0,108px)_1fr_auto] gap-x-3 items-center px-2.5 py-2 rounded-lg text-left transition-all',
                isHover && 'bg-surface-2',
                hover && !isHover && 'opacity-50'
              )}
            >
              <span className="text-[15px] font-semibold text-fg truncate">{d._id}</span>
              <span className="relative h-2 rounded-full bg-surface-2">
                <span
                  className={clsx(
                    'absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500',
                    !(i === 0 || isHover) && 'opacity-45 dark:opacity-70'
                  )}
                  style={{ width: `${Math.min(score, 100)}%` }}
                />
                <span className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-fg opacity-50" style={{ left: `${Math.min(avg, 100)}%` }} />
              </span>
              <span className="text-[15px] font-bold text-fg tnum text-right min-w-[64px]">
                {isHover
                  ? <span className="text-[13.5px] font-semibold text-fg-2">{diff >= 0 ? '+' : '−'}{Math.abs(diff).toFixed(1)} avg</span>
                  : score.toFixed(1)}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
