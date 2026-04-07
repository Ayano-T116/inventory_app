import { supabase } from "./supabase.js";

const TABLE = "materials";

// UIの「coating-type」「updated-at」は、DB列名として coating_type / updated_at を想定
const COLUMNS = [
  { label: "symbol", key: "symbol" },
  { label: "diameter", key: "diameter" },
  { label: "thickness", key: "thickness" },
  { label: "coating-type", key: "coating_type" },
  { label: "quantity", key: "quantity", align: "num" },
  { label: "updated-at", key: "updated_at" },
];

const elTbody = document.getElementById("tbody");
const elStatus = document.getElementById("status");
const elHeaders = Array.from(document.querySelectorAll(".grid thead th[data-key]"));
const btnRefresh = document.getElementById("btnRefresh");
const btnAddRow = document.getElementById("btnAddRow");
const dialogAdd = document.getElementById("dialogAdd");
const formAdd = document.getElementById("formAdd");
const btnSubmitAdd = document.getElementById("btnSubmitAdd");
let allRows = [];
let sortState = { key: null, direction: "none" };

function setStatus(message, kind = "info") {
  if (!elStatus) return;
  elStatus.textContent = message || "";
  elStatus.dataset.kind = kind;
}

function formatValue(key, value) {
  if (value === null || value === undefined) return "";

  if (key === "updated_at") {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  }

  return String(value);
}

function compareValues(a, b, key) {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  if (key === "diameter" || key === "thickness" || key === "quantity") {
    return Number(a) - Number(b);
  }
  if (key === "updated_at") {
    return new Date(a).getTime() - new Date(b).getTime();
  }
  return String(a).localeCompare(String(b), "ja");
}

function getSortedRows(rows) {
  if (!sortState.key || sortState.direction === "none") return [...rows];

  const dir = sortState.direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    return compareValues(left[sortState.key], right[sortState.key], sortState.key) * dir;
  });
}

function updateHeaderSortMark() {
  for (const th of elHeaders) {
    const key = th.dataset.key;
    const mark = th.querySelector(".sortMark");
    th.classList.remove("sorted");
    if (!mark) continue;

    if (key !== sortState.key || sortState.direction === "none") {
      mark.textContent = "-";
      continue;
    }

    th.classList.add("sorted");
    mark.textContent = sortState.direction === "asc" ? "▲" : "▼";
  }
}

function rerenderWithSort() {
  const sorted = getSortedRows(allRows);
  renderRows(sorted);
  updateHeaderSortMark();
}

function renderRows(rows) {
  elTbody.innerHTML = "";

  if (!rows || rows.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = COLUMNS.length;
    td.className = "muted";
    td.textContent = "データがありません。右上の「新規行を追加」から登録できます。";
    tr.appendChild(td);
    elTbody.appendChild(tr);
    return;
  }

  for (const row of rows) {
    const tr = document.createElement("tr");

    for (const col of COLUMNS) {
      const td = document.createElement("td");
      td.classList.add("cell");
      td.tabIndex = 0; // Excelっぽく「セルを選択」できるようにする

      if (col.align === "num") td.classList.add("num");

      const v = formatValue(col.key, row[col.key]);

      if (col.key === "diameter" || col.key === "thickness") {
        const wrap = document.createElement("div");
        wrap.className = "unitCell";

        const valueSpan = document.createElement("span");
        valueSpan.textContent = v;

        const unitSpan = document.createElement("span");
        unitSpan.className = "unit";
        unitSpan.textContent = col.key === "diameter" ? "A" : "t";

        wrap.appendChild(valueSpan);
        wrap.appendChild(unitSpan);
        td.appendChild(wrap);
      } else {
        td.textContent = v;
      }

      tr.appendChild(td);
    }

    elTbody.appendChild(tr);
  }
}

async function fetchMaterials() {
  setStatus("読み込み中...");
  btnRefresh.disabled = true;

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("symbol,diameter,thickness,coating_type,quantity,updated_at")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    allRows = data;
    rerenderWithSort();
    setStatus(`表示件数: ${data.length}`);
  } catch (e) {
    console.error(e);
    setStatus(`エラー: ${e.message || e}`, "error");
    renderRows([]);
  } finally {
    btnRefresh.disabled = false;
  }
}

function openAddDialog() {
  if (!dialogAdd) return;
  formAdd.reset();
  dialogAdd.showModal();
  const first = formAdd.querySelector("input[name='symbol']");
  if (first) first.focus();
}

function readNumber(formData, name) {
  const raw = formData.get(name);
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  return n;
}

async function insertMaterial(payload) {
  setStatus("登録中...");
  btnSubmitAdd.disabled = true;
  btnAddRow.disabled = true;

  try {
    const { error } = await supabase.from(TABLE).insert(payload);
    if (error) throw error;

    setStatus("登録しました。再読み込みします...");
    dialogAdd.close();
    await fetchMaterials();
  } catch (e) {
    console.error(e);
    setStatus(`登録エラー: ${e.message || e}`, "error");
  } finally {
    btnSubmitAdd.disabled = false;
    btnAddRow.disabled = false;
  }
}

btnRefresh.addEventListener("click", () => {
  fetchMaterials();
});

for (const th of elHeaders) {
  const btn = th.querySelector(".thBtn");
  if (!btn) continue;

  btn.addEventListener("click", () => {
    const key = th.dataset.key;
    if (!key) return;

    if (sortState.key !== key) {
      sortState = { key, direction: "asc" };
    } else if (sortState.direction === "asc") {
      sortState = { key, direction: "desc" };
    } else if (sortState.direction === "desc") {
      sortState = { key: null, direction: "none" };
    } else {
      sortState = { key, direction: "asc" };
    }

    rerenderWithSort();
  });
}

btnAddRow.addEventListener("click", () => {
  openAddDialog();
});

formAdd.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const fd = new FormData(formAdd);
  const payload = {
    symbol: String(fd.get("symbol") || "").trim(),
    diameter: readNumber(fd, "diameter"),
    thickness: readNumber(fd, "thickness"),
    coating_type: String(fd.get("coating_type") || "").trim() || null,
    quantity: readNumber(fd, "quantity"),
  };

  // 超シンプルな入力チェック（初心者向けに最低限）
  if (!payload.symbol) {
    setStatus("symbol は必須です。", "error");
    return;
  }
  if (payload.diameter === null || payload.thickness === null || payload.quantity === null) {
    setStatus("diameter / thickness / quantity は数値で入力してください。", "error");
    return;
  }

  await insertMaterial(payload);
});

// 初期表示
fetchMaterials();
