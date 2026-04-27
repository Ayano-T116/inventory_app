import { addItem } from "../db.js";
import { helpers } from "../utils/helpers.js";


/**ダイアログ関連のロジック */

//登録情報作成
export function createPayload(fd) {
    const payload = {
        symbol: String(fd.get("symbol") || "").trim(),
        diameter: helpers.readNumber(fd, "diameter"),
        thickness: helpers.readNumber(fd, "thickness"),
        coating_type: String(fd.get("coating_type") || "").trim(),
        quantity: helpers.readNumber(fd, "quantity"),
    };
    return payload;
}


//DB登録処理
export async function insertMaterial(allRows, payload) {

    if (!payload.symbol) {
        throw new Error("symbol は必須です。");
    }
    
    if (payload.diameter === null || payload.thickness === null || payload.quantity === null) {
        throw new Error("diameter / thickness / quantity は数値で入力してください。");
    }

    if (isDuplicate(allRows, payload)) {
        throw new Error("重複エラー");
    }
    const { error } = await addItem(payload);
            if (error) {
                alert("データを登録できませんでした。");
                throw error;
            }
}


//重複登録を防ぐためのチェック
function isDuplicate(allRows, payload) {
    return allRows.some(row => row.symbol === payload.symbol
        && row.diameter === payload.diameter
        && row.thickness === payload.thickness
        && (row.coating_type ?? "") === (payload.coating_type ?? ""));
}
