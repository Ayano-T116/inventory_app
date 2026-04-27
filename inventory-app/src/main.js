import { COLUMNS, selectSymbols, ENV, prodMessage, devMessage } from "./utils/constants.js";
import { getAllItems, deleteItem, updateItem } from "./db.js";
import { helpers } from "./utils/helpers.js";
import { state, useState } from "./utils/state.js";
import { initAddDialog } from "./dialogs/addDialog.js";
import { initDeleteDialog } from "./dialogs/deleteDialog.js";
import { initQuantityDialog } from "./dialogs/quantityDialog.js";


const elGroupContainer = document.getElementById("groupContainer");
const elStatus = document.getElementById("status");
const btnRefresh = document.getElementById("btnRefresh");
const btnDelete = document.getElementById("btnDelete");
const btnAddRow = document.getElementById("btnAddRow");
const dialogAdd = document.getElementById("dialogAdd");
const formAdd = document.getElementById("formAdd");
const btnAddOk = document.getElementById("btnAddOk");
const btnAddCancel = document.getElementById("btnAddCancel");
const dialogDelete = document.getElementById("dialogDelete");
const formDelete = document.getElementById("formDelete");
const deleteSummary = document.getElementById("deleteSummary");
const deleteListBody = document.getElementById("deleteListBody");
const btnDeleteCancel = document.getElementById("btnDeleteCancel");
const btnDeleteOk = document.getElementById("btnDeleteOk");
const dialogQuantityChange = document.getElementById("dialogQuantityChange");
const formQuantityChange = document.getElementById("formQuantityChange");
const quantityChangeSummary = document.getElementById("quantityChangeSummary");
const quantityChangeListBody = document.getElementById("quantityChangeListBody");
const btnQuantityChangeCancel = document.getElementById("btnQuantityChangeCancel");
const btnQuantityChangeOk = document.getElementById("btnQuantityChangeOk");
const selectSymbol = document.getElementById("selectSymbol");
const subtitle = document.getElementById("subtitle");



/** 状態メッセージを設定 */
function setStatus(message, kind = "info") {
  if (!elStatus) return;
  elStatus.textContent = message || "";
  elStatus.dataset.kind = kind;
}


/** ソート状態を見てテーブル内の表示順を調整 */
function getSortedRows(symbol, rows) {
  const sortState = state.sortStateBySymbol[symbol];
  if (!sortState || sortState.direction === "none") return [...rows];
  const dir = sortState.direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    return helpers.compareValues(left[sortState.key], right[sortState.key], sortState.key) * dir;
  });
}

/** symbol ごとにまとめる (記号:[]),(記号:[]),...の形にしてる*/
function groupBySymbol(rows) {
  const map = new Map();
  for (const row of rows) {
    const sym = row.symbol == null ? "" : String(row.symbol);
    if (!map.has(sym)) map.set(sym, []);
    map.get(sym).push(row);
  }
  return map;
}

/** header行のソートマークを制御する */
function updateHeaderSortMark(sym, thead) {
  const headers = thead.querySelectorAll("th[data-key]");
  for (const th of headers) {
    const key = th.dataset.key;
    const mark = th.querySelector(".sortMark");
    th.classList.remove("sorted");
    if (!mark) continue;

    const sortState = state.sortStateBySymbol[sym];
    if (!sortState || key !== sortState.key || sortState.direction === "none") {
      mark.textContent = "-";
      continue;
    }

    th.classList.add("sorted");
    mark.textContent = sortState.direction === "asc" ? "▲" : "▼";
  }
}


/** ヘッダ行を作成する */
function createHeaderRow(sym) {
  const tr = document.createElement("tr");

  const thCheck = document.createElement("th");
  thCheck.className = "checkCell";
  thCheck.setAttribute("aria-label", "選択");
  thCheck.textContent = "選択";
  tr.appendChild(thCheck);

  for (const col of COLUMNS) {
    const th = document.createElement("th");
    th.dataset.key = col.key;
    if (col.align === "num") th.classList.add("num");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = col.align === "num" ? "thBtn thBtnNum" : "thBtn";

    const labelSpan = document.createElement("span");
    if (col.key === "diameter") {
      labelSpan.textContent = selectSymbols.find((item) => item.value === sym)?.diameterLabel;
    } else {
      labelSpan.textContent = col.label;
    }
    const markSpan = document.createElement("span");
    markSpan.className = "sortMark";
    markSpan.setAttribute("aria-hidden", "true");
    markSpan.textContent = "-";

    btn.appendChild(labelSpan);
    btn.appendChild(markSpan);
    th.appendChild(btn);
    tr.appendChild(th);
  }

  return tr;
}


