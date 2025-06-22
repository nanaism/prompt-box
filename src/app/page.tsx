import TemplateCard from "@/components/template-card";
import { Button } from "@/components/ui/button";
import { getTemplatesMetadata } from "@/lib/markdown/templates";
import Link from "next/link";
import HeroPreviewCard from "./hero-preview-card"; // ★ 新しいコンポーネントをインポート

export default async function HomePage() {
  const templates = await getTemplatesMetadata();

  return (
    <div className="flex flex-col">
      {/* Hero セクション */}
      <section className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white py-24">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              {/* ... 左側のテキスト部分は変更なし ... */}
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-sm font-medium">
                Prompt Manager
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                AIプロンプト <br />
                テンプレートで <br />
                <span className="inline-flex gap-2 items-center">
                  時間を節約⏱️💰
                </span>
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                テンプレートの管理。履歴の保存。レビューの記録。 AI
                プロンプトを簡単に管理できます！
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white text-violet-600 hover:bg-white/90"
                >
                  <Link href="#templates">テンプレートを見る</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full bg-transparent border-white text-white hover:bg-white/10"
                >
                  <Link href="/about">詳しく見る</Link>
                </Button>
              </div>
            </div>

            {/* ★ 修正点: プレビューカードをコンポーネントに置き換え */}
            <div className="hidden lg:flex justify-end">
              <HeroPreviewCard />
            </div>
          </div>
        </div>
      </section>

      {/* テンプレート一覧セクション (変更なし) */}
      <section id="templates" className="py-16 bg-zinc-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12">
            日々改善されていく、おすすめテンプレート集。
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.slice(0, 6).map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
