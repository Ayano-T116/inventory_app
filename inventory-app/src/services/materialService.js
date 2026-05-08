import { addItem, deleteItem, updateItem } from "../db.js";
import { helpers } from "../utils/helpers.js";
import { state, useState } from "../utils/state.js";




/**新規登録ダイアログ関連のロジック */

//登録情報作成
export function createPayload(fd, tabName) {
    if (tabName === "tabInsulation") {
        const payload = {
            symbol: String(fd.get("symbol") || "").trim(),
            diameter: helpers.readNumber(fd, "diameter"),
            thickness: helpers.readNumber(fd, "thickness"),
            coating_type: String(fd.get("coating_type") || "").trim(),
            quantity: helpers.readNumber(fd, "quantity"),
        };
        return payload;
    } else {
        const payload = {
            symbol: String(fd.get("symbol") || "").trim(),
            gauge: helpers.readNumber(fd, "gauge"),
            color: String(fd.get("color") || "").trim(),
            quantity: helpers.readNumber(fd, "quantity"),
        };
        return payload;
    }
}


//DB登録処理
export async function insertMaterial(allRows, payload, tabName) {

    if (!payload.symbol) {
        throw new Error("symbol は必須です。");
    }

    if (tabName === "tabInsulation") {
        if (payload.diameter === null || payload.thickness === null || payload.quantity === null) {
            throw new Error("diameter / thickness / quantity は数値で入力してください。");
        }
        if (isDuplicate(allRows, payload, tabName)) {
            throw new Error("重複エラー");
        }
    } else {
        if (payload.gauge === null) {
            throw new Error("gaugeは英数字で入力してください。");
        }
        if (payload.quantity === null) {
            throw new Error("quantity は数値で入力してください。");
        }
        if (isDuplicate(allRows, payload, tabName)) {
            console.log(isDuplicate(allRows, payload, tabName));
            throw new Error("重複エラー");
        }
    }

    const { error } = await addItem(payload, state.tabName);
    if (error) {
        alert("データを登録できませんでした。");
        throw error;
    }
}

//重複登録を防ぐためのチェック
function isDuplicate(allRows, payload, tabName) {
    if (tabName === "tabInsulation") {
        return allRows.some(row => row.symbol === payload.symbol
            && row.diameter === payload.diameter
            && row.thickness === payload.thickness
            && (row.coating_type ?? "") === (payload.coating_type ?? ""));
    } else {
        return allRows.some(row => row.symbol === payload.symbol
            && row.gauge === payload.gauge
            && row.color === payload.color)
    }
}


/**削除ダイアログ関連のロジック */

//削除情報作成
export function createSelectedData(allRows, checkedIds) {
    return allRows.filter((r) => checkedIds.includes(helpers.toId(r.id)));
}

//DB削除処理
export async function deleteMaterialsByIds(ids) {
    if (!ids.length)
        throw new Error("削除対象がありません。");

    const { error } = await deleteItem(ids, state.tabName);
    if (error) {
        alert("データを削除できませんでした。");
        throw error;
    }
}


/**数量変更ダイアログ関連のロジック */

//数量変更情報の作成
export function createQuantityChangeData(allRows, quantityChanges) {
    const items = quantityChanges
        .map((ch) => {
            const row = allRows.find((r) => helpers.toId(r.id) === ch.id);
            if (!row) return null;
            return {
                row,
                before: row.quantity == null ? "" : String(row.quantity),
                after: String(ch.quantity),
            };
        })
        .filter(Boolean);
    return items;
}

//DB更新処理
export async function updateMaterialsQuantity(allRows, quantityChanges) {

    if (!quantityChanges.length)
        throw new Error("更新対象がありません。");

    const existing = new Set(allRows.map((r) => helpers.toId(r.id)));
    const payload = quantityChanges
        .filter((c) => existing.has(helpers.toId(c.id)))
        .map(({ id, quantity }) => ({
            id,
            quantity,
        }));

    if (!payload.length) {
        throw new Error("更新対象が見つかりません。");
    }

    quantityChanges = quantityChanges.filter((c) =>
        existing.has(helpers.toId(c.id))
    );


    for (const pl of payload) {
        const { error } = await updateItem(pl, state.tabName);
        if (error) {
            alert("データを更新できませんでした。");
            throw error;
        }
    }
}