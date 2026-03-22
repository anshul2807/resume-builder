import React from 'react';
import { useResume } from '../../context/ResumeContext';

const ResumeTemplate = () => {
  const { resumeData } = useResume();
  const { personalInfo, experience, projects, skills, education, achievements } = resumeData;

  return (
    <div 
      id="resume-preview" 
      className="resume-container resume-serif p-10 text-[13px] text-gray-900 leading-[1.3]"
    >
      {/* Name Header */}
      <div className="text-center mb-5">
        <h1 className="text-4xl font-light uppercase tracking-[0.2em] mb-1">
          {personalInfo.fullName}
        </h1>
        <div className="flex justify-center gap-2 text-[11px] font-medium">
          <span>{personalInfo.phone}</span>
          <span className="text-gray-400">◇</span>
          <span>{personalInfo.location}</span>
        </div>
        <div className="flex justify-center gap-3 text-[11px] text-blue-700 mt-1">
          <a href={`mailto:${personalInfo.email}`} className="hover:underline">{personalInfo.email}</a>
          <span className="text-gray-400">◇</span>
          <a href="#" className="hover:underline">{personalInfo.github}</a>
          <span className="text-gray-400">◇</span>
          <a href="#" className="hover:underline">{personalInfo.linkedin}</a>
          <span className="text-gray-400">◇</span>
          <a href="#" className="hover:underline">{personalInfo.portfolio}</a>
        </div>
      </div>

      {/* Sections - Reusable Logic */}
      <div className="space-y-5">
        
        {/* Work Experience */}
        <section>
          <h2 className="text-sm font-bold uppercase border-b-[1.5px] border-gray-800 mb-2 tracking-wider">
            Work Experience
          </h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between font-bold">
                <span>{exp.role}</span>
                <span>{exp.duration}</span>
              </div>
              <div className="flex justify-between italic text-[12px] mb-1">
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>
              <ul className="list-disc ml-5 space-y-0.5">
                {exp.points.map((p, j) => <li key={j} className="pl-1">{p}</li>)}
              </ul>
            </div>
          ))}
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-sm font-bold uppercase border-b-[1.5px] border-gray-800 mb-2 tracking-wider">
            Projects
          </h2>
          {projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold">{proj.title}</span> 
                  <span className="mx-2">—</span>
                  <span className="italic text-gray-700">{proj.tech}</span>
                </div>
                <div className="text-[11px] text-blue-700 flex gap-2">
                  <a href="#" className="hover:underline">GitHub</a>
                  <span>—</span>
                  <a href="#" className="hover:underline">Live Preview</a>
                </div>
              </div>
              <ul className="list-disc ml-5 mt-1 space-y-0.5">
                {proj.points.map((p, j) => <li key={j} className="pl-1">{p}</li>)}
              </ul>
            </div>
          ))}
        </section>

        {/* Technical Skills */}
        <section>
          <h2 className="text-sm font-bold uppercase border-b-[1.5px] border-gray-800 mb-2 tracking-wider">
            Technical Skills
          </h2>
          <div className="grid grid-cols-[130px_1fr] gap-y-1 mt-1">
            <span className="font-bold">Languages</span> <span>{skills.languages}</span>
            <span className="font-bold">Frameworks</span> <span>{skills.frameworks}</span>
            <span className="font-bold">Databases</span> <span>{skills.databases}</span>
            <span className="font-bold">Tools</span> <span>{skills.tools}</span>
            <span className="font-bold">Specializations</span> <span>{skills.specializations}</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResumeTemplate;