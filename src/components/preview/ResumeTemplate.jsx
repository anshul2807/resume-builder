import React from 'react';
import { useResume } from '../../context/ResumeContext';

/**
 * ResumeTemplate
 *
 * The A4-sized resume card rendered on-screen and passed to react-to-print
 * via the `printRef` from usePdfDownload.
 *
 * Key print-fidelity classes applied here:
 *  - `resume-section`  → page-break-inside: avoid  (whole section won't split)
 *  - `resume-entry`    → page-break-inside: avoid  (individual job/project/edu won't split)
 *  Both classes are defined in index.css and work for @media print.
 */
const ResumeTemplate = React.forwardRef((props, ref) => {
  const { resumeData } = useResume();

  if (!resumeData) return <div className="p-10">Loading template...</div>;

  const { personalInfo, experience, projects, skills, education, achievements } = resumeData;

  return (
    /*
     * `ref` is forwarded here so usePdfDownload's printRef can point directly
     * at this element. react-to-print will capture everything inside this div.
     *
     * A4 dimensions are enforced both via Tailwind (w-[210mm] min-h-[297mm])
     * and via the #resume-preview rule in @media print in index.css.
     */
    <div
      ref={ref}
      id="resume-preview"
      className="bg-white text-gray-800 font-serif leading-tight text-[13px]
                 w-[210mm] min-h-[297mm] p-[15mm] md:p-[18mm] box-border
                 shadow-2xl mx-auto"
    >

      {/* ── Header ──────────────────────────────────────────────────────── */}
      {/* Not a section — headers never need to avoid breaks by themselves */}
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

      {/* ── Achievements ────────────────────────────────────────────────── */}
      {achievements && achievements.length > 0 && (
        <section className="resume-section mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wide">
            Achievements
          </h2>
          <ul className="list-disc ml-5 space-y-0.5">
            {achievements.map((ach, index) => (
              <li key={index} className="pl-1 resume-entry">
                <span dangerouslySetInnerHTML={{
                  __html: ach.replace(/(Expert|Rank \d+)/g, '<strong>$1</strong>')
                }} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Work Experience ──────────────────────────────────────────────── */}
      {/*
        `resume-section` keeps the heading + content block together.
        Each individual job entry gets `resume-entry` so a single job's
        bullets won't be split across two pages.
      */}
      <section className="resume-section mb-4">
        <h2 className="text-sm font-bold uppercase border-b border-black mb-2 tracking-wide">
          Work Experience
        </h2>
        {experience.map((exp, index) => (
          <div key={index} className="resume-entry mb-3">
            <div className="flex justify-between font-bold">
              <span>{exp.role}</span>
              <span>{exp.duration}</span>
            </div>
            <div className="flex justify-between italic text-[12px] mb-1">
              <span>{exp.company}</span>
              <span>{exp.location}</span>
            </div>
            <ul className="list-disc ml-5 space-y-1">
              {exp.points.map((p, i) => (
                <li key={i} className="pl-1">
                  <span dangerouslySetInnerHTML={{
                    __html: p.replace(/^([^:]+):/, '<strong>$1:</strong>')
                  }} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* ── Projects ─────────────────────────────────────────────────────── */}
      <section className="resume-section mb-4">
        <h2 className="text-sm font-bold uppercase border-b border-black mb-1 tracking-wide">
          Projects
        </h2>
        {projects.map((proj, index) => (
          <div key={index} className="resume-entry mb-3">
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
              {proj.points.map((p, i) => <li key={i} className="pl-1">{p}</li>)}
            </ul>
          </div>
        ))}
      </section>

      {/* ── Technical Skills ─────────────────────────────────────────────── */}
      {/* Skills is compact — mark the whole section as one unbreakable block */}
      <section className="resume-section mb-4">
        <h2 className="text-sm font-bold uppercase border-b border-black mb-1 tracking-wide">
          Technical Skills
        </h2>
        <div className="grid grid-cols-[130px_1fr] gap-y-1 mt-2">
          <span className="font-bold">Languages</span>     <span>{skills.languages}</span>
          <span className="font-bold">Frameworks</span>    <span>{skills.frameworks}</span>
          <span className="font-bold">Databases</span>     <span>{skills.databases}</span>
          <span className="font-bold">Tools</span>         <span>{skills.tools}</span>
          <span className="font-bold">Specializations</span> <span>{skills.specializations}</span>
        </div>
      </section>

      {/* ── Education ────────────────────────────────────────────────────── */}
      <section className="resume-section mb-4">
        <h2 className="text-sm font-bold uppercase border-b border-black mb-1 tracking-wide">
          Education
        </h2>
        {education.map((edu, index) => (
          <div key={index} className="resume-entry mt-2 text-[13px]">
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

    </div>
  );
});

// displayName improves React DevTools readability
ResumeTemplate.displayName = 'ResumeTemplate';

export default ResumeTemplate;