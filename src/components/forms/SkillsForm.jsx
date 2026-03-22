import React from 'react';
import { useResume } from '../../context/ResumeContext';
import Input from '../common/Input';

const SkillsForm = () => {
  const { resumeData, updateResumeData } = useResume();
  const { skills } = resumeData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateResumeData('skills', {
      ...skills,
      [name]: value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Technical Skills</h3>
      <div className="space-y-2">
        <Input label="Languages" name="languages" value={skills.languages} onChange={handleChange} placeholder="e.g. Java, Python" />
        <Input label="Frameworks" name="frameworks" value={skills.frameworks} onChange={handleChange} placeholder="e.g. Spring Boot, React" />
        <Input label="Databases" name="databases" value={skills.databases} onChange={handleChange} />
        <Input label="Tools" name="tools" value={skills.tools} onChange={handleChange} />
        <Input label="Specializations" name="specializations" value={skills.specializations} onChange={handleChange} />
      </div>
    </div>
  );
};

export default SkillsForm;