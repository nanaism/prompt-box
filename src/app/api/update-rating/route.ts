import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"; // revalidatePathをインポート
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // プレビューガード
  if (process.env.VERCEL_ENV === "preview") {
    return NextResponse.json(
      { message: "プレビュー環境では更新できません。" },
      { status: 200 }
    );
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { id, rating } = await request.json();

    if (!id || typeof rating !== "number") {
      return NextResponse.json(
        { message: "Invalid ID or rating" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("prompts")
      .update({ rating: rating })
      .eq("id", id);

    if (error) {
      console.error("Error updating rating:", error);
      return NextResponse.json(
        { message: "Failed to update rating" },
        { status: 500 }
      );
    }

    // ★ 修正点: 評価を更新したページのキャッシュを無効化する
    // これにより、次にページを訪れた際に最新の評価が反映される
    revalidatePath(`/saved/${id}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in update-rating handler:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
