"use client";

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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Frontmatter, SavedPromptData } from "@/lib/markdown/types";
import { cn } from "@/lib/utils";
import { Check, Clipboard, Star, Trash2 } from "lucide-react";
import { EvaluateResult } from "next-mdx-remote-client/rsc";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { Toaster, toast } from "sonner";

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
  const router = useRouter();

  // --- 状態管理 ---
  const [currentRating, setCurrentRating] = useState<number | null>(
    initialFrontmatter.rating
  );
  const [displayFrontmatter, setDisplayFrontmatter] =
    useState<Frontmatter>(initialFrontmatter);
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, startTransition] = useTransition(); // 削除や更新などの遷移中に使う

  useEffect(() => {
    setDisplayFrontmatter(initialFrontmatter);
    setCurrentRating(initialFrontmatter.rating);
  }, [initialFrontmatter, promptId]); // promptIdも依存配列に追加すると、ページ遷移時により確実に状態がリセットされる

  // --- イベントハンドラ ---

  const handleRatingChange = async (newRating: number) => {
    if (newRating === currentRating || isPending) return;

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
      toast.success("評価を更新しました。");
    } catch (error: unknown) {
      // 失敗したらUIを元に戻す
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
    setIsCopied(true);
    toast.success("クリップボードにコピーしました");
    setTimeout(() => setIsCopied(false), 2000); // 2秒後にアイコンを元に戻す
  };

  const handleDeletePrompt = async () => {
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

      toast.success("プロンプトを削除しました。");

      // サーバーコンポーネントのデータを再取得し、UIをスムーズに更新
      startTransition(() => {
        router.refresh();
        // 削除後は一覧のトップページに戻す
        router.push("/saved");
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("削除エラー", { description: error.message });
      } else {
        toast.error("削除エラー", {
          description: "不明なエラーが発生しました。",
        });
      }
    }
  };

  // --- MDX表示関連 ---

  const FallbackComponent = () => (
    <div className="text-red-600">
      MDXコンテンツのレンダリングに失敗しました。サーバーコンソールのログを確認してください。
    </div>
  );

  if (mdxResult?.error) {
    return (
      <div className="text-red-500 p-4 border border-red-500 rounded-md">
        <h3>MDXコンテンツの表示エラー</h3>
        <p>{mdxResult.error.message || "不明なエラー"}</p>
        <pre className="mt-2 text-xs whitespace-pre-wrap bg-red-50 p-2 rounded">
          {mdxResult.error.stack}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-right" />
      {/* ヘッダー部分 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{displayFrontmatter.title}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            保存日:{" "}
            {new Date(displayFrontmatter.createdAt).toLocaleDateString()} |
            元テンプレートID: {displayFrontmatter.templateId}
          </p>
        </div>
      </div>

      {/* メインコンテンツカード */}
      <Card className="rounded-xl border-0 shadow-sm overflow-hidden">
        <div className="bg-white dark:bg-zinc-950 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                className="rounded-full"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Clipboard className="h-4 w-4 mr-2" />
                )}
                {isCopied ? "コピー完了" : "コピー"}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full"
                    disabled={isPending}
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
                    <AlertDialogCancel disabled={isPending}>
                      キャンセル
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeletePrompt}
                      disabled={isPending}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      {isPending ? "削除中..." : "削除する"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <Button
                  key={starValue}
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRatingChange(starValue)}
                  disabled={isPending}
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
