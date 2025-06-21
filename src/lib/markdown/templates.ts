// ★ 修正点1: 新しく作ったパブリッククライアントをインポート
import { supabase } from "@/lib/supabase/public-client";
import type { Template, TemplateFrontmatter, TemplateVariable } from "./types";

export const getTemplateIds = async (): Promise<string[]> => {
  // ★ 修正点2: cookies()とサーバークライアントの作成を削除
  const { data, error } = await supabase.from("templates").select("id");

  if (error) {
    console.error("Error fetching template IDs:", error);
    return [];
  }
  return data.map((template) => template.id);
};

export const getTemplateData = async (
  id: string
): Promise<{ metadata: TemplateFrontmatter; content: string } | null> => {
  // ★ 修正点2: cookies()とサーバークライアントの作成を削除
  const { data, error } = await supabase
    .from("templates")
    .select("id, title, description, category, emoji, tags, variables, content")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error(`Error fetching template ${id}:`, error);
    return null;
  }

  const { content, ...metadata } = {
    id: data.id,
    title: data.title,
    description: data.description || "",
    category: data.category || undefined,
    emoji: data.emoji || undefined,
    tags: data.tags || [],
    variables: data.variables as TemplateVariable[],
    content: data.content,
  };
  return { metadata, content };
};

export const getAllTemplates = async (): Promise<Template[]> => {
  // ★ 修正点2: cookies()とサーバークライアントの作成を削除
  const { data, error } = await supabase
    .from("templates")
    .select(
      "id, title, description, category, emoji, tags, variables, content"
    );

  if (error) {
    console.error("Error fetching all templates:", error);
    return [];
  }

  return data.map((template) => ({
    id: template.id,
    title: template.title,
    description: template.description || "",
    category: template.category || undefined,
    emoji: template.emoji || undefined,
    tags: template.tags || [],
    variables: template.variables as TemplateVariable[],
    content: template.content,
  }));
};

export const getTemplatesMetadata = async (): Promise<
  TemplateFrontmatter[]
> => {
  // ★ 修正点2: cookies()とサーバークライアントの作成を削除
  const { data, error } = await supabase
    .from("templates")
    .select("id, title, description, category, emoji, tags, variables");

  if (error) {
    console.error("Error fetching templates metadata:", error);
    return [];
  }

  return data.map((template) => ({
    id: template.id,
    title: template.title,
    description: template.description || "",
    category: template.category || undefined,
    emoji: template.emoji || undefined,
    tags: template.tags || [],
    variables: template.variables as TemplateVariable[],
  }));
};
