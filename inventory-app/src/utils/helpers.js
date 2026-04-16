

export function initHelpers({

}) {

    // 全角数字を半角に変換し、数字以外を削除する関数
    function normalizeIntegerText(text) {
        // 全角数字を半角へ
        const half = String(text || "").replace(/[０-９]/g, (ch) =>
            String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
        );
        // 数字以外を削除（小数点も削除）
        return half.replace(/[^0-9]/g, "");
    }

    // フォームデータから数値を読み取る関数
    function readNumber(formData, name) {
        const raw = formData.get(name);
        const n = Number.parseInt(String(raw), 10);
        if (Number.isNaN(n)) return null;
        return n;
    }

    // テキストとして整形する関数
    function formatMaterialText(row) {
        const sym = String(row.symbol || "").trim();
        const d = row.diameter == null ? "" : `${row.diameter}A`;
        const t = row.thickness == null ? "" : `${row.thickness}t`;
        const c = String(row.coating_type || "").trim();
        const dt = `${d}${t}`.trim();
        const left = [sym, dt].filter(Boolean).join(" ").trim();
        return [left, c].filter(Boolean).join(" ").trim();
    }


    return {
        normalizeIntegerText,
        readNumber,
        formatMaterialText
    };
}