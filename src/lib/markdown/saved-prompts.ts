// ★ 修正点1: サーバークライアントではなく、パブリッククライアントをインポート
import type { SavedPromptData } from "@/lib/markdown/types";
import { supabase } from "@/lib/supabase/public-client";
// updatePromptRatingInDb のような書き込み処理はAPIルートで行うため、
// このファイルからはサーバークライアントへの依存をなくします。

export async function getSavedPromptIds(): Promise<string[]> {
  // ★ 修正点2: cookies()への依存を削除
  const { data, error } = await supabase.from("prompts").select("id");
  if (error) {
    console.error("Error reading saved prompt IDs:", error);
    return [];
  }
  return data.map((prompt) => prompt.id);
}

export async function getAllSavedPromptsMetadata(): Promise<
  Array<{ id: string; title: string; createdAt: string }>
> {
  // ★ 修正点2: cookies()への依存を削除
  const { data, error } = await supabase
    .from("prompts")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all saved prompts metadata:", error);
    return [];
  }

  return data.map((prompt) => ({
    id: prompt.id,
    title: prompt.title,
    createdAt: prompt.created_at,
  }));
}

export async function getSavedPromptData(
  id: string
): Promise<SavedPromptData | null> {
  // ★ 修正点2: cookies()への依存を削除
  const { data: prompt, error } = await supabase
    .from("prompts")
    .select("id, title, created_at, content, rating, template_id")
    .eq("id", id)
    .single();

  if (error || !prompt) {
    console.error(`Error parsing saved prompt ${id}:`, error);
    return null;
  }

  return {
    id: prompt.id,
    frontmatter: {
      title: prompt.title,
      createdAt: prompt.created_at,
      rating: prompt.rating,
      templateId: prompt.template_id,
    },
    content: prompt.content,
  };
}

// 注意: このファイルからDBへの書き込み関数は削除するのが望ましいです。
// 書き込み（評価の更新など）は、必ずAPIルート内でサーバークライアントを使って行ってください。
// この関数はビルドエラーとは直接関係ないので、一旦このままにしておきます。
export async function updatePromptRatingInDb(): Promise<boolean> {
  // この関数を呼び出すAPIルート側でクライアントを生成するため、ここでは何もしません。
  console.warn("updatePromptRatingInDb should be handled within an API route.");
  return false;
}
