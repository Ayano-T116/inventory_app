import { supabase } from "./supabase.js";
import  { TABLE} from "./utils/constants.js";


/**取得処理 */
    export async function getAllItems() {
      
      const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("updated_at", { ascending: false });

      return { data, error };
    }   

/**追加処理 */
export async function addItem(payload) {
  const { error } = await supabase
    .from(TABLE)
    .insert(payload);

  return { error };
}

/**削除処理 */
export async function deleteItem(ids) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .in("id", ids);

  return { error };
}

/**更新処理 */
export async function updateItem(pl) {
  const { error } = await supabase
    .from(TABLE)
    .update(pl)
    .eq('id', pl.id);

  return { error };
}