/** セルを作成する */
function appendCells(tr, row) {

  const tdCheck = document.createElement("td");
  tdCheck.className = "checkCell";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.className = "rowCheck";
  cb.checked = useState.isChecked(row["id"]);
  cb.setAttribute("aria-label", "この行を選択");
  cb.dataset.id = helpers.toId(row["id"]);
  tdCheck.appendChild(cb);
  tdCheck.style.cursor = "pointer";
  tdCheck.addEventListener("click", (e) => {
    // 既にチェックボックス自身がクリックされた場合は何もしない
    if (e.target.closest("input[type='checkbox']")) return;
    cb.click();
  });
  tr.appendChild(tdCheck);

  for (const col of COLUMNS) {
    const td = document.createElement("td");
    td.classList.add("cell");
    td.tabIndex = 0;
    if (col.align === "num") td.classList.add("num");
    if (col.key === "quantity") td.dataset.editable = "quantity";

    //更新日時を整形する
    const v = helpers.formatValue(col.key, row[col.key]);

    if (col.key === "diameter" || col.key === "thickness") {
      const wrap = document.createElement("div");
      wrap.className = "unitCell";
      const valueSpan = document.createElement("span");
      valueSpan.textContent = v;
      const unitSpan = document.createElement("span");
      unitSpan.className = "unit";
      if (col.key === "diameter") {
        unitSpan.textContent = selectSymbols.find((item) => item.value === row.symbol)?.diameterSuffix || "A";
      } else {
        unitSpan.textContent = "t";
      }
      wrap.appendChild(valueSpan);
      wrap.appendChild(unitSpan);
      td.appendChild(wrap);
    } else if (col.key === "quantity") {
      const pending = useState.getQuantityChange(row.id);
      if (pending) td.classList.add("cellQuantityChanged");
      td.textContent = pending ? String(pending.quantity) : v;
    } else {
      td.textContent = v;
    }

    tr.appendChild(td);
  }
}


