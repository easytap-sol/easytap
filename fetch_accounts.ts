import { createClient } from "./src/utils/supabase/server";

async function run() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('chart_of_accounts').select('*');
  console.log(JSON.stringify(data, null, 2));
  if (error) console.error(error);
}

run();
