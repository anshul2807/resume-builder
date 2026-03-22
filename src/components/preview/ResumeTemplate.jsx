import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { useStyle } from '../../context/StyleContext';

/**
 * ResumeTemplate
 * ─────────────────────────────────────────────────────────────────────────
 * Renders the A4 resume card. Sections are rendered in the order defined
 * by `styleConfig.sectionOrder` so drag-and-drop reordering in the Style
 * sidebar is reflected instantly here.
 *
 * Visual styles (fonts, colors, heading style, spacing) are handled
 * entirely by StyleInjector writing to a <style> tag — this component
 * does NOT re-render when sliders move.
 *
 * `React.forwardRef` exposes the root <div> to usePdfDownload's printRef
 * so react-to-print can capture the exact live DOM for PDF generation.
 */

// ─── Individual section renderers ────────────────────────────────────────────

const SummarySection = ({ summary }) => (
  <section className="resume-section">
    <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wide">
      Professional Summary
    </h2>
    <p className="text-[13px] leading-relaxed text-gray-700">{summary}</p>
  </section>
);

const AchievementsSection = ({ achievements }) => (
  <section className="resume-section">
    <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wide">
      Achievements
    </h2>
    <ul className="list-disc ml-5 space-y-0.5">
      {achievements.map((ach, i) => (
        <li key={i} className="pl-1 resume-entry">
          <span
            dangerouslySetInnerHTML={{
              __html: ach.replace(/(Expert|Rank \d+)/g, '<strong>$1</strong>'),
            }}
          />
        </li>
      ))}
    </ul>
  </section>
);

