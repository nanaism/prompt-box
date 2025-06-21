import { compileMdx } from "@/lib/markdown/mdx-utils";
import {
  getSavedPromptData,
  getSavedPromptIds,
} from "@/lib/markdown/saved-prompts";
import { notFound } from "next/navigation";
import SavedPromptClient from "./_components/saved-prompt-client";

/**
 * 個別の保存済みプロンプト表示ページ
 *
 * URLパラメータのIDに基づいてプロンプトデータを取得し、
 * MDXコンテンツをコンパイルしてクライアントコンポーネントに渡します。
 */
// ★ 修正点1: paramsの型を正しくする
export default async function SavedPromptPage({
  params,
}: {
  params: { id: string };
}) {
  // ★ 修正点2: paramsはPromiseではないのでawaitは不要
  const promptId = params.id;
  const promptData = await getSavedPromptData(promptId);

  // プロンプトが存在しない場合は404ページを表示
  if (!promptData) {
    notFound();
  }

  // MDXコンテンツのコンパイル
  // 注意: compileMdxが内部でfsを使っている場合、ここもSupabaseからcontentを取得するように変更が必要です。
  // 今回は一旦このままにしておきます。
  const mdxResult = await compileMdx(promptId);

  // MDXエラーをログに記録
  if (mdxResult.error) {
    console.error("MDX Evaluation Error:", promptId, mdxResult.error);
  }

  return (
    <SavedPromptClient
      mdxResult={mdxResult}
      promptId={promptId}
      promptData={promptData}
    />
  );
}

/**
 * 静的パラメータの生成
 *
 * ビルド時に全ての保存済みプロンプトIDを取得して、
 * 静的ページとして事前生成します。
 */
// ★ 修正点3: 非同期関数なのでasyncキーワードを追加
export async function generateStaticParams() {
  // ★ 修正点4: Promiseが解決されるのを待つ
  const ids = await getSavedPromptIds();
  // ★ 修正点5: idの型を明示するか、推論に任せる (awaitすれば推論されるはず)
  return ids.map((id: string) => ({ id }));
}

// 動的パラメータを許可（新しいプロンプトが追加された場合に対応）
export const dynamicParams = true;
