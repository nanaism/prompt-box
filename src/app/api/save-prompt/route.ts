// src/app/api/save-prompt/route.ts

import { createClient } from "@/lib/supabase/server";
import matter from "gray-matter";
import { revalidatePath } from "next/cache"; // ★ revalidatePathをインポート
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

    const { data: frontmatter, content: mdxContent } = matter(content);

    if (!frontmatter.title || !frontmatter.templateId) {
      return NextResponse.json(
        { message: "Title and templateId in frontmatter are required" },
        { status: 400 }
      );
    }

    const { data: insertedData, error } = await supabase
      .from("prompts")
      .insert({
        title: frontmatter.title,
        created_at: frontmatter.createdAt || new Date().toISOString(),
        rating: frontmatter.rating || null,
        content: mdxContent,
        template_id: frontmatter.templateId,
      })
      .select()
      .single(); // ★ .select().single() を追加して挿入したデータを取得

    if (error) {
      console.error("Error saving prompt to Supabase:", error);
      throw error;
    }

    // ★ --- ここからが重要な追加部分 --- ★
    // 関連するページのキャッシュを無効化
    revalidatePath("/saved"); // サイドバーを含むレイアウト
    if (insertedData) {
      // 新しく作られた詳細ページのキャッシュも無効化
      revalidatePath(`/saved/${insertedData.id}`);
    }
    // ★ --- ここまで --- ★

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
