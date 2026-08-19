import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY_1
);

const { data, error } = await supabase
  .from("keep_alive")
  .update({
    updated_at: new Date().toISOString(),
  })
  .eq("id", 1);

if (error) {
  console.error(error);
  process.exit(1);
}

console.log("Keep Alive Success");