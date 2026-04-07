import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 仮の値でOKです。実際のSupabaseプロジェクト値に置き換えてください。
export const SUPABASE_URL = "https://aupzvtdbxdovjtdifexg.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_3GvcH8mSdauJSfDOIyG46g_iysSQ0aW";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
