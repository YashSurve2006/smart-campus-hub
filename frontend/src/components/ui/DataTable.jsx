/**
 * DataTable v2 — Premium Enterprise Data Experience
 * White-alpha glass container, command-bar search, floating controls,
 * animated rows with stagger, premium empty state, pagination UI,
 * sticky header with gradient backdrop.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Search, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { TableSkeleton } from './Skeleton';

/* ── Premium empty state ── */
function TableEmpty({ icon: Icon = Inbox, message = 'No data found', sub, onClearSearch }) {
  return (
    <motion.tr>
      <td colSpan={99}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4 py-20"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <Icon className="h-8 w-8 text-slate-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-400">{message}</p>
            {sub && <p className="mt-1 text-xs text-slate-600">{sub}</p>}
          </div>
          {onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="flex items-center gap-2 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.08] px-3 py-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/[0.15]"
            >
              <X className="h-3.5 w-3.5" />
              Clear search
            </button>
          )}
        </motion.div>
      </td>
    </motion.tr>
  );
}

/* ── Pagination ── */
function Pagination({ page, totalPages, onPage, total, pageSize }) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-3.5">
      <span className="text-xs text-slate-600">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.07] hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {/* Page pills */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page + i - 2;
          if (p < 1 || p > totalPages) return null;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              className={[
                'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition',
                p === page
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/25'
                  : 'text-slate-500 hover:bg-white/[0.07] hover:text-white',
              ].join(' ')}
            >
              {p}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.07] hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function DataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon,
  emptySub,
  rowKey = 'id',
  onRowClick,
  className = '',
  tableClassName = '',
  skeletonRows = 5,
  searchable = false,
  searchPlaceholder = 'Search…',
  pageSize = 20,
  title,
  titleIcon: TitleIcon,
  actions,
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  /* Client-side search */
  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [rows, search, columns]);

  /* Pagination */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleSearch(val) {
    setSearch(val);
    setPage(1);
  }

  if (loading) return <TableSkeleton rows={skeletonRows} cols={columns.length} />;

  return (
    <div
      className={[
        'overflow-hidden rounded-2xl border border-white/[0.08] backdrop-blur-2xl',
        className,
      ].join(' ')}
      style={{
        background: 'rgba(255,255,255,0.03)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* ── Command bar ── */}
      {(title || searchable || actions) && (
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center">
          {/* Title */}
          {title && (
            <div className="flex items-center gap-2 shrink-0">
              {TitleIcon && <TitleIcon className="h-4 w-4 text-indigo-400" />}
              <span className="text-sm font-bold text-white">{title}</span>
            </div>
          )}

          {/* Search bar */}
          {searchable && (
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="ent-input pl-9 py-2 text-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Row count + actions */}
          <div className="ml-auto flex items-center gap-2">
            {filtered.length !== rows.length && (
              <span className="text-[11px] text-slate-600">
                {filtered.length} of {rows.length}
              </span>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className={`min-w-full text-left text-sm ${tableClassName}`}>
          {/* Sticky header */}
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    'ent-table-header sticky top-0 z-10 px-5 py-3.5',
                    'border-b border-white/[0.05]',
                    col.headerClass || '',
                  ].join(' ')}
                  style={{
                    width: col.width,
                    background: 'rgba(255,255,255,0.025)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginated.length > 0 ? (
                paginated.map((row, i) => (
                  <motion.tr
                    key={row[rowKey] ?? i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.025 }}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={[
                      'group border-t border-white/[0.04] transition-colors duration-150',
                      'hover:bg-white/[0.03]',
                      onRowClick ? 'cursor-pointer' : '',
                    ].join(' ')}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={[
                          'ent-table-cell px-5 py-3.5 text-sm text-slate-300',
                          'group-hover:text-slate-200',
                          col.cellClass || '',
                        ].join(' ')}
                      >
                        {col.render ? col.render(row, i) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableEmpty
                  icon={emptyIcon}
                  message={search ? `No results for "${search}"` : emptyMessage}
                  sub={search ? undefined : emptySub}
                  onClearSearch={search ? () => handleSearch('') : undefined}
                />
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPage={setPage}
        total={filtered.length}
        pageSize={pageSize}
      />
    </div>
  );
}
