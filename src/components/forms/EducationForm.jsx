import React from 'react';
import { useResume } from '../../context/ResumeContext';
import Input from '../common/Input';

const EducationForm = () => {
  const { resumeData, updateResumeData } = useResume();
  const { education } = resumeData;

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newEdu = [...education];
    newEdu[index][name] = value;
    updateResumeData('education', newEdu);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Education</h3>
      {education.map((edu, index) => (
        <div key={index} className="space-y-4">
          <Input label="Degree / Course" name="degree" value={edu.degree} onChange={(e) => handleChange(index, e)} />
          <Input label="University / School" name="school" value={edu.school} onChange={(e) => handleChange(index, e)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration (e.g. 2019-2023)" name="duration" value={edu.duration} onChange={(e) => handleChange(index, e)} />
            <Input label="Grade / CGPA" name="score" value={edu.score} onChange={(e) => handleChange(index, e)} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EducationForm;