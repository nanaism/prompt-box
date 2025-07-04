import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.IS_PREVIEW) {
    return NextResponse.json(
      {
        success: true,
        isPreview: true,
        message: "プレビューモードでは削除できません。",
      },
      { status: 200 }
    );
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { id } = await request.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "無効なIDです。" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("prompts").delete().eq("id", id);

    if (error) {
      console.error("プロンプトの削除中にエラーが発生しました:", error);
      return NextResponse.json(
        { success: false, message: "データベースエラーが発生しました。" },
        { status: 500 }
      );
    }

    // ★★★ ここがキャッシュを無効化する心臓部 ★★★
    revalidatePath("/saved");

    return NextResponse.json(
      { success: true, message: "プロンプトが正常に削除されました。" },
      { status: 200 }
    );
  } catch (error) {
    console.error("リクエスト処理中にエラーが発生しました:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
