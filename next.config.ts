const withMDX = require("@next/mdx")({
  // MDXの拡張子を指定（通常はこれ）
  extension: /\.mdx?$/,
  // MDXのプラグイン設定（あなたの設定に合わせて空にしています）
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ページとして認識する拡張子
  pageExtensions: ["tsx", "ts", "jsx", "js", "mdx", "md"],

  // 画像最適化を無効にする設定（これが重要）
  images: {
    unoptimized: true,
  },
};

// MDXの設定とNext.jsの設定を結合してエクスポート
module.exports = withMDX(nextConfig);
