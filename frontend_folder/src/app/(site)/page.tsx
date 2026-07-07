import { GraduationCap, GitBranch, Link, MapPin, ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { ContactForm } from "@/components/ContactForm";
import { CopyEmail } from "@/components/CopyEmail";
import { Button } from "@/components/ui/Button";
import { ExperienceSection } from "@/components/ExperienceSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import {
  getPublishedExperience,
  getPublishedProjects,
  getPublishedTestimonials,
} from "@/lib/data";
import { stackGroups } from "@/lib/projects";
import { site } from "@/lib/site";

export const revalidate = 60;

// Home page, now data-driven (PHASE_2.md Section 8). Experience and
// Testimonials render nothing at all when empty — the neighbouring sections
// sit at their normal spacing as if the missing one was never designed in.

export default async function Home() {
  const [projects, experience, testimonials] = await Promise.all([
    getPublishedProjects(),
    getPublishedExperience(),
    getPublishedTestimonials(),
  ]);

  return (
    <main id="main" className="flex-1">
      <Hero />

      {/* Selected Work */}
      <section id="work" className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-16">
        <Reveal>
          <SectionHeading
            eyebrow="GET /work"
            title="Selected Work"
            lede="Projects with more than one kind of user in them."
          />
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={i * 0.06} className="h-full">
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="mt-8 flex justify-center">
            <Button variant="ghost" href="/work">
              View all work <ArrowRight aria-hidden size={18} />
            </Button>
          </div>
        </Reveal>
      </section>

      <ExperienceSection entries={experience} />

      {/* Stack */}
      <section id="stack" className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-16">
        <Reveal>
          <SectionHeading
            eyebrow="GET /stack"
            title="Stack"
            lede="What I actually build with, grouped by where it runs."
          />
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stackGroups.map((group, i) => (
            <Reveal key={group.label} delay={i * 0.06} className="h-full">
              <Card className="h-full">
                <p className="font-mono text-xs text-text-tertiary">{group.label}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <Chip key={item}>{item}</Chip>
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Education — exactly one entry (CLAUDE.md Section 4) */}
      <section id="education" className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-16">
        <Reveal>
          <SectionHeading eyebrow="GET /education" title="Education" />
        </Reveal>
        <Reveal className="mt-10">
          <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <GraduationCap aria-hidden size={22} className="mt-1 text-accent-teal" />
              <div>
                <h3 className="font-display text-lg font-medium">
                  FAST-NUCES — BS Computer Science
                </h3>
                <p className="mt-1 text-sm text-text-secondary">{site.location}</p>
              </div>
            </div>
            <Chip variant="amber">Expected June 2027</Chip>
          </Card>
        </Reveal>
      </section>

      <TestimonialsSection entries={testimonials} />

      {/* Contact */}
      <section id="contact" className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-16 pb-24">
        <Reveal>
          <SectionHeading
            eyebrow="POST /contact"
            title="Get in touch"
            lede="Screening for internships? Send a message — it goes straight to my inbox."
          />
        </Reveal>
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_320px]">
          <Reveal>
            <ContactForm />
          </Reveal>
          <Reveal delay={0.1} className="lg:mb-18">
            <div className="rounded-card border border-border-hairline bg-bg-surface p-4">
              <div className="flex gap-1.5 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <p className="pb-4 text-xs text-text-tertiary">or reach me directly</p>

              <div className="flex flex-col gap-2.5 font-mono text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-text-tertiary">$ email</span>
                  <CopyEmail />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-text-tertiary">$ github</span>
                  <a
                    href={site.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-text-primary hover:text-accent-teal transition-colors"
                  >
                    <GitBranch size={14} aria-hidden />
                    github.com/Umer529
                  </a>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-text-tertiary">$ linkedin</span>
                  <a
                    href={site.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-text-primary hover:text-accent-teal transition-colors"
                  >
                    <Link size={14} aria-hidden />
                    umerfarooq0-dev
                  </a>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-text-tertiary">$ location</span>
                  <span className="flex items-center gap-2 text-text-primary">
                    <MapPin size={14} aria-hidden />
                    {site.location}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-text-tertiary">$ response_time</span>
                  <span className="text-text-primary">
                    usually within 24h<span className="cursor-blink ml-1 inline-block h-4 w-2 translate-y-0.5 bg-accent-teal" />
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
