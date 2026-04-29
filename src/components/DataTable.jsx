import { useState } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const COLOR = {
  green:  "bg-emerald-500 hover:bg-emerald-600 text-white",
  red:    "bg-rose-500   hover:bg-rose-600   text-white",
  blue:   "bg-sky-500    hover:bg-sky-600    text-white",
  orange: "bg-orange-500 hover:bg-orange-600 text-white",
  gray:   "border border-gray-200 text-gray-700 hover:bg-gray-50",
};

const resolve = (obj, path) =>
  String(path.split(".").reduce((o, k) => o?.[k], obj) ?? "—");

export default function DataTable({
  columns       = [],
  data          = [],
  actions       = [],
  isLoading     = false,
  emptyIcon     = null,
  emptyMessage  = "No records found.",
  searchable    = true,
  searchPlaceholder = "Search…",
  searchKeys    = [],
  pageSize      = 10,
}) {
  const [query,   setQuery]   = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page,    setPage]    = useState(1);

  /* ── search ── */
  const keys = searchKeys.length ? searchKeys : columns.map((c) => c.key);
  const filtered = query.trim()
    ? data.filter((row) =>
        keys.some((k) =>
          resolve(row, k).toLowerCase().includes(query.toLowerCase())
        )
      )
    : data;

  /* ── sort ── */
  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = resolve(a, sortKey);
        const bv = resolve(b, sortKey);
        const cmp = av.localeCompare(bv, undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  /* ── paginate ── */
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paged      = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(col.key); setSortDir("asc"); }
    setPage(1);
  };

  const onSearch = (e) => { setQuery(e.target.value); setPage(1); };

  /* ── pagination page numbers ── */
  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1).reduce(
    (acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
      if (
        p === 1 || p === totalPages || Math.abs(p - safePage) <= 1
      ) acc.push(p);
      return acc;
    },
    []
  );

  return (
    <div className="space-y-3">
      {/* toolbar */}
      {searchable && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={onSearch}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#D7490C]/25 focus:border-[#D7490C] transition"
            />
          </div>
          <span className="text-xs text-gray-400">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : {}}
                  onClick={() => toggleSort(col)}
                  className={[
                    "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider",
                    "text-gray-500 select-none whitespace-nowrap",
                    col.sortable ? "cursor-pointer hover:text-gray-800" : "",
                  ].join(" ")}
                >
                  {col.label}
                  {col.sortable && (
                    <span className="ml-1 inline-flex flex-col -mb-1">
                      <ChevronUp
                        className={`w-2.5 h-2.5 ${
                          sortKey === col.key && sortDir === "asc"
                            ? "text-[#D7490C]"
                            : "text-gray-300"
                        }`}
                      />
                      <ChevronDown
                        className={`w-2.5 h-2.5 -mt-0.5 ${
                          sortKey === col.key && sortDir === "desc"
                            ? "text-[#D7490C]"
                            : "text-gray-300"
                        }`}
                      />
                    </span>
                  )}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length ? 1 : 0)}
                  className="py-20 text-center"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-[#D7490C] mx-auto" />
                  <p className="mt-3 text-sm text-gray-400">Loading…</p>
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length ? 1 : 0)}
                  className="py-20 text-center text-gray-400"
                >
                  {emptyIcon && (
                    <div className="flex justify-center mb-3 opacity-30">{emptyIcon}</div>
                  )}
                  <p className="text-sm">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={row._id ?? row.id ?? i}
                  className="border-b border-gray-100 last:border-0 hover:bg-orange-50/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700 align-middle">
                      {col.render ? col.render(row) : resolve(row, col.key)}
                    </td>
                  ))}

                  {actions.length > 0 && (
                    <td className="px-4 py-3 text-right align-middle">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {actions
                          .filter((a) => !a.hidden?.(row))
                          .map((action, ai) => {
                            const disabled = action.disabled?.(row) ?? false;
                            const loading  = action.loading?.(row)  ?? false;
                            return (
                              <button
                                key={ai}
                                onClick={() => !disabled && !loading && action.onClick(row)}
                                disabled={disabled || loading}
                                title={action.label}
                                className={[
                                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                                  "text-xs font-medium transition-all",
                                  COLOR[action.color] ?? COLOR.gray,
                                  disabled || loading ? "opacity-40 cursor-not-allowed" : "",
                                ].join(" ")}
                              >
                                {loading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  action.icon && (
                                    <span className="w-3.5 h-3.5 flex items-center">{action.icon}</span>
                                  )
                                )}
                                {action.label}
                              </button>
                            );
                          })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {!isLoading && sorted.length > pageSize && (
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span>
            {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} of{" "}
            {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNums.map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`} className="px-1 text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={[
                    "w-7 h-7 rounded font-medium transition",
                    p === safePage
                      ? "bg-[#D7490C] text-white shadow"
                      : "hover:bg-gray-100 text-gray-600",
                  ].join(" ")}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}