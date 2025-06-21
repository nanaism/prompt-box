"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Frontmatter, SavedPromptData } from "@/lib/markdown/types";
import { cn } from "@/lib/utils";
import { Clipboard, Star, Trash2 } from "lucide-react"; // Trash2アイコンをインポート
import { EvaluateResult } from "next-mdx-remote-client/rsc";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
// AlertDialogコンポーネントをインポート
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SavedPromptClientProps {
  mdxResult: EvaluateResult<Frontmatter>;
  promptId: string;
  promptData: SavedPromptData;
}

/**
 * 保存済みプロンプトの詳細表示・操作コンポーネント
 *
 * MDXコンテンツの表示、評価の変更、コピー、削除機能などを提供します。
 * クライアントサイドでの状態管理とAPI通信を担当します。
 */
export default function SavedPromptClient({
  mdxResult,
  promptId,
  promptData,
}: SavedPromptClientProps) {
  const { frontmatter: initialFrontmatter } = mdxResult;
  const [currentRating, setCurrentRating] = useState<number | null>(
    initialFrontmatter.rating
  );
  const [displayFrontmatter, setDisplayFrontmatter] =
    useState<Frontmatter>(initialFrontmatter);
  const [isDeleting, setIsDeleting] = useState(false); // 削除処理中の状態を追加
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setDisplayFrontmatter(initialFrontmatter);
    setCurrentRating(initialFrontmatter.rating);
  }, [initialFrontmatter]);

  const handleRatingChange = async (newRating: number) => {
    // ... (既存のコードは変更なし)
    if (newRating === currentRating) return;
    const oldRating = currentRating;
    setCurrentRating(newRating);
    setDisplayFrontmatter((prev) => ({ ...prev, rating: newRating }));
    try {
      const response = await fetch("/api/update-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: promptId, rating: newRating }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "評価の更新に失敗しました。");
      }
      const result = await response.json();
      if (result.isPreview) {
        toast.success("プレビュー評価更新", {
          description: "このデモでは実際のファイル更新は行われません。",
        });
      } else {
        toast.success("評価を更新しました。");
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (error: unknown) {
      setCurrentRating(oldRating);
      setDisplayFrontmatter((prev) => ({ ...prev, rating: oldRating }));
      if (error instanceof Error) {
        toast.error("評価エラー", { description: error.message });
      } else {
        toast.error("評価エラー", {
          description: "不明なエラーが発生しました。",
        });
      }
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptData.content);
    toast.success("クリップボードにコピーしました");
  };

  /**
   * プロンプトの削除処理
   *
   * 確認ダイアログで承認後、APIを呼び出してファイルを削除します。
   * 成功後は保存済みプロンプト一覧ページにリダイレクトします。
   */
  const handleDeletePrompt = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/delete-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: promptId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "プロンプトの削除に失敗しました。");
      }

      if (result.isPreview) {
        toast.info("プレビューモード", {
          description: result.message,
        });
        // プレビューモードではリダイレクトしない
        return;
      }

      toast.success("プロンプトを削除しました。");

      // 削除が成功したら、一覧ページに遷移する
      // このページ遷移により、一覧ページがサーバーで再レンダリングされ、
      // 最新のデータ（削除後のプロンプト一覧）が表示される
      router.push("/saved");

      // pushの後にrefreshを呼ぶことで、ブラウザのキャッシュを確実にクリアできますが、
      // このシナリオではpushだけで十分な場合が多いです。
      // もし一覧に戻ってもデータが古い場合のみ、以下の行を有効にしてください。
      // router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("削除エラー", { description: error.message });
      } else {
        toast.error("削除エラー", {
          description: "不明なエラーが発生しました。",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const FallbackComponent = () => (
    <div className="text-red-600">
      MDX Content rendering failed. Check console log in server component.
    </div>
  );

  const mdxError = mdxResult?.error;
  const mdxFrontmatter = mdxResult?.frontmatter;

  if (mdxError) {
    // ... (既存のコードは変更なし)
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded-md">
        <h3>MDXコンテンツの表示エラー</h3>
        <p>{mdxError.message || "不明なエラー"}</p>
        <pre className="mt-2 text-xs whitespace-pre-wrap bg-red-50 p-2 rounded">
          {mdxError.stack}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー部分 */}
      <div className="flex items-center justify-between">
        {/* ... (既存のコードは変更なし) */}
        <div>
          <h1 className="text-3xl font-bold">
            {displayFrontmatter.title ||
              (mdxFrontmatter?.title as string) ||
              "プロンプト"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            保存日:{" "}
            {new Date(
              (mdxFrontmatter?.createdAt as string) ||
                displayFrontmatter.createdAt
            ).toLocaleDateString()}{" "}
            | 元テンプレートID:{" "}
            {(mdxFrontmatter?.templateId as string) ||
              displayFrontmatter.templateId}
          </p>
        </div>
      </div>

      {/* メインコンテンツカード */}
      <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
        <div className="bg-white dark:bg-zinc-950 p-6">
          {/* プロンプト内容ヘッダーと星評価 */}
          <div className="flex items-center justify-between mb-4">
            {/* アクションボタン群 */}
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                className="rounded-full"
              >
                <Clipboard className="h-4 w-4 mr-2" />
                コピー
              </Button>

              {/* === ここからが追加部分 === */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      この操作は元に戻せません。プロンプト「
                      {displayFrontmatter.title}
                      」がサーバーから完全に削除されます。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      キャンセル
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeletePrompt}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      {isDeleting ? "削除中..." : "削除する"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {/* === ここまでが追加部分 === */}
            </div>

            {/* 星評価 */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <Button
                  key={starValue}
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRatingChange(starValue)}
                  className={cn(
                    "rounded-full h-7 w-7 p-0",
                    currentRating !== null && starValue <= currentRating
                      ? "text-amber-400 hover:text-amber-500"
                      : "text-zinc-300 hover:text-zinc-400 dark:text-zinc-600 dark:hover:text-zinc-500"
                  )}
                  aria-label={`Rate ${starValue} star${
                    starValue > 1 ? "s" : ""
                  }`}
                >
                  <Star
                    className={cn(
                      "h-5 w-5",
                      currentRating !== null &&
                        starValue <= currentRating &&
                        "fill-amber-400"
                    )}
                  />
                </Button>
              ))}
            </div>
          </div>

          {/* MDXコンテンツ表示エリア */}
          <div className="prose prose-zinc dark:prose-invert max-w-none bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 min-h-[200px]">
            <Suspense fallback={<FallbackComponent />}>
              {mdxResult.content}
            </Suspense>
          </div>
        </div>
      </Card>
    </div>
  );
}
