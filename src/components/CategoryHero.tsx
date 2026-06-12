interface Props {
  eyebrow: string;
  title: string;
  description: string;
}

export function CategoryHero({ eyebrow, title, description }: Props) {
  return (
    <section className="relative pt-32 md:pt-40 pb-16 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-signal animate-fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse-glow" />
          {eyebrow}
        </div>
        <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight text-gradient animate-fade-up">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground animate-fade-up" style={{ animationDelay: "100ms" }}>
          {description}
        </p>
      </div>
    </section>
  );
}
