import { getTemplateData, getTemplateIds } from "@/lib/markdown/templates";
import { notFound } from "next/navigation";
import TemplateClientView from "./_components/template-client-view";

/**
 * 静的パラメータ生成関数
 *
 * ビルド時に全てのテンプレートIDを取得し、静的ページを生成するための
 * パラメータリストを返します。これによりSSGが有効になります。
 */
export async function generateStaticParams() {
  // ★ 修正点1: await を追加して Promise の解決を待つ
  const ids = await getTemplateIds();
  return ids.map((id) => ({ id }));
}

/**
 * テンプレート詳細ページコンポーネント
 *
 * 指定されたIDのテンプレートデータを取得し、クライアントコンポーネントに渡します。
 * テンプレートが見つからない場合は、404エラーを表示します。
 */
// ★ 修正点2: params の型を修正
export default async function TemplatePage({
  params,
}: {
  params: { id: string };
}) {
  // ★ 修正点3: params は Promise ではないので await は不要
  const id = params.id;
  // ★ 修正点4: await を追加して Promise の解決を待つ
  const templateData = await getTemplateData(id);

  if (!templateData) {
    notFound();
  }

  return <TemplateClientView templateData={templateData} />;
}
