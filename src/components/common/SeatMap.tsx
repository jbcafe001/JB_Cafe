import React, { useState } from 'react';
import { Table, TableStatus } from '../../types';
import { Maximize2, Minimize2 } from 'lucide-react';

interface SeatMapProps {
  tables: Table[];
  onTableClick?: (table: Table) => void;
  interactive?: boolean;
}

const statusColor: Record<TableStatus, { bg: string; border: string; text: string; dot: string }> = {
  available:  { bg: 'bg-emerald-50 hover:bg-emerald-100/70',  border: 'border-emerald-500', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  occupied:   { bg: 'bg-amber-50 hover:bg-amber-100/70',      border: 'border-amber-500',   text: 'text-amber-900',   dot: 'bg-amber-500' },
  preparing:  { bg: 'bg-blue-50 hover:bg-blue-100/70',        border: 'border-blue-500',    text: 'text-blue-900',    dot: 'bg-blue-500 animate-pulse' },
  ready:      { bg: 'bg-teal-100 hover:bg-teal-200/70',       border: 'border-teal-600',    text: 'text-teal-900',    dot: 'bg-teal-500' },
  served:     { bg: 'bg-purple-50 hover:bg-purple-100/70',    border: 'border-purple-500',  text: 'text-purple-900',  dot: 'bg-purple-500' },
};

export const SeatMap: React.FC<SeatMapProps> = ({ tables, onTableClick, interactive = true }) => {
  const [mode, setMode] = useState<'fit' | 'scroll'>('fit');

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
      zone === 'G'  ? 'ring-1 sm:ring-2 ring-green-400/80'  :
      zone === 'J'  ? 'ring-1 sm:ring-2 ring-yellow-400/80' :
      zone === 'Sm' ? 'ring-1 sm:ring-2 ring-rose-400/80'   :
      zone === 'C'  ? 'ring-1 sm:ring-2 ring-sky-400/80'    : '';

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
          'seat-cell relative flex flex-col items-center justify-center rounded-lg sm:rounded-xl select-none transition-all shadow-2xs',
          'w-full',
          mode === 'fit' ? 'h-10 sm:h-14 md:h-16' : 'h-14 sm:h-16',
          c.bg, c.border, ring,
          interactive
            ? 'cursor-pointer hover:brightness-95 hover:shadow-md hover:scale-[1.03] active:scale-95'
            : 'cursor-default',
        ].join(' ')}
      >
        <span className={`absolute top-0.5 right-0.5 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${c.dot} shadow-xs`} />
        <span
          className={`font-black leading-none text-center tracking-tight ${
            mode === 'fit' ? 'text-[9.5px] sm:text-xs md:text-sm' : 'text-xs sm:text-sm'
          } ${c.text}`}
        >
          {number}
        </span>
        {zone && (
          <span
            className={`font-extrabold leading-none mt-0.5 sm:mt-1 tracking-wider uppercase ${
              mode === 'fit' ? 'text-[7px] sm:text-[9px]' : 'text-[8px] sm:text-[10px]'
            } ${zoneTextColor}`}
          >
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
    <div className="flex flex-col items-center gap-1 sm:gap-2 w-full">
      {/* label row */}
      <span
        className={`text-[8px] sm:text-[10px] md:text-[11px] font-extrabold uppercase tracking-tight min-h-[14px] sm:min-h-[16px] text-center truncate w-full ${labelColor}`}
      >
        {label ?? ''}
      </span>
      {/* top spacer */}
      {topSpacer > 0 &&
        Array.from({ length: topSpacer }).map((_, i) => (
          <div
            key={`top-spacer-${i}`}
            className={`w-full ${mode === 'fit' ? 'h-10 sm:h-14 md:h-16' : 'h-14 sm:h-16'} invisible pointer-events-none select-none`}
            aria-hidden="true"
          />
        ))}
      {/* cells */}
      {items.map((item, idx) => (
        <React.Fragment key={`${item.number}-${idx}`}>
          <TableCell number={item.number} zone={item.zone} />
          {item.spacerAfter && (
            <div
              className={`w-full ${mode === 'fit' ? 'h-10 sm:h-14 md:h-16' : 'h-14 sm:h-16'} invisible pointer-events-none select-none`}
              aria-hidden="true"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {/* Header controls: Floor Plan Info + View Mode Toggle */}
      <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-4 pb-2 border-b border-stone-200/80">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] sm:text-xs font-black text-stone-800 tracking-tight uppercase">
            Floor Map
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
            {tables.length} Tables
          </span>
        </div>

        <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
          <button
            type="button"
            onClick={() => setMode('fit')}
            className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'fit'
                ? 'bg-stone-900 text-white shadow-xs font-extrabold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Fit whole layout onto screen without cut-offs"
          >
            <Minimize2 className="w-3 h-3" />
            <span>Fit Screen</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('scroll')}
            className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'scroll'
                ? 'bg-stone-900 text-white shadow-xs font-extrabold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            title="Zoom in with horizontal scrolling"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Wide View</span>
          </button>
        </div>
      </div>

      {/* Main Floor Map Container */}
      <div className={`w-full ${mode === 'scroll' ? 'overflow-x-auto pb-2' : ''}`}>
        <div className={mode === 'scroll' ? 'min-w-[680px] sm:min-w-[760px] w-full' : 'w-full'}>

          {/* ════════════════════════════════════════════════════════
              KUNAFA SECTION (Tables & Counter)
              8-column layout (matching floor plan):
                Cols 1-2: Smoking (Sm-2, Sm-1)
                Col 3: Jhula (J-9)
                Col 4: C (C-3, C-4)
                Cols 5-8: Kunafa Counter & Tables (P-6..P-1, C-2, C-1, J-6, J-5)
          ════════════════════════════════════════════════════════ */}
          <div className={`grid grid-cols-8 ${mode === 'fit' ? 'gap-1 sm:gap-2.5 md:gap-3.5' : 'gap-2.5 sm:gap-3.5 md:gap-4'} w-full mb-3 sm:mb-5`}>

            {/* Col 1-2: Smoking (wide box spanning above garden columns) */}
            <div className="col-span-2 flex flex-col items-center gap-1 sm:gap-2 w-full">
              <span className="text-[8px] sm:text-[10px] md:text-[11px] font-extrabold uppercase tracking-tight min-h-[14px] sm:min-h-[16px] text-center text-rose-600">
                Smoking
              </span>
              <TableCell number="Sm-2" zone="Sm" />
              <TableCell number="Sm-1" zone="Sm" />
            </div>

            {/* Col 3: Jhula (J-9) */}
            <Col
              label="Jhula"
              labelColor="text-yellow-600"
              items={[{ number: 'J-9', zone: 'J' }]}
            />

            {/* Col 4: C-3 & C-4 */}
            <Col
              label="C"
              labelColor="text-sky-600"
              items={[
                { number: 'C-3', zone: 'C' },
                { number: 'C-4', zone: 'C' },
              ]}
            />

            {/* Col 5-8: Kunafa Counter badge + P / C / J tables */}
            <div className="col-span-4 flex flex-col items-center w-full">
              {/* Kunafa counter badge */}
              <div className="inline-flex items-center justify-center gap-1 px-2 sm:px-4 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-rose-300 sm:border-2 sm:border-rose-400 bg-rose-50 text-rose-900 text-[8.5px] sm:text-xs font-black select-none cursor-default mb-1 w-full max-w-sm text-center shadow-2xs truncate">
                🧁 Kunafa Counter
              </div>

              <div className={`grid grid-cols-4 ${mode === 'fit' ? 'gap-1 sm:gap-2 md:gap-3' : 'gap-2 sm:gap-3 md:gap-4'} w-full`}>
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
              8-column layout (matching floor plan):
                Col 1: Garden Left (G-6, G-5)
                Col 2: Garden Main (G-7, J-10 above G-4, G-4 → G-1)
                Col 3: Jhula (J-8, J-7 aligned with 4-2 & 4-1)
                Col 4: Col 4 (4-7 → 4-1)
                Col 5: Col 3 (3-5 → 3-1)
                Col 6: Col 2 (2-5 → 2-1)
                Col 7: Col 1 (1-5 → 1-1)
                Col 8: Entry Jhula (J-4 → J-1)
          ════════════════════════════════════════════════════════ */}
          <div className="border-t sm:border-t-2 border-dashed border-stone-300 my-2.5 sm:my-5" />

          <div className={`grid grid-cols-8 ${mode === 'fit' ? 'gap-1 sm:gap-2.5 md:gap-3.5' : 'gap-2.5 sm:gap-3.5 md:gap-4'} w-full mb-3 sm:mb-5`}>

            {/* Col 1: Garden Left: G-6, G-5 */}
            <Col
              label="Garden"
              labelColor="text-green-700"
              topSpacer={1}
              items={[
                { number: 'G-6', zone: 'G' },
                { number: 'G-5', zone: 'G' },
              ]}
            />

            {/* Col 2: Garden Main: G-7, J-10, G-4 → G-1 */}
            <Col
              label="Garden"
              labelColor="text-green-700"
              items={[
                { number: 'G-7', zone: 'G' },
                { number: 'J-10', zone: 'J' },
                { number: 'G-4', zone: 'G' },
                { number: 'G-3', zone: 'G' },
                { number: 'G-2', zone: 'G' },
                { number: 'G-1', zone: 'G' },
              ]}
            />

            {/* Col 3: Jhula: J-8, J-7 aligned at bottom near Counter */}
            <Col
              label="Jhula"
              labelColor="text-yellow-600"
              topSpacer={4}
              items={[
                { number: 'J-8', zone: 'J' },
                { number: 'J-7', zone: 'J' },
              ]}
            />

            {/* Col 4: Col 4: 4-7 → 4-1 */}
            <Col
              label="Col 4"
              items={[7, 6, 5, 4, 3, 2, 1].map((i) => ({ number: `4-${i}` }))}
            />

            {/* Col 5: Col 3: starts 1 row down, 3-5 → 3-1 */}
            <Col
              label="Col 3"
              topSpacer={1}
              items={[5, 4, 3, 2, 1].map((i) => ({ number: `3-${i}` }))}
            />

            {/* Col 6: Col 2: starts 1 row down to match Col 3, 2-5 → 2-1 */}
            <Col
              label="Col 2"
              topSpacer={1}
              items={[5, 4, 3, 2, 1].map((i) => ({ number: `2-${i}` }))}
            />

            {/* Col 7: Col 1: starts 1 row down to match Col 3, 1-5 → 1-1 */}
            <Col
              label="Col 1"
              topSpacer={1}
              items={[5, 4, 3, 2, 1].map((i) => ({ number: `1-${i}` }))}
            />

            {/* Col 8: Entry Jhula: J-4 (aligned with 1-5), walkway gap (aligned with 1-4), J-3, J-2, J-1 (aligned with 1-3, 1-2, 1-1) */}
            <Col
              label="Entry"
              labelColor="text-yellow-600"
              topSpacer={1}
              items={[
                { number: 'J-4', zone: 'J', spacerAfter: true },
                { number: 'J-3', zone: 'J' },
                { number: 'J-2', zone: 'J' },
                { number: 'J-1', zone: 'J' },
              ]}
            />
          </div>

          {/* JB Counter — centered like in the image */}
          <div className="flex justify-center my-2.5 sm:my-5">
            <div className="inline-flex items-center gap-1.5 px-3 sm:px-8 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl border border-amber-300 sm:border-2 sm:border-amber-400 bg-amber-50 text-amber-900 text-[9px] sm:text-xs md:text-sm font-black select-none cursor-default tracking-widest shadow-2xs">
              🍽️  C O U N T E R  ( J B )
            </div>
          </div>

          {/* Legend */}
          <div className="pt-2.5 sm:pt-4 border-t border-stone-200 flex flex-wrap gap-x-2.5 sm:gap-x-6 gap-y-1 sm:gap-y-2 justify-center">
            {(Object.entries(statusColor) as [TableStatus, typeof statusColor[TableStatus]][]).map(([st, c]) => (
              <span key={st} className="flex items-center gap-1 sm:gap-1.5 text-[8.5px] sm:text-xs font-semibold text-stone-600">
                <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${c.dot.replace(' animate-pulse', '')}`} />
                {st === 'occupied' ? 'Order Taken' : st.charAt(0).toUpperCase() + st.slice(1)}
              </span>
            ))}
            <span className="flex items-center gap-1 sm:gap-1.5 text-[8.5px] sm:text-xs font-semibold text-stone-500">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ring-1 sm:ring-2 ring-green-500 inline-block bg-white" /> Garden
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5 text-[8.5px] sm:text-xs font-semibold text-stone-500">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ring-1 sm:ring-2 ring-yellow-500 inline-block bg-white" /> Jhula
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5 text-[8.5px] sm:text-xs font-semibold text-stone-500">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ring-1 sm:ring-2 ring-rose-500 inline-block bg-white" /> Smoking
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5 text-[8.5px] sm:text-xs font-semibold text-stone-500">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ring-1 sm:ring-2 ring-sky-500 inline-block bg-white" /> C-Zone
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

