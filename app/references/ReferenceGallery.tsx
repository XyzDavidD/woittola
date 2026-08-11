import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicReferenceProject } from "@/lib/references/types";

type ReferenceGalleryProps = {
  projects: PublicReferenceProject[];
  labels: {
    projectsAria: string;
    viewProject: string;
    emptyTitle: string;
    emptyCopy: string;
  };
};

export default function ReferenceGallery({ projects, labels }: ReferenceGalleryProps) {
  return (
    projects.length ? (
        <div className="references-grid" aria-label={labels.projectsAria}>
          {projects.map((project, index) => (
            <article className="reference-card" key={project.id}>
              <Link className="reference-card-media" href={`/references/${project.slug}`} aria-label={`${labels.viewProject}: ${project.translation.title}`}>
                <Image src={project.coverImageUrl} alt={project.translation.title} fill sizes="(min-width: 1000px) 760px, 100vw" priority={index === 0} unoptimized />
              </Link>
              <div className="reference-card-content">
                {project.translation.projectTypeLabel ? <p>{project.translation.projectTypeLabel}</p> : null}
                <h2><Link href={`/references/${project.slug}`}>{project.translation.title}</Link></h2>
                <span>{project.translation.summary}</span>
                <Link className="reference-card-link" href={`/references/${project.slug}`} aria-label={`${labels.viewProject}: ${project.translation.title}`}>
                  {labels.viewProject} <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="references-empty"><h2>{labels.emptyTitle}</h2><p>{labels.emptyCopy}</p></div>
      )
  );
}
