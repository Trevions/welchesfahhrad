import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Article } from "@/lib/articles";

interface Props {
  article: Article;
  featured?: boolean;
  index?: number;
}

export function ArticleCard({ article, featured, index = 0 }: Props) {
  if (featured) {
    return (
      <Link
        to="/artikel/$slug"
        params={{ slug: article.slug }}
        className="group relative block overflow-hidden rounded-3xl shadow-glass transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated animate-fade-up md:col-span-2 md:row-span-2 min-h-[440px] md:min-h-[640px]"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        <img
          src={article.image}
          alt={article.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />

        <div className="absolute top-5 left-5">
          <span className="rounded-full glass-strong px-3 py-1 text-xs font-semibold tracking-widest uppercase text-signal">
            {article.category}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span>{article.date}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime}
            </span>
            {article.source && (
              <>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                <span>Quelle: {article.source}</span>
              </>
            )}
          </div>

          <h3 className="font-display font-bold tracking-tight text-foreground text-2xl md:text-4xl lg:text-5xl max-w-3xl leading-[1.05]">
            {article.title}
          </h3>

          <p className="mt-4 max-w-2xl text-sm md:text-base text-muted-foreground line-clamp-2">
            {article.excerpt}
          </p>

          <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-signal">
            Weiterlesen
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group relative flex flex-col overflow-hidden rounded-3xl glass shadow-glass transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative overflow-hidden aspect-[16/10]">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="rounded-full glass-strong px-3 py-1 text-[10px] font-semibold tracking-widest uppercase text-signal">
            {article.category}
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span>{article.date}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTime}
          </span>
        </div>

        <h3 className="font-display font-semibold tracking-tight text-foreground text-lg md:text-xl leading-snug line-clamp-2">
          {article.title}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {article.excerpt}
        </p>

        <div className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium text-signal">
          Weiterlesen
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
