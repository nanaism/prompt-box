import { createClient } from "@/lib/supabase/server";
import matter from "gray-matter";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      );
    }

    // gray-matterでフロントマターと本文をパース
    // dataが SavedPromptFrontmatter 型と互換性があることを期待
    const { data: frontmatter, content: mdxContent } = matter(content);

    // ★ `templateId` が存在するかチェック
    if (!frontmatter.title || !frontmatter.templateId) {
      return NextResponse.json(
        { message: "Title and templateId in frontmatter are required" },
        { status: 400 }
      );
    }

    // Supabaseのpromptsテーブルにデータを挿入
    const { error } = await supabase.from("prompts").insert({
      title: frontmatter.title,
      created_at: frontmatter.createdAt || new Date().toISOString(),
      rating: frontmatter.rating || null,
      content: mdxContent,
      // ★ `templateId` を `template_id` カラムに保存
      template_id: frontmatter.templateId,
    });

    if (error) {
      console.error("Error saving prompt to Supabase:", error);
      throw error;
    }

    return NextResponse.json(
      { message: "Prompt saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving prompt:", error);
    return NextResponse.json(
      { message: "Error saving prompt" },
      { status: 500 }
    );
  }
}
