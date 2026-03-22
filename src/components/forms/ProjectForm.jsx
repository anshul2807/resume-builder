import React from 'react';
import { useResume } from '../../context/ResumeContext';
import Input from '../common/Input';

const ProjectForm = () => {
  const { resumeData, updateResumeData } = useResume();
  const { projects } = resumeData;

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newProjects = [...projects];
    newProjects[index][name] = value;
    updateResumeData('projects', newProjects);
  };

  const addProject = () => {
    updateResumeData('projects', [
      ...projects,
      { title: "", tech: "", link: "", liveLink: "", points: [""] }
    ]);
  };

  const removeProject = (index) => {
    const newProjects = projects.filter((_, i) => i !== index);
    updateResumeData('projects', newProjects);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Projects</h3>
      {projects.map((proj, index) => (
        <div key={index} className="mb-6 p-4 border-l-2 border-green-500 bg-gray-50 rounded-r-lg">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Project Title" name="title" value={proj.title} onChange={(e) => handleChange(index, e)} />
            <Input label="Tech Stack" name="tech" value={proj.tech} onChange={(e) => handleChange(index, e)} />
            <Input label="GitHub Link" name="link" value={proj.link} onChange={(e) => handleChange(index, e)} />
            <Input label="Live Preview Link" name="liveLink" value={proj.liveLink} onChange={(e) => handleChange(index, e)} />
          </div>
          <button 
            onClick={() => removeProject(index)}
            className="text-red-500 text-[10px] font-bold uppercase mt-2"
          >
            Remove Project
          </button>
        </div>
      ))}
      <button onClick={addProject} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded font-bold text-sm hover:bg-gray-100 transition-colors">
        + Add New Project
      </button>
    </div>
  );
};

export default ProjectForm;