/** symbolごとにテーブルを作成する */
function renderGroups() {
  elGroupContainer.innerHTML = "";

  if (!state.allRows.length) {
    const p = document.createElement("p");
    p.className = "muted emptyHint";
    p.textContent = "データがありません。右上の「新規行を追加」から登録できます。";
    elGroupContainer.appendChild(p);
    return;
  }

  // symbol ごとにまとめる (記号:[]),(記号:[]),...という形のmapにしてる
  const bySymbol = groupBySymbol(state.allRows);
  //記号はあいうえお順にしてる
  const symbols = [...bySymbol.keys()].sort((a, b) => a.localeCompare(b, "ja"));

  // 記号ごとにテーブル作成処理
  for (const sym of symbols) {
    //mapの内容に入ってた[]を取り出す
    const rowsInGroup = getSortedRows(sym, bySymbol.get(sym));

    if (!state.isCollapsedBySymbol[sym]) {
      state.isCollapsedBySymbol[sym] = false;
    }

    const section = document.createElement("section");
    section.className = "groupBlock";
    section.setAttribute("data-symbol", sym);

    const titleRow = document.createElement("div");
    titleRow.className = "groupTitleRow";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "groupToggle";
    toggleBtn.textContent = state.isCollapsedBySymbol[sym] ? "＋" : "ー";;

    toggleBtn.setAttribute("aria-expanded", state.isCollapsedBySymbol[sym]);
    toggleBtn.setAttribute("aria-label", "テーブルの表示を切り替え");

    const title = document.createElement("h2");
    title.className = "groupTitle";
    title.textContent = sym || "（記号なし）";

    const count = document.createElement("span");
    count.className = "groupCount";
    count.textContent = `${rowsInGroup.length}件`;

    const innerWrap = document.createElement("div");
    innerWrap.className = "tableWrap groupTableWrap";

    const table = document.createElement("table");
    table.className = state.isCollapsedBySymbol[sym] ? "grid isCollapsed" : "grid";

    toggleBtn.addEventListener("click", () => {
      state.isCollapsedBySymbol[sym] = table.classList.toggle("isCollapsed");
      toggleBtn.textContent = state.isCollapsedBySymbol[sym] ? "＋" : "ー";
      toggleBtn.setAttribute("aria-expanded", state.isCollapsedBySymbol[sym]);
    });

    const thead = document.createElement("thead");
    thead.appendChild(createHeaderRow(sym));

    //1行ずつ作成
    const tbody = document.createElement("tbody");
    for (const row of rowsInGroup) {
      const tr = document.createElement("tr");
      tr.dataset.id = row["id"];
      appendCells(tr, row);
      tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    innerWrap.appendChild(table);
    titleRow.appendChild(toggleBtn);
    titleRow.appendChild(title);
    titleRow.appendChild(count);
    section.appendChild(titleRow);
    section.appendChild(innerWrap);
    elGroupContainer.appendChild(section);

    //カラム名行のソートマークの表示
    updateHeaderSortMark(sym, thead);

  }
}


//DBデータ取得以外の描画処理※ソートから使用
function rerenderWithSort() {
  renderGroups();
}


/** 毎回呼ばれる最初の処理 */
async function fetchMaterials() {
  setStatus("読み込み中...");
  btnRefresh.disabled = true;
  if (btnDelete) btnDelete.disabled = true;

  try {
    //DBからデータ取得
    const { data, error } = await getAllItems();
    if (error) {
      alert("データを取得できませんでした。");
      throw error;
    }

    //画面表示
    state.allRows = data || [];
    // 既に存在しないIDは除外（削除後など）
    const existing = new Set(state.allRows.map((r) => helpers.toId(r.id)));
    state.checkedIds = state.checkedIds.filter((id) => existing.has(id));
    state.quantityChanges = state.quantityChanges.filter((c) =>
      existing.has(helpers.toId(c.id))
    );
    btnDelete.disabled = useState.updateDeleteButtonState();
    btnRefresh.disabled = useState.updateRefreshButtonState();
    rerenderWithSort();
    setStatus("");
    if (ENV === "prod") {
      subtitle.textContent = prodMessage;
    } else {
      subtitle.textContent = devMessage;
    }
  } catch (e) {
    console.error(e);
    setStatus(`エラー: ${e.message || e}`, "error");
    state.allRows = [];
    renderGroups();
  } finally {
    btnRefresh.disabled = useState.updateRefreshButtonState();
    btnDelete.disabled = useState.updateDeleteButtonState();
  }
}


/** 数量セルの値を変更する時の処理 */
function openQuantityCellEditor(td, row) {
  if (!td || !row) return;

  const id = helpers.toId(row.id);
  const original =
    row.quantity == null ? null : Number.parseInt(String(row.quantity), 10);
  const pending = useState.getQuantityChange(row.id);
  const start = pending ? pending.quantity : original;
  const fixedWidth = `${Math.ceil(td.getBoundingClientRect().width)}px`;
  td.style.width = fixedWidth;
  td.style.minWidth = fixedWidth;
  td.style.maxWidth = fixedWidth;

  const restoreCellWidth = () => {
    td.style.width = "";
    td.style.minWidth = "";
    td.style.maxWidth = "";
  };

  td.innerHTML = "";

  const input = document.createElement("input");
  input.className = "quantityEditor";
  input.type = "text";
  input.setAttribute("inputmode", "numeric");
  input.autocomplete = "off";
  input.value = start == null ? "" : String(start);

  td.appendChild(input);
  input.focus();
  input.select();

  const setCellChangedClass = (isChanged) => {
    td.classList.toggle("cellQuantityChanged", isChanged);
  };

  const syncStateFromValue = () => {
    const normalized = helpers.normalizeIntegerText(input.value);
    if (input.value !== normalized) input.value = normalized;

    if (normalized === "") {
      btnRefresh.disabled = useState.setQuantityChange(id, null);
      setCellChangedClass(false);
      return;
    }

    const next = Number.parseInt(normalized, 10);
    if (Number.isNaN(next)) {
      btnRefresh.disabled = useState.setQuantityChange(id, null);
      setCellChangedClass(false);
      return;
    }

    if (original != null && next === original) {
      btnRefresh.disabled = useState.setQuantityChange(id, null);
      setCellChangedClass(false);
      return;
    }

    btnRefresh.disabled = useState.setQuantityChange(id, next);
    setCellChangedClass(true);
  };

  input.addEventListener("input", () => {
    syncStateFromValue();
  });

  let committed = false;
  const commitAndExit = () => {
    if (committed) return;
    committed = true;

    const normalized = helpers.normalizeIntegerText(input.value);

    if (normalized === "") {
      btnRefresh.disabled = useState.setQuantityChange(id, null);
      setCellChangedClass(false);
      td.innerHTML = "";
      td.textContent = original == null ? "" : String(original);
      restoreCellWidth();
      return;
    }

    const next = Number.parseInt(normalized, 10);
    const isOriginal = original != null && next === original;

    if (isOriginal) {
      btnRefresh.disabled = useState.setQuantityChange(id, null);
      setCellChangedClass(false);
    } else {
      btnRefresh.disabled = useState.setQuantityChange(id, next);
      setCellChangedClass(true);
    }

    td.innerHTML = "";
    td.textContent = isOriginal
      ? original == null
        ? ""
        : String(original)
      : String(next);
    restoreCellWidth();
  };

  input.addEventListener("blur", commitAndExit);

  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      input.blur();
      return;
    }

    if (ev.key === "Escape") {
      ev.preventDefault();
      committed = true;

      const revert = start;
      const revertIsOriginal = original != null && revert === original;

      if (revertIsOriginal || revert == null) {
        btnRefresh.disabled = useState.setQuantityChange(id, null);
        setCellChangedClass(false);
        td.innerHTML = "";
        td.textContent = original == null ? "" : String(original);
        restoreCellWidth();
      } else {
        btnRefresh.disabled = useState.setQuantityChange(id, revert);
        setCellChangedClass(true);
        td.innerHTML = "";
        td.textContent = String(revert);
        restoreCellWidth();
      }
    }
  });
}

