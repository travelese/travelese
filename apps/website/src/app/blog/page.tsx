import { Article } from "@/components/article";
import { BlogToolbar } from "@/components/blog-toolbar";
import { getBlogPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Travelese Blog.",
};

export default async function Page() {
  const data = getBlogPosts();

  const posts = data
    .sort((a, b) => {
      if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
        return -1;
      }
      return 1;
    })
    .map((post, index) => (
      <Article key={post.slug} data={post} firstPost={index === 0} />
    ));

  return (
    <div className="container flex justify-center scroll-smooth">
      <div className="max-w-[680px] pt-[80px] md:pt-[150px] w-full">
        {posts}
      </div>

      <BlogToolbar
        posts={data.map((post) => ({
          slug: post.slug,
          title: post.metadata.title,
        }))}
      />
    </div>
  );
}
