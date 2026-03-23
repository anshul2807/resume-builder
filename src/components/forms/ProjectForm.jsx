import React from 'react';
import { useResume } from '../../context/ResumeContext';
import Input from '../common/Input';
import AIButton from '../ai/AIButton';

const ProjectForm = () => {
  const { resumeData, updateResumeData } = useResume();
  const { projects } = resumeData;

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...projects];
    updated[index][name] = value;
    updateResumeData('projects', updated);
  };

  const handlePointChange = (projIndex, pointIndex, value) => {
    const updated = [...projects];
    updated[projIndex].points[pointIndex] = value;
    updateResumeData('projects', updated);
  };

  const addPoint = (projIndex) => {
    const updated = [...projects];
    updated[projIndex].points.push('');
    updateResumeData('projects', updated);
  };

  const removePoint = (projIndex, pointIndex) => {
    const updated = [...projects];
    updated[projIndex].points = updated[projIndex].points.filter((_, i) => i !== pointIndex);
    updateResumeData('projects', updated);
  };

  const addProject = () => {
    updateResumeData('projects', [
      ...projects,
      { title: '', tech: '', link: '', liveLink: '', points: [''] },
    ]);
  };

  const removeProject = (index) => {
    updateResumeData('projects', projects.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex-1">Projects</h3>
        <span className="text-[10px] text-violet-400 font-semibold flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
          AI-ready
        </span>
      </div>

      {projects.map((proj, index) => (
        <div key={index} className="mb-8 p-4 border-l-2 border-green-500 bg-gray-50 rounded-r-lg">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Project Title" name="title" value={proj.title} onChange={(e) => handleChange(index, e)} />
            <Input label="Tech Stack" name="tech" value={proj.tech} onChange={(e) => handleChange(index, e)} />
            <Input label="GitHub Link" name="link" value={proj.link} onChange={(e) => handleChange(index, e)} />
            <Input label="Live Preview Link" name="liveLink" value={proj.liveLink} onChange={(e) => handleChange(index, e)} />
          </div>

          <div className="mt-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Description (Points)
            </label>

            {proj.points.map((point, pIndex) => (
              <div key={pIndex} className="flex items-center gap-2 mb-2">
                <input
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm
                             focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  value={point}
                  onChange={(e) => handlePointChange(index, pIndex, e.target.value)}
                  placeholder="Describe a key feature or accomplishment…"
                />
                {/* ✦ AI star for this bullet */}
                <AIButton
                  size="sm"
                  value={point}
                  context="project-point"
                  onReplace={(improved) => handlePointChange(index, pIndex, improved)}
                />
                {/* Remove bullet */}
                <button
                  onClick={() => removePoint(index, pIndex)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1 flex-shrink-0"
                  title="Remove point"
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              onClick={() => addPoint(index)}
              className="text-green-600 hover:text-green-800 text-[11px] font-bold uppercase
                         mt-1 flex items-center gap-1 transition-colors"
            >
              + Add Point
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => removeProject(index)}
              className="text-red-500 text-[10px] font-bold uppercase hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
              Remove Project
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addProject}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg
                   font-bold text-sm hover:bg-gray-100 hover:border-gray-400 transition-all
                   flex items-center justify-center gap-2"
      >
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add New Project
      </button>
    </div>
  );
};

export default ProjectForm;