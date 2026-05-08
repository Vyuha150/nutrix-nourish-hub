import philosophyImg from "@/assets/hero-1.jpg";

const pillars = [
  { title: "Efficacy", body: "Every ingredient at a clinically-meaningful dose. Not 'fairy dust' sprinkles." },
  { title: "Accessibility", body: "Designed for daily use, daily price. Wellness shouldn't be a luxury good." },
  { title: "Transparency", body: "Full disclosure of every active, every excipient, every microgram." },
  { title: "Reliability", body: "Third-party assayed. Same potency, lot after lot, year after year." },
];

export const Philosophy = () => (
  <section id="philosophy" className="py-24 md:py-32 bg-background">
    <div className="container-tight">
      <div className="grid md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-5">
          <div className="label-eyebrow mb-5">Positioning</div>
          <h2 className="font-serif text-4xl md:text-5xl text-primary leading-[1.05]">
            Smart nutrition. <br />
            <em className="font-light">Not a wellness aesthetic.</em>
          </h2>
          <div className="mt-8 relative rounded-3xl overflow-hidden shadow-card aspect-[4/5] hidden md:block">
            <img
              src={philosophyImg}
              alt="Nutrix formulation flat lay"
              width={1600}
              height={1024}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-primary-foreground">
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-80">Lab → Kitchen</p>
              <p className="font-serif text-xl mt-1">Clinical actives, conventional forms.</p>
            </div>
          </div>
        </div>
        <div className="md:col-span-7 md:pt-3">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Nutrix sits where most brands won't: scientifically rigorous, genuinely affordable, and fully transparent —
            all at once. The brand for people who did the research and chose substance over hype.
          </p>
          <div className="mt-12 grid sm:grid-cols-2 gap-6">
            {pillars.map((p, i) => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-card transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-serif text-leaf text-sm">0{i + 1}</span>
                  <h3 className="font-serif text-xl text-primary">{p.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
