import { supabase } from "./supabase.js";
import  { TABLE, TABLE_METAL} from "./utils/constants.js";


/**取得処理 */
    export async function getAllItems(tabName) {
      const tableName = tabName === "tabInsulation" ? TABLE : TABLE_METAL;
      const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order("updated_at", { ascending: false });

      return { data, error };
    }   

/**追加処理 */
export async function addItem(payload, tabName) {
  const tableName = tabName === "tabInsulation" ? TABLE : TABLE_METAL;
  const { error } = await supabase
    .from(tableName)
    .insert(payload);

  return { error };
}

/**削除処理 */
export async function deleteItem(ids, tabName) {
  const tableName = tabName === "tabInsulation" ? TABLE : TABLE_METAL;
  const { error } = await supabase
    .from(tableName)
    .delete()
    .in("id", ids);

  return { error };
}

/**更新処理 */
export async function updateItem(pl, tabName) {
  const tableName = tabName === "tabInsulation" ? TABLE : TABLE_METAL;
  const { error } = await supabase
    .from(tableName)
    .update(pl)
    .eq('id', pl.id);

  return { error };
}
