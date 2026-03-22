import React from 'react';
import { useResume } from '../../context/ResumeContext';
import TextArea from '../common/TextArea'; // Reusing a textarea for multiple lines

const SummaryForm = () => {
  const { resumeData, updateResumeData } = useResume();
  const { achievements } = resumeData;

  const handleChange = (e) => {
    // Splitting by new line to create the bullet points for the template
    const points = e.target.value.split('\n');
    updateResumeData('achievements', points);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Achievements</h3>
      <p className="text-[10px] text-gray-500 mb-2 italic">Enter one achievement per line.</p>
      <TextArea 
  label="Achievements" 
  name="achievements" 
  placeholder="Enter achievements (one per line)..." 
  value={achievements.join('\n')} 
  onChange={(e) => updateResumeData('achievements', e.target.value.split('\n'))}
/>
    </div>
  );
};

export default SummaryForm;