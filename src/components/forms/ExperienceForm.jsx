import React from 'react';
import { useResume } from '../../context/ResumeContext';
import Input from '../common/Input';
import Button from '../common/Button'; // Assuming basic button component

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

          <div className="mt-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Responsibilities (Points)</label>
            {exp.points.map((point, pIndex) => (
              <input
                key={pIndex}
                className="w-full p-2 mb-2 border rounded text-sm"
                value={point}
                onChange={(e) => handlePointChange(index, pIndex, e.target.value)}
                placeholder="Describe your achievement..."
              />
            ))}
          </div>
          
          <button 
            onClick={() => removeExperience(index)}
            className="text-red-500 text-xs font-bold mt-2 uppercase"
          >
            Remove Experience
          </button>
        </div>
      ))}

      <button 
        onClick={addExperience}
        className="w-full py-2 bg-gray-800 text-white rounded font-bold text-sm hover:bg-black transition-colors"
      >
        + Add Experience
      </button>
    </div>
  );
};

export default ExperienceForm;