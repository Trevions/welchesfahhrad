import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Article } from "@/lib/articles";

interface Props {
  article: Article;
  featured?: boolean;
  index?: number;
}

export function ArticleCard({ article, featured, index = 0 }: Props) {
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className={`group relative block overflow-hidden rounded-3xl glass shadow-glass transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-elevated animate-fade-up ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`relative overflow-hidden ${featured ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="rounded-full glass-strong px-3 py-1 text-xs font-semibold tracking-wide uppercase text-signal">
            {article.category}
          </span>
        </div>
      </div>

      <div className="relative p-6 md:p-7">
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span>{article.date}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTime}
          </span>
          {article.source && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>Quelle: {article.source}</span>
            </>
          )}
        </div>

        <h3
          className={`font-display font-bold tracking-tight text-gradient ${
            featured ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
          }`}
        >
          {article.title}
        </h3>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {article.excerpt}
        </p>

        <div className="mt-5 flex items-center gap-1 text-sm font-medium text-signal">
          Weiterlesen
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
