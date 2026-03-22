import React from 'react';
import { useResume } from '../../context/ResumeContext';
import Input from '../common/Input';

const ExperienceForm = () => {
  const { resumeData, updateResumeData } = useResume();
  const { experience } = resumeData;

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newExperience = [...experience];
    newExperience[index][name] = value;
    updateResumeData('experience', newExperience);
  };

  const handlePointChange = (expIndex, pointIndex, value) => {
    const newExperience = [...experience];
    newExperience[expIndex].points[pointIndex] = value;
    updateResumeData('experience', newExperience);
  };

  const addPoint = (expIndex) => {
    const newExperience = [...experience];
    newExperience[expIndex].points.push("");
    updateResumeData('experience', newExperience);
  };

  const removePoint = (expIndex, pointIndex) => {
    const newExperience = [...experience];
    newExperience[expIndex].points = newExperience[expIndex].points.filter((_, i) => i !== pointIndex);
    updateResumeData('experience', newExperience);
  };

  const addExperience = () => {
    updateResumeData('experience', [
      ...experience,
      { role: "", company: "", location: "", duration: "", points: [""] }
    ]);
  };

  const removeExperience = (index) => {
    const newExperience = experience.filter((_, i) => i !== index);
    updateResumeData('experience', newExperience);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Work Experience</h3>

      {experience.map((exp, index) => (
        <div key={index} className="mb-8 p-4 border-l-2 border-blue-500 bg-gray-50 rounded-r-lg">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Job Role" name="role" value={exp.role} onChange={(e) => handleChange(index, e)} />
            <Input label="Company" name="company" value={exp.company} onChange={(e) => handleChange(index, e)} />
            <Input label="Location" name="location" value={exp.location} onChange={(e) => handleChange(index, e)} />
            <Input label="Duration" name="duration" value={exp.duration} onChange={(e) => handleChange(index, e)} />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Responsibilities (Points)</label>
            {exp.points.map((point, pIndex) => (
              <div key={pIndex} className="flex gap-2 mb-2">
                <input
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={point}
                  onChange={(e) => handlePointChange(index, pIndex, e.target.value)}
                  placeholder="Describe your achievement..."
                />
                <button
                  onClick={() => removePoint(index, pIndex)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1"
                  title="Remove Point"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => addPoint(index)}
              className="text-blue-500 hover:text-blue-700 text-[11px] font-bold uppercase mt-1 flex items-center gap-1 transition-colors"
            >
              <span>+ Add Point</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => removeExperience(index)}
              className="text-red-500 text-[10px] font-bold uppercase hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
              Remove Experience
            </button>
          </div>
        </div>
      ))}

      <button onClick={addExperience} className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg font-bold text-sm hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2">
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Experience
      </button>
    </div>
  );
};

export default ExperienceForm;