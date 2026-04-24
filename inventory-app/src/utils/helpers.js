
/** 共通関数 */

// 全角数字を半角に変換し、数字以外を削除する
function normalizeIntegerText(text) {
    // 全角数字を半角へ
    const half = String(text || "").replace(/[０-９]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    );
    // 数字以外を削除（小数点も削除）
    return half.replace(/[^0-9]/g, "");
}

// フォームデータから数値を読み取る
function readNumber(formData, name) {
    const raw = formData.get(name);
    const n = Number.parseInt(String(raw), 10);
    if (Number.isNaN(n)) return null;
    return n;
}

// テキストとして整形する
function formatMaterialText(row) {
    const sym = String(row.symbol || "").trim();
    const d = row.diameter == null ? "" : `${row.diameter}A`;
    const t = row.thickness == null ? "" : `${row.thickness}t`;
    const c = String(row.coating_type || "").trim();
    const dt = `${d}${t}`.trim();
    const left = [sym, dt].filter(Boolean).join(" ").trim();
    return [left, c].filter(Boolean).join(" ").trim();
}

//IDを文字列化する
function toId(value) {
  return value === null || value === undefined ? "" : String(value);
}

//更新日時を整形する
function formatValue(key, value) {
  if (value === null || value === undefined) return "";

  if (key === "updated_at") {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);

    const formattedDate =
      `${d.getFullYear()}/` +
      `${String(d.getMonth() + 1).padStart(2, '0')}/` +
      `${String(d.getDate()).padStart(2, '0')}`;

    return formattedDate;
  }

  return String(value);
}

//値を比較する
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


/**関数をexport(他ファイルから使用できるようにする) */

export const helpers = {
    normalizeIntegerText,
    readNumber,
    formatMaterialText,
    toId,
    formatValue,
    compareValues,
};
