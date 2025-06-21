import type { Frontmatter } from "@/lib/markdown/types";
import { evaluate, type EvaluateResult } from "next-mdx-remote-client/rsc";
import { notFound } from "next/navigation";
import remarkGfm from "remark-gfm";
// ★ 修正点1: fsに依存する関数は使わない。代わりにDBからデータを取得する関数をインポート
import { getSavedPromptData } from "./saved-prompts";
// ★ 修正点2: frontmatterを文字列に戻すためにgray-matterをインポート
import matter from "gray-matter";

/**
 * MDXコンテンツをコンパイルしてReactコンポーネントに変換
 *
 * @param id プロンプトID
 * @returns コンパイル済みMDXの結果
 */
export async function compileMdx(
  id: string
): Promise<EvaluateResult<Frontmatter>> {
  // ★ 修正点3: DBからプロンプトデータを取得
  const promptData = await getSavedPromptData(id);

  if (!promptData) {
    notFound();
  }

  // ★ 修正点4: `evaluate` に渡すため、frontmatterとcontentを結合して単一の文字列に戻す
  const sourceToCompile = matter.stringify(
    promptData.content,
    promptData.frontmatter
  );

  try {
    // MDXソースを評価してReactコンポーネントに変換
    const result = await evaluate<Frontmatter>({
      source: sourceToCompile,
      options: {
        parseFrontmatter: true, // フロントマターの自動解析を有効化
        mdxOptions: {
          remarkPlugins: [remarkGfm], // GitHub Flavored Markdownサポート
        },
      },
    });

    if (result.error) {
      console.warn("MDX evaluation resulted in an error:", result.error);
    }
    return result;
  } catch (error) {
    console.error("Critical error during MDX evaluation process:", error);
    const evalError =
      error instanceof Error
        ? error
        : new Error("An unknown error occurred during MDX evaluation.");

    throw evalError;
  }
}
