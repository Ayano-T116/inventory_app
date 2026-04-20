// src/state.js
export const state = {
  allRows: [],
  sortStateBySymbol: {},
  checkedIds: [],
  quantityChanges: [],
};

// export function clearCheckedIds() {
//   state.checkedIds = [];
// }

// export function setCheckedIds(ids) {
//   state.checkedIds = Array.isArray(ids) ? ids.map(String) : [];
// }

// export function getCheckedIds() {
//   return state.checkedIds;
// }

// export function isChecked(id) {
//   const sid = String(id || "");
//   return sid && state.checkedIds.includes(sid);
// }

// export function setChecked(id, nextChecked) {
//   const sid = String(id || "");
//   if (!sid) return;
//   if (nextChecked) {
//     if (!state.checkedIds.includes(sid)) state.checkedIds = [...state.checkedIds, sid];
//   } else {
//     state.checkedIds = state.checkedIds.filter((x) => x !== sid);
//   }
// }

// export function getQuantityChange(id) {
//   const sid = String(id || "");
//   if (!sid) return null;
//   return state.quantityChanges.find((x) => x.id === sid) || null;
// }

// export function setQuantityChange(id, quantity) {
//   const sid = String(id || "");
//   if (!sid) return;
//   state.quantityChanges = state.quantityChanges.filter((x) => x.id !== sid);
//   if (quantity == null) return;
//   state.quantityChanges = [...state.quantityChanges, { id: sid, quantity: Number(quantity) }];
// }

// export function clearQuantityChanges() {
//   state.quantityChanges = [];
// }


// export function getSortedRows(symbol, rows) {
//   const stateForSymbol = state.sortStateBySymbol[symbol];
//   if (!stateForSymbol || stateForSymbol.direction === "none") return [...rows];
//   const dir = stateForSymbol.direction === "asc" ? 1 : -1;
//   return [...rows].sort((left, right) => {
//     // compareValues を helpers や別関数から使う
//   });
// }