/** イベント系 */

/** ソート関連の処理 */

//カラム名押下処理
elGroupContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".thBtn");
  if (!btn || !elGroupContainer.contains(btn)) return;

  const th = btn.closest("th[data-key]");
  if (!th) return;

  // どの記号(section)のthが押されたかを取得
  const section = th.closest("section[data-symbol]");
  const symbol = section ? section.dataset.symbol : undefined;
  if (symbol === undefined) return;

  const key = th.dataset.key;
  if (!key) return;

  //symbolごと、カラムごとにソート状態を設定
  const current = state.sortStateBySymbol[symbol] || { key: null, direction: "none" };
  let newSortState;
  if (current.key !== key) {
    newSortState = { key, direction: "asc" };
  } else if (current.direction === "asc") {
    newSortState = { key, direction: "desc" };
  } else if (current.direction === "desc") {
    newSortState = { key, direction: "none" };
  } else {
    newSortState = { key, direction: "asc" };
  }

  state.sortStateBySymbol[symbol] = newSortState;
  rerenderWithSort();
});



/** 新規登録ダイアログ関連の処理 */

//新規登録ボタン押下処理
if (btnAddRow) {
  btnAddRow.addEventListener("click", () => {
    openAddDialog();
  });
}

// 登録ダイアログを閉じたときは入力内容をリセットする
dialogAdd.addEventListener("close", () => {
  formAdd.reset();
});

/** 削除ダイアログ関連の処理 */

// 行チェックON/OFF
elGroupContainer.addEventListener("change", (e) => {
  const cb = e.target.closest("input.rowCheck");
  if (!cb || !elGroupContainer.contains(cb)) return;
  const id = cb.dataset.id;
  useState.setChecked(id, cb.checked);
  btnDelete.disabled = useState.updateDeleteButtonState();
});

//削除ボタン押下処理
if (btnDelete) {
  btnDelete.addEventListener("click", () => {
    if (!state.checkedIds.length) return;
    openDeleteDialog();
  });
}


/** 数量変更ダイアログ関連の処理 */

// 数量セルのクリックで編集inputへ置換
elGroupContainer.addEventListener("click", (e) => {
  const td = e.target.closest("td[data-editable='quantity']");
  if (!td || !elGroupContainer.contains(td)) return;
  if (td.querySelector("input.quantityEditor")) return;

  const tr = td.closest("tr[data-id]");
  if (!tr) return;

  const id = helpers.toId(tr.dataset.id);
  const row = state.allRows.find((r) => helpers.toId(r.id) === id);
  if (!row) return;

  openQuantityCellEditor(td, row);
  btnRefresh.disabled = useState.updateRefreshButtonState();
});

//更新ボタン押下処理
btnRefresh.addEventListener("click", async () => {
  const activeEditor = elGroupContainer.querySelector("input.quantityEditor");
  if (activeEditor) activeEditor.blur();

  if (state.quantityChanges.length) {
    openQuantityChangeDialog();
    return;
  }
  fetchMaterials();
});

/** ダイアログ関連初期化 */

const { openAddDialog } = initAddDialog({
  dialogAdd,
  formAdd,
  btnAddOk,
  btnAddCancel,
  btnAddRow,
  btnDelete,
  btnRefresh,
  setStatus,
  fetchMaterials,
  selectSymbol,
});

const { openDeleteDialog } = initDeleteDialog({
  dialogDelete,
  deleteListBody,
  deleteSummary,
  formDelete,
  btnDeleteOk,
  btnDeleteCancel,
  btnAddRow,
  btnDelete,
  btnRefresh,
  setStatus,
  fetchMaterials,
});

const { openQuantityChangeDialog } = initQuantityDialog({
  dialogQuantityChange,
  quantityChangeListBody,
  quantityChangeSummary,
  btnQuantityChangeOk,
  btnQuantityChangeCancel,
  btnAddRow,
  btnDelete,
  btnRefresh,
  setStatus,
  fetchMaterials,
});


/** 本処理初期化 ここからスタート */
btnDelete.disabled = useState.updateDeleteButtonState();
btnRefresh.disabled = useState.updateRefreshButtonState();
fetchMaterials();
