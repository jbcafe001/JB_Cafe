import React from 'react';
import { Table, TableStatus } from '../../types';

interface SeatMapProps {
  tables: Table[];
  onTableClick?: (table: Table) => void;
  interactive?: boolean;
}

// Status colours
const statusColor: Record<TableStatus, { bg: string; border: string; text: string; dot: string }> = {
  available: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  occupied: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    text: 'text-amber-900',
    dot: 'bg-amber-500',
  },
  preparing: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-900',
    dot: 'bg-blue-500 animate-pulse',
  },
  ready: {
    bg: 'bg-teal-100',
    border: 'border-teal-500',
    text: 'text-teal-900',
    dot: 'bg-teal-500',
  },
  served: {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    text: 'text-purple-900',
    dot: 'bg-purple-500',
  },
};

export const SeatMap: React.FC<SeatMapProps> = ({ tables, onTableClick, interactive = true }) => {
  const tableMap = new Map<string, Table>();
  tables.forEach((t) => tableMap.set(t.number, t));

  const getStatusColors = (status: TableStatus) => statusColor[status] ?? statusColor.available;

  const TableCell: React.FC<{ number: string; zone?: 'G' | 'J' | 'Sm' | undefined }> = ({ number, zone }) => {
    const table = tableMap.get(number);
    const status = table?.status ?? 'available';
    const colors = getStatusColors(status);

    const zoneAccent =
      zone === 'G'
        ? 'ring-1 ring-green-400/60'
        : zone === 'J'
        ? 'ring-1 ring-yellow-400/60'
        : zone === 'Sm'
        ? 'ring-1 ring-rose-400/60'
        : '';

    return (
      <div
        onClick={() => interactive && table && onTableClick?.(table)}
        title={table ? `${table.name} — ${status}` : `${number} (not configured)`}
        className={[
          'relative flex flex-col items-center justify-center rounded-lg border-2',
          colors.bg, colors.border, zoneAccent,
          interactive && table ? 'cursor-pointer hover:brightness-95 active:scale-95 transition-all' : 'cursor-default opacity-60',
          'p-0.5 select-none',
        ].join(' ')}
        style={{ minHeight: 44, minWidth: 44, width: 44 }}
      >
        <span className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        <span className={`font-extrabold text-[9px] leading-tight text-center ${colors.text}`}>
          {number}
        </span>
        {zone && (
          <span
            className={`text-[7px] font-bold leading-none mt-0.5 ${
              zone === 'G' ? 'text-green-700' : zone === 'J' ? 'text-yellow-700' : 'text-rose-700'
            }`}
          >
            {zone}
          </span>
        )}
      </div>
    );
  };

  const SectionHeader: React.FC<{ label: string; color: string; lineColor: string }> = ({ label, color, lineColor }) => (
    <div className="flex items-center gap-2 mb-2">
      <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label}</span>
      <div className={`flex-1 h-px ${lineColor}`} />
    </div>
  );

  const ZoneLabel: React.FC<{ label: string; color: string }> = ({ label, color }) => (
    <div className={`text-[8px] font-bold mb-0.5 pl-0.5 ${color}`}>{label}</div>
  );

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: 560 }}>

        {/* ── JB CAFE ───────────────────────────── */}
        <SectionHeader label="JB Cafe Floor" color="text-amber-800" lineColor="bg-amber-200" />

        {/* Row 1: 1-1 … 1-10 */}
        <div className="mb-1.5">
          <ZoneLabel label="Row 1" color="text-stone-400" />
          <div className="flex flex-wrap gap-1">
            {[1,2,3,4,5,6,7,8,9,10].map(i => <TableCell key={`1-${i}`} number={`1-${i}`} />)}
          </div>
        </div>

        {/* Row 2: 2-1 … 2-5 */}
        <div className="mb-1.5">
          <ZoneLabel label="Row 2" color="text-stone-400" />
          <div className="flex flex-wrap gap-1">
            {[1,2,3,4,5].map(i => <TableCell key={`2-${i}`} number={`2-${i}`} />)}
          </div>
        </div>

        {/* Row 3: 3-1 … 3-5 */}
        <div className="mb-1.5">
          <ZoneLabel label="Row 3" color="text-stone-400" />
          <div className="flex flex-wrap gap-1">
            {[1,2,3,4,5].map(i => <TableCell key={`3-${i}`} number={`3-${i}`} />)}
          </div>
        </div>

        {/* Row 4: 4-1 … 4-7 */}
        <div className="mb-1.5">
          <ZoneLabel label="Row 4" color="text-stone-400" />
          <div className="flex flex-wrap gap-1">
            {[1,2,3,4,5,6,7].map(i => <TableCell key={`4-${i}`} number={`4-${i}`} />)}
          </div>
        </div>

        {/* Jhula: J-1 … J-10 */}
        <div className="mb-1.5">
          <ZoneLabel label="Jhula (J)" color="text-yellow-600" />
          <div className="flex flex-wrap gap-1">
            {[1,2,3,4,5,6,7,8,9,10].map(i => <TableCell key={`J-${i}`} number={`J-${i}`} zone="J" />)}
          </div>
        </div>

        {/* Garden + Smoking */}
        <div className="flex flex-wrap gap-6 mb-2">
          <div>
            <ZoneLabel label="Garden (G)" color="text-green-700" />
            <div className="flex gap-1">
              {[9,10].map(i => <TableCell key={`G-${i}`} number={`G-${i}`} zone="G" />)}
            </div>
          </div>
          <div>
            <ZoneLabel label="Smoking (Sm)" color="text-rose-700" />
            <div className="flex gap-1">
              {[1,2].map(i => <TableCell key={`Sm-${i}`} number={`Sm-${i}`} zone="Sm" />)}
            </div>
          </div>
        </div>

        {/* JB Counter — display only */}
        <div className="mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-amber-400 bg-amber-50 text-amber-900 text-[10px] font-black select-none cursor-default">
            🍽️ Counter (JB)
          </div>
        </div>

        {/* ── KUNAFA ────────────────────────────── */}
        <div className="border-t-2 border-dashed border-stone-300 my-3" />
        <SectionHeader label="Kunafa Section" color="text-rose-800" lineColor="bg-rose-200" />

        {/* P tables: P-1 … P-6 */}
        <div className="mb-1.5">
          <ZoneLabel label="P Tables" color="text-stone-400" />
          <div className="flex flex-wrap gap-1">
            {[1,2,3,4,5,6].map(i => <TableCell key={`P-${i}`} number={`P-${i}`} />)}
          </div>
        </div>

        {/* C tables: C-1, C-2, C-3 */}
        <div className="mb-1.5">
          <ZoneLabel label="C Tables" color="text-stone-400" />
          <div className="flex gap-1">
            {[1,2,3].map(i => <TableCell key={`C-${i}`} number={`C-${i}`} />)}
          </div>
        </div>

        {/* Kunafa Counter — display only */}
        <div className="mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-rose-400 bg-rose-50 text-rose-900 text-[10px] font-black select-none cursor-default">
            🧁 Kunafa Counter
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 pt-2 border-t border-stone-200 flex flex-wrap gap-x-3 gap-y-1">
          {(Object.entries(statusColor) as [TableStatus, typeof statusColor[TableStatus]][]).map(([st, c]) => (
            <span key={st} className="flex items-center gap-1 text-[9px] font-semibold text-stone-600">
              <span className={`w-2 h-2 rounded-full ${c.dot.replace(' animate-pulse','')}`} />
              {st === 'occupied' ? 'Order Taken' : st.charAt(0).toUpperCase() + st.slice(1)}
            </span>
          ))}
          <span className="flex items-center gap-1 text-[9px] font-semibold text-stone-400">
            <span className="w-2 h-2 rounded-full ring-1 ring-green-500 inline-block" /> Garden
          </span>
          <span className="flex items-center gap-1 text-[9px] font-semibold text-stone-400">
            <span className="w-2 h-2 rounded-full ring-1 ring-yellow-500 inline-block" /> Jhula
          </span>
          <span className="flex items-center gap-1 text-[9px] font-semibold text-stone-400">
            <span className="w-2 h-2 rounded-full ring-1 ring-rose-500 inline-block" /> Smoking
          </span>
        </div>
      </div>
    </div>
  );
};
