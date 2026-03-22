import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { useStyle } from '../../context/StyleContext';

/**
 * ProfessionalSummaryForm
 *
 * An optional form section for the professional summary paragraph.
 * Visibility in the left sidebar mirrors `showSummary` from StyleContext,
 * but can also be toggled directly from this form.
 */
const ProfessionalSummaryForm = () => {
    const { resumeData, updateResumeData } = useResume();
    const { styleConfig, updateStyle } = useStyle();
    const { summary } = resumeData;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
            {/* Header row: title + show/hide toggle */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Professional Summary</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                        A short paragraph shown below your name in the resume.
                    </p>
                </div>

                {/* Toggle that mirrors the one in the Style sidebar */}
                <button
                    onClick={() => updateStyle('showSummary', !styleConfig.showSummary)}
                    className={`
            relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent
            cursor-pointer transition-colors duration-200
            ${styleConfig.showSummary ? 'bg-blue-500' : 'bg-slate-200'}
          `}
                    title={styleConfig.showSummary ? 'Hide from resume' : 'Show in resume'}
                >
                    <span
                        className={`
              pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm
              transition-transform duration-200
              ${styleConfig.showSummary ? 'translate-x-5' : 'translate-x-0'}
            `}
                    />
                </button>
            </div>

            {/* Textarea */}
            <textarea
                value={summary || ''}
                onChange={(e) => updateResumeData('summary', e.target.value)}
                placeholder="A concise 2–3 sentence summary of your professional background and key strengths..."
                rows={4}
                className="
          w-full p-3 border border-gray-200 rounded-lg text-sm leading-relaxed
          focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
          transition-all resize-y shadow-sm text-gray-700 placeholder-gray-400
        "
            />

            {/* Hint */}
            {!styleConfig.showSummary && (
                <p className="mt-2 text-[11px] text-amber-500 flex items-center gap-1">
                    <span>⚠️</span>
                    Summary is hidden. Toggle the switch above to show it in the resume.
                </p>
            )}
        </div>
    );
};

export default ProfessionalSummaryForm;
