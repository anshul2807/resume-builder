import React from 'react';
import { useResume } from '../../context/ResumeContext';
import AIButton from '../ai/AIButton';

/**
 * SummaryForm — despite its name, this is the Achievements section.
 * One textarea where each line becomes a bullet point in the resume.
 * An AI pill button processes the entire textarea content at once.
 */
const SummaryForm = ({ onAuthClick }) => {
  const { resumeData, updateResumeData } = useResume();
  const { achievements } = resumeData;

  const rawText = achievements.join('\n');

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-lg font-bold text-gray-800 flex-1">Achievements</h3>
        <span className="text-[10px] text-violet-400 font-semibold flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
          </svg>
          AI-ready
        </span>
      </div>
      <p className="text-[10px] text-gray-400 mb-3 italic">Enter one achievement per line.</p>

      <textarea
        name="achievements"
        rows={5}
        value={rawText}
        onChange={(e) => updateResumeData('achievements', e.target.value.split('\n'))}
        placeholder="Enter achievements (one per line)…"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500
                   focus:border-transparent outline-none transition-all text-sm leading-relaxed
                   resize-y shadow-sm"
      />

      {/* AI pill button — processes all lines at once */}
      <div className="flex justify-end mt-2">
        <AIButton
          size="md"
          value={rawText}
          context="achievement"
          onReplace={(improved) =>
            updateResumeData('achievements', improved.split('\n').filter(Boolean))
          }
          onAuthClick={onAuthClick}
        />
      </div>
    </div>
  );
};

export default SummaryForm;