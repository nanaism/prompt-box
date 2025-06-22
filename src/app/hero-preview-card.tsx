"use client"; // ★ このコンポーネントをクライアントコンポーネントとしてマーク

import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Check, Copy, Save } from "lucide-react";
import { useState } from "react";
import { Toaster, toast } from "sonner"; // ★ トースト通知ライブラリをインポート

export default function HeroPreviewCard() {
  // --- 状態管理 ---
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- 定数定義 ---
  // 実際にコピー＆保存するプロンプトのテキスト
  const promptContent = `Reactについてのブログ記事を書いてください。
その際、以下のブログ記事作成ガイドに従って…`;

  // 保存時に使用するフロントマターを含むMDX文字列
  const mdxContent = `---
title: "Reactについてのブログ記事"
templateId: "blog-post"
createdAt: "${new Date().toISOString()}"
---
${promptContent}`;

  // --- イベントハンドラ ---

  // クリップボードにコピーする処理
  const handleCopy = () => {
    navigator.clipboard.writeText(promptContent).then(() => {
      setIsCopied(true);
      toast.success("プロンプトをコピーしました！");
      setTimeout(() => setIsCopied(false), 2000); // 2秒後に元に戻す
    });
  };

  // データベースに保存する処理
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/save-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: mdxContent }),
      });

      if (!response.ok) {
        throw new Error("サーバーとの通信に失敗しました。");
      }

      toast.success("プロンプトを履歴に保存しました！");
    } catch (error) {
      console.error(error);
      toast.error("保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Toasterコンポーネントを配置することで、toast通知が表示されるようになります */}
      <Toaster richColors position="top-right" />
      <Card className="w-[560px] rounded-xl pb-0 overflow-hidden border-0 shadow-xl bg-white">
        <div className="p-6 pb-0 flex flex-col gap-4">
          <div className="text-sm font-medium text-violet-600 bg-violet-50 px-3 py-1 rounded-full w-fit">
            ブログ記事の作成依頼
          </div>
          <h3 className="text-xl font-semibold">
            <span className="text-violet-600">{"{topic}"}</span>
            についてのブログ記事を書いてください。
            <br />
            その際、以下のブログ記事作成ガイドに従って…
          </h3>
          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
            <div className="text-xs text-zinc-500 mb-2">変数を入力</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">topic:</div>
                <div className="flex-1 bg-white rounded border border-zinc-200 px-2 py-1 text-sm">
                  React
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">url:</div>
                <div className="flex-1 bg-white rounded border border-zinc-200 px-2 py-1 text-sm">
                  https://qiita.com/oga_aiichiro
                </div>
              </div>
            </div>
          </div>
        </div>
        <CardFooter className="bg-violet-50 border-violet-100 pb-6 border-t">
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              {/* --- コピーボタン --- */}
              <Button
                size="sm"
                variant="outline"
                className="rounded-full flex gap-1 items-center"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {isCopied ? "コピー完了" : "コピー"}
              </Button>

              {/* --- 保存ボタン --- */}
              <Button
                size="sm"
                variant="outline"
                className="rounded-full flex gap-1 items-center"
                onClick={handleSave}
                disabled={isSaving} // 保存中は無効化
              >
                <Save className="h-4 w-4" />
                {isSaving ? "保存中..." : "履歴に保存"}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
