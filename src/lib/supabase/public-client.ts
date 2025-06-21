import { createClient } from "@supabase/supabase-js";

// このクライアントはクッキーを扱わず、公開データを取得するためだけに使います。
// `@supabase/ssr`ではなく、基本的な`@supabase/supabase-js`を使います。
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
