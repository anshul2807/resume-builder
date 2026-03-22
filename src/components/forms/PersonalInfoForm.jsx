import React from 'react';
import { useResume } from '../../context/ResumeContext';
import Input from '../common/Input';

const PersonalInfoForm = () => {
  const { resumeData, updateResumeData } = useResume();
  const { personalInfo } = resumeData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateResumeData('personalInfo', {
      ...personalInfo,
      [name]: value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Personal Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Full Name" name="fullName" value={personalInfo.fullName} onChange={handleChange} />
        <Input label="Phone" name="phone" value={personalInfo.phone} onChange={handleChange} />
        <Input label="Location" name="location" value={personalInfo.location} onChange={handleChange} />
        <Input label="Email" name="email" value={personalInfo.email} onChange={handleChange} />
        <Input label="GitHub Link" name="github" value={personalInfo.github} onChange={handleChange} />
        <Input label="LinkedIn Link" name="linkedin" value={personalInfo.linkedin} onChange={handleChange} />
      </div>
    </div>
  );
};

export default PersonalInfoForm;