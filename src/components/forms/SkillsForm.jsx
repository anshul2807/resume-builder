import React from 'react';
import { useResume } from '../../context/ResumeContext';
import Input from '../common/Input';
import AIButton from '../ai/AIButton';

const SKILL_FIELDS = [
  { name: 'languages', label: 'Languages', placeholder: 'e.g. Java, Python, SQL' },
  { name: 'frameworks', label: 'Frameworks', placeholder: 'e.g. Spring Boot, React' },
  { name: 'databases', label: 'Databases', placeholder: 'e.g. MongoDB, PostgreSQL' },
  { name: 'tools', label: 'Tools', placeholder: 'e.g. Git, Docker, GCP' },
  { name: 'specializations', label: 'Specializations', placeholder: 'e.g. System Design, DSA' },
];

const SkillsForm = () => {
  const { resumeData, updateResumeData } = useResume();
  const { skills } = resumeData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateResumeData('skills', { ...skills, [name]: value });
  };

  const handleReplace = (fieldName, improved) => {
    updateResumeData('skills', { ...skills, [fieldName]: improved });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex-1">Technical Skills</h3>
        <span className="text-[10px] text-violet-400 font-semibold flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
          AI-ready
        </span>
      </div>
      <div className="space-y-3">
        {SKILL_FIELDS.map(({ name, label, placeholder }) => (
          <div key={name} className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label={label}
                name={name}
                value={skills[name]}
                onChange={handleChange}
                placeholder={placeholder}
              />
            </div>
            {/* ✦ AI star per skill row */}
            <div className="mb-3">
              <AIButton
                size="sm"
                value={skills[name]}
                context="skills"
                onReplace={(improved) => handleReplace(name, improved)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsForm;