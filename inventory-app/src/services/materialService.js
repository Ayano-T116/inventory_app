import { addItem, deleteItem } from "../db.js";
import { helpers } from "../utils/helpers.js";


/**新規登録ダイアログ関連のロジック */

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


/**削除ダイアログ関連のロジック */

//削除情報作成
export function createSelectedDate(allRows, checkedIds) {
    return allRows.filter((r) => checkedIds.includes(helpers.toId(r.id)));
}

//DB削除処理
export async function deleteMaterialsByIds(ids) {
    if (!ids.length) 
        throw new Error("削除対象がありません。");

    const { error } = await deleteItem(ids);
    if (error) {
        alert("データを削除できませんでした。");
        throw error;
    }
}
