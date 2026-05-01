import { state } from "../utils/state.js";
import { helpers } from "../utils/helpers.js";

/** ソート状態を見てテーブル内の表示順を調整 */
export function getSortedRows(symbol, rows) {
  const sortState = state.sortStateBySymbol[symbol];
  if (!sortState || sortState.direction === "none") return [...rows];
  const dir = sortState.direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    return helpers.compareValues(left[sortState.key], right[sortState.key], sortState.key) * dir;
  });
}

/** symbol ごとにまとめる (記号:[]),(記号:[]),...の形にしてる*/
export function groupBySymbol(rows) {
  const map = new Map();
  for (const row of rows) {
    const sym = row.symbol == null ? "" : String(row.symbol);
    if (!map.has(sym)) map.set(sym, []);
    map.get(sym).push(row);
  }
  return map;
}