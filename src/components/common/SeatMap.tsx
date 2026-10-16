import React from 'react';
import { Table, TableStatus } from '../../types';

interface SeatMapProps {
  tables: Table[];
  onTableClick?: (table: Table) => void;
  interactive?: boolean;
}

const statusColor: Record<TableStatus, { bg: string; border: string; text: string; dot: string }> = {
  available:  { bg: 'bg-emerald-50 hover:bg-emerald-100/70',  border: 'border-emerald-400', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  occupied:   { bg: 'bg-amber-50 hover:bg-amber-100/70',      border: 'border-amber-400',   text: 'text-amber-900',   dot: 'bg-amber-500' },
  preparing:  { bg: 'bg-blue-50 hover:bg-blue-100/70',        border: 'border-blue-400',    text: 'text-blue-900',    dot: 'bg-blue-500 animate-pulse' },
  ready:      { bg: 'bg-teal-100 hover:bg-teal-200/70',       border: 'border-teal-500',    text: 'text-teal-900',    dot: 'bg-teal-500' },
  served:     { bg: 'bg-purple-50 hover:bg-purple-100/70',    border: 'border-purple-400',  text: 'text-purple-900',  dot: 'bg-purple-500' },
};

const CELL_H = 70; // px — table box height
const GAP    = 8;  // px — vertical gap between boxes (gap-2)

export const SeatMap: React.FC<SeatMapProps> = ({ tables, onTableClick, interactive = true }) => {
  const tableMap = new Map<string, Table>();
  tables.forEach((t) => {
    tableMap.set(t.number, t);
    tableMap.set(t.number.toLowerCase(), t);
    tableMap.set(t.number.replace(/\s+/g, ''), t);
  });

  /* ── Table Cell ─────────────────────────────────────────── */
  const TableCell: React.FC<{ number: string; zone?: 'G' | 'J' | 'Sm' | 'C' }> = ({ number, zone }) => {
    const table = tableMap.get(number) || tableMap.get(number.toLowerCase()) || tableMap.get(number.replace(/\s+/g, ''));
    const fallbackTable: Table = {
      id: `tbl-${number.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      number,
      name: `Table ${number}`,
      seats: 4,
      status: 'available',
    };
    const effectiveTable = table || fallbackTable;
    const status = effectiveTable.status ?? 'available';
    const c      = statusColor[status] ?? statusColor.available;

    const ring =
      zone === 'G'  ? 'ring-2 ring-green-400/80'  :
      zone === 'J'  ? 'ring-2 ring-yellow-400/80' :
      zone === 'Sm' ? 'ring-2 ring-rose-400/80'   :
      zone === 'C'  ? 'ring-2 ring-sky-400/80'    : '';

    const zoneTextColor =
      zone === 'G'  ? 'text-green-700'  :
      zone === 'J'  ? 'text-yellow-700' :
      zone === 'Sm' ? 'text-rose-700'   :
      zone === 'C'  ? 'text-sky-700'    : '';

    return (
      <div
        onClick={() => interactive && onTableClick?.(effectiveTable)}
        title={effectiveTable ? `${effectiveTable.name} — ${status}` : `${number}`}
        className={[
          'relative flex flex-col items-center justify-center rounded-xl border-2 select-none transition-all shadow-xs',
          'w-full max-w-[150px]',
          c.bg, c.border, ring,
          interactive
            ? 'cursor-pointer hover:brightness-95 hover:shadow-md hover:scale-[1.02] active:scale-95'
            : 'cursor-default',
        ].join(' ')}
        style={{ height: CELL_H, minHeight: CELL_H }}
      >
        <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${c.dot} shadow-xs`} />
        <span className={`font-black text-sm sm:text-base leading-tight text-center tracking-tight ${c.text}`}>
          {number}
        </span>
        {zone && (
          <span className={`text-[10px] font-extrabold leading-none mt-1 tracking-wider uppercase ${zoneTextColor}`}>
            {zone}
          </span>
        )}
      </div>
    );
  };


  /* ── Column of cells ────────────────────────────────────── */
  const Col: React.FC<{
    label?: string;
    labelColor?: string;
    topSpacer?: number;
    items: { number: string; zone?: 'G' | 'J' | 'Sm' | 'C'; spacerAfter?: boolean }[];
  }> = ({ label, labelColor = 'text-stone-400', topSpacer = 0, items }) => (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* label row */}
      <span className={`text-[11px] font-extrabold uppercase tracking-wider min-h-[16px] text-center ${labelColor}`}>
        {label ?? ''}
      </span>
      {/* top spacer */}
      {topSpacer > 0 && <div style={{ height: topSpacer * (CELL_H + GAP) }} />}
      {/* cells */}
      {items.map((item, idx) => (
        <React.Fragment key={`${item.number}-${idx}`}>
          <TableCell number={item.number} zone={item.zone} />
          {item.spacerAfter && <div style={{ height: CELL_H + GAP }} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-[680px] w-full">

      {/* ════════════════════════════════════════════════════════
          KUNAFA SECTION (Tables & Counter)
          7-column layout (matching floor plan):
            Col 1: Smoking (Sm-2, Sm-1)
            Col 2: Jhula (J-9)
            Col 3: C (C-3, C-4)
            Cols 4-7: Kunafa Counter & Tables (P-6..P-1, C-2, C-1, J-6, J-5)
      ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-7 gap-3 sm:gap-4 md:gap-5 w-full mb-6">

        {/* Col 1: Smoking */}
        <Col
          label="Smoking"
          labelColor="text-rose-600"
          items={[
            { number: 'Sm-2', zone: 'Sm' },
            { number: 'Sm-1', zone: 'Sm' },
          ]}
        />

        {/* Col 2: J-9 */}
        <Col
          label="Jhula"
          labelColor="text-yellow-600"
          items={[{ number: 'J-9', zone: 'J' }]}
        />

        {/* Col 3: C-3 & C-4 */}
        <Col
          label="C"
          labelColor="text-sky-600"
          items={[
            { number: 'C-3', zone: 'C' },
            { number: 'C-4', zone: 'C' },
          ]}
        />

        {/* Col 4-7: Kunafa Counter badge + P / C / J tables */}
        <div className="col-span-4 flex flex-col items-center w-full">
          {/* Kunafa counter badge */}
          <div className="inline-flex items-center justify-center gap-1.5 px-4 py-1 rounded-lg border-2 border-rose-400 bg-rose-50 text-rose-900 text-xs font-black select-none cursor-default mb-1 w-full max-w-sm text-center shadow-xs">
            🧁 Kunafa Counter
          </div>

          <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full">
            {/* P-6, P-5, P-4 */}
            <Col items={[{ number: 'P-6' }, { number: 'P-5' }, { number: 'P-4' }]} />
            {/* P-3, P-2, P-1 */}
            <Col items={[{ number: 'P-3' }, { number: 'P-2' }, { number: 'P-1' }]} />
            {/* C-2 (row 1), spacer, C-1 (row 3) */}
            <Col
              items={[
                { number: 'C-2', zone: 'C', spacerAfter: true },
                { number: 'C-1', zone: 'C' },
              ]}
            />
            {/* J-6 (row 1), spacer, J-5 (row 3) */}
            <Col
              items={[
                { number: 'J-6', zone: 'J', spacerAfter: true },
                { number: 'J-5', zone: 'J' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          JB CAFE FLOOR
          7-column layout:
            Col 1: Garden (G-7 → G-1)
            Col 2: Left Jhula (J-10, J-8, J-7)
            Col 3: Col 4 (4-7 → 4-1)
            Col 4: Col 3 (3-5 → 3-1)
            Col 5: Col 2 (2-5 → 2-1)
            Col 6: Col 1 (1-5 → 1-1)
            Col 7: Entry Jhula (J-4 → J-1)
      ════════════════════════════════════════════════════════ */}
      <div className="border-t-2 border-dashed border-stone-300 my-6" />

      <div className="grid grid-cols-7 gap-3 sm:gap-4 md:gap-5 w-full mb-6">

        {/* Col 1: Garden: G-7 → G-1 */}
        <Col
          label="Garden"
          labelColor="text-green-700"
          items={[7, 6, 5, 4, 3, 2, 1].map((i) => ({ number: `G-${i}`, zone: 'G' as const }))}
        />

        {/* Col 2: Left Jhula: J-10, J-8, J-7 */}
        <Col
          label="Jhula"
          labelColor="text-yellow-600"
          items={[
            { number: 'J-10', zone: 'J' },
            { number: 'J-8',  zone: 'J' },
            { number: 'J-7',  zone: 'J' },
          ]}
        />

        {/* Col 3: Col 4: 4-7 → 4-1 */}
        <Col
          label="Col 4"
          items={[7, 6, 5, 4, 3, 2, 1].map((i) => ({ number: `4-${i}` }))}
        />

        {/* Col 4: Col 3: starts 1 row down, 3-5 → 3-1 */}
        <Col
          label="Col 3"
          topSpacer={1}
          items={[5, 4, 3, 2, 1].map((i) => ({ number: `3-${i}` }))}
        />

        {/* Col 5: Col 2: 2-5 → 2-1 */}
        <Col
          label="Col 2"
          items={[5, 4, 3, 2, 1].map((i) => ({ number: `2-${i}` }))}
        />

        {/* Col 6: Col 1: 1-5 → 1-1 */}
        <Col
          label="Col 1"
          items={[5, 4, 3, 2, 1].map((i) => ({ number: `1-${i}` }))}
        />

        {/* Col 7: Entry Jhula: J-4 → J-1 */}
        <Col
          label="↑ Entry"
          labelColor="text-yellow-600"
          items={[4, 3, 2, 1].map((i) => ({ number: `J-${i}`, zone: 'J' as const }))}
        />
      </div>

      {/* JB Counter — centered like in the image */}
      <div className="flex justify-center my-6">
        <div className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl border-2 border-amber-400 bg-amber-50 text-amber-900 text-xs sm:text-sm font-black select-none cursor-default tracking-widest shadow-xs">
          🍽️  C O U N T E R  ( J B )
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-stone-200 flex flex-wrap gap-x-6 gap-y-2 justify-center">
        {(Object.entries(statusColor) as [TableStatus, typeof statusColor[TableStatus]][]).map(([st, c]) => (
          <span key={st} className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <span className={`w-3 h-3 rounded-full ${c.dot.replace(' animate-pulse', '')}`} />
            {st === 'occupied' ? 'Order Taken' : st.charAt(0).toUpperCase() + st.slice(1)}
          </span>
        ))}
        <span className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          <span className="w-3 h-3 rounded-full ring-2 ring-green-500 inline-block bg-white" /> Garden
        </span>
        <span className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          <span className="w-3 h-3 rounded-full ring-2 ring-yellow-500 inline-block bg-white" /> Jhula
        </span>
        <span className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          <span className="w-3 h-3 rounded-full ring-2 ring-rose-500 inline-block bg-white" /> Smoking
        </span>
        <span className="flex items-center gap-2 text-xs font-semibold text-stone-500">
          <span className="w-3 h-3 rounded-full ring-2 ring-sky-500 inline-block bg-white" /> C-Zone
        </span>
      </div>
      </div>
    </div>
  );
};
