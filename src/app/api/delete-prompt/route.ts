import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request: Request) {
  // デモ環境でのファイル削除を防ぐためのガード
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

  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "無効なIDです。" },
        { status: 400 }
      );
    }

    // ファイル名のサニタイズ (基本的なパス トラバーサル攻撃を防ぐ)
    if (id.includes("/") || id.includes("..")) {
      return NextResponse.json(
        { success: false, message: "不正なファイル名です。" },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), "_data", "saved", `${id}.md`);

    // ファイルの存在を確認してから削除
    await fs.unlink(filePath);

    return NextResponse.json(
      { success: true, message: "プロンプトが正常に削除されました。" },
      { status: 200 }
    );
  } catch (error) {
    // ★ 修正点1: `any`を削除。これでerrorは `unknown` 型になります。
    console.error("プロンプトの削除中にエラーが発生しました:", error);

    // ★ 修正点2: 型ガードを追加
    // errorがオブジェクトであり、'code'プロパティを持ち、その値が'ENOENT'か安全にチェックします。
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return NextResponse.json(
        { success: false, message: "指定されたプロンプトが見つかりません。" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