const ExperienceSection = ({ experience }) => (
  <section className="resume-section">
    <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wide">
      Work Experience
    </h2>
    {experience.map((exp, i) => (
      <div key={i} className="resume-entry mb-3">
        <div className="flex justify-between font-bold">
          <span>{exp.role}</span>
          <span>{exp.duration}</span>
        </div>
        <div className="flex justify-between italic text-[12px] mb-1">
          <span>{exp.company}</span>
          <span>{exp.location}</span>
        </div>
        <ul className="list-disc ml-5 space-y-1">
          {exp.points.map((p, j) => (
            <li key={j} className="pl-1">
              <span
                dangerouslySetInnerHTML={{
                  __html: p.replace(/^([^:]+):/, '<strong>$1:</strong>'),
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    ))}
  </section>
);

const ProjectsSection = ({ projects }) => (
  <section className="resume-section">
    <h2 className="text-sm font-bold uppercase border-b border-black mb-1 tracking-wide">
      Projects
    </h2>
    {projects.map((proj, i) => (
      <div key={i} className="resume-entry mb-3">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="font-bold">{proj.title}</span>
            <span className="mx-2 text-gray-400">—</span>
            <span className="italic text-[12px] text-gray-700">{proj.tech}</span>
          </div>
          <div className="text-blue-600 text-[10px] font-bold flex gap-2">
            <a href={proj.link} className="underline">GitHub</a>
            <span className="no-underline text-gray-300">—</span>
            <a href={proj.liveLink} className="underline">Live Preview</a>
          </div>
        </div>
        <ul className="list-disc ml-5 mt-1 space-y-0.5">
          {proj.points.map((p, j) => (
            <li key={j} className="pl-1">{p}</li>
          ))}
        </ul>
      </div>
    ))}
  </section>
);

const SkillsSection = ({ skills }) => (
  <section className="resume-section">
    <h2 className="text-sm font-bold uppercase border-b border-black mb-1 tracking-wide">
      Technical Skills
    </h2>
    <div className="grid grid-cols-[130px_1fr] gap-y-1 mt-2">
      <span className="font-bold">Languages</span>      <span>{skills.languages}</span>
      <span className="font-bold">Frameworks</span>     <span>{skills.frameworks}</span>
      <span className="font-bold">Databases</span>      <span>{skills.databases}</span>
      <span className="font-bold">Tools</span>          <span>{skills.tools}</span>
      <span className="font-bold">Specializations</span><span>{skills.specializations}</span>
    </div>
  </section>
);

const EducationSection = ({ education }) => (
  <section className="resume-section">
    <h2 className="text-sm font-bold uppercase border-b border-black mb-1 tracking-wide">
      Education
    </h2>
    {education.map((edu, i) => (
      <div key={i} className="resume-entry mt-2">
        <div className="flex justify-between font-bold">
          <span>
            {edu.degree}, <span className="font-normal">{edu.school}</span>
          </span>
          <span>{edu.duration}</span>
        </div>
        <div className="mt-0.5">{edu.score}</div>
      </div>
    ))}
  </section>
);

// ─── Section dispatcher ───────────────────────────────────────────────────────
/**
 * Maps a section ID to its renderer component.
 * Called once per ID in the sectionOrder array.
 */
const renderSection = (id, resumeData, styleConfig) => {
  const { summary, achievements, experience, projects, skills, education } = resumeData;

  switch (id) {
    case 'summary':
      // Only render if the user has toggled it on
      return styleConfig.showSummary && summary ? (
        <SummarySection key={id} summary={summary} />
      ) : null;

    case 'achievements':
      return achievements?.length > 0 ? (
        <AchievementsSection key={id} achievements={achievements} />
      ) : null;

    case 'experience':
      return <ExperienceSection key={id} experience={experience} />;

    case 'projects':
      return <ProjectsSection key={id} projects={projects} />;

    case 'skills':
      return <SkillsSection key={id} skills={skills} />;

    case 'education':
      return <EducationSection key={id} education={education} />;

    default:
      return null;
  }
};

// ─── Main component ───────────────────────────────────────────────────────────
const ResumeTemplate = React.forwardRef((_, ref) => {
  const { resumeData } = useResume();
  const { styleConfig } = useStyle();

  if (!resumeData) return <div className="p-10">Loading...</div>;

  const { personalInfo } = resumeData;
  const { sectionOrder } = styleConfig;

  return (
    <div
      ref={ref}
      id="resume-preview"
      className="bg-white text-gray-800 font-serif leading-tight text-[13px]
                 w-[210mm] min-h-[297mm] p-[15mm] md:p-[18mm] box-border
                 shadow-2xl mx-auto"
    >
      {/* ── Header (always at top, never part of sectionOrder) ────────── */}
      <div className="text-center mb-5">
        <h1 className="text-3xl font-normal tracking-[0.2em] uppercase mb-1">
          {personalInfo.fullName}
        </h1>
        <div className="flex justify-center gap-2 text-[11px] text-blue-600 font-medium">
          <span>{personalInfo.phone}</span>
          <span>◇</span>
          <span>{personalInfo.location}</span>
        </div>
        <div className="flex justify-center gap-3 text-[11px] text-blue-600 underline mt-1 font-medium">
          <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
          <span className="no-underline text-gray-400">◇</span>
          <a href={personalInfo.github}>GitHub</a>
          <span className="no-underline text-gray-400">◇</span>
          <a href={personalInfo.linkedin}>LinkedIn</a>
          <span className="no-underline text-gray-400">◇</span>
          <a href={personalInfo.portfolio}>Portfolio</a>
        </div>
      </div>

      {/*
        ── Dynamic section list ──────────────────────────────────────────
        Iterates over sectionOrder (from StyleContext) and dispatches each
        section to its renderer. Reordering in SectionOrderPanel instantly
        changes the order here because StyleContext drives both.

        Note: StyleInjector sets `margin-bottom` on .resume-section via
        the `sectionSpacing` value — no inline style needed here.
      */}
      <div>
        {sectionOrder.map((id) => renderSection(id, resumeData, styleConfig))}
      </div>
    </div>
  );
});

ResumeTemplate.displayName = 'ResumeTemplate';
export default ResumeTemplate;