interface Props {
  eyebrow: string;
  title: string;
  description: string;
}

export function CategoryHero({ eyebrow, title, description }: Props) {
  return (
    <section className="relative border-b border-border">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8 pt-12 md:pt-20 pb-10 md:pb-16">
        <div className="flex items-center gap-3 animate-fade-in">
          <span className="h-px w-12 bg-signal animate-rule-grow" />
          <span className="eyebrow text-signal">{eyebrow}</span>
        </div>
        <h1 className="mt-6 font-display font-black tracking-tight text-foreground text-5xl md:text-7xl lg:text-8xl leading-[0.9] max-w-5xl animate-fade-up">
          {title.split(" ").length > 2 ? (
            <>
              {title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="italic text-muted-foreground">
                {title.split(" ").slice(-1)}
              </span>
            </>
          ) : (
            title
          )}
        </h1>
        <p
          className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground font-light leading-relaxed animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          {description}
        </p>
      </div>
    </section>
  );
}
