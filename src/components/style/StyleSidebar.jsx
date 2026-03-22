import React from 'react';
import { useStyle, defaultStyleConfig } from '../../context/StyleContext';

// ─── Shared micro-components ─────────────────────────────────────────────────

const SectionLabel = ({ icon, title }) => (
    <div className="flex items-center gap-2 mb-3 mt-1">
        <span className="text-[15px] leading-none">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            {title}
        </span>
    </div>
);

const Divider = () => <div className="border-t border-slate-100 my-5" />;

// ─── Range Slider ─────────────────────────────────────────────────────────────
/**
 * The `--pct` CSS custom property drives the left-to-thumb gradient fill
 * on the slider track. Updating it here via inline style is the correct
 * pattern since Tailwind cannot compute dynamic percentages at build time.
 */
const RangeSlider = ({ label, value, min, max, step = 1, unit = 'px', onChange }) => {
    const pct = (((value - min) / (max - min)) * 100).toFixed(1);

    return (
        <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-600">{label}</label>
                <span className="text-[11px] font-bold tabular-nums text-blue-600 bg-blue-50 
                         px-2 py-0.5 rounded-full min-w-[42px] text-center">
                    {value}{unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) =>
                    onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value, 10))
                }
                className="style-slider w-full"
                style={{ '--pct': `${pct}%` }}
            />
        </div>
    );
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-start justify-between gap-4 py-3">
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 leading-tight">{label}</p>
            {description && (
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{description}</p>
            )}
        </div>
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`
        relative inline-flex h-[22px] w-10 flex-shrink-0 rounded-full border-2 border-transparent
        cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2
        focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${checked ? 'bg-blue-500' : 'bg-slate-200'}
      `}
        >
            <span
                className={`
          pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm
          ring-0 transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-[18px]' : 'translate-x-0'}
        `}
            />
        </button>
    </div>
);

// ─── Font Family Selector ─────────────────────────────────────────────────────
const FONT_OPTIONS = [
    {
        value: 'serif',
        label: 'Classic Serif',
        preview: '"Times New Roman", Times, serif',
        sub: 'Traditional & ATS-Safe',
        sample: 'Abc',
    },
    {
        value: 'lora',
        label: 'Elegant Lora',
        preview: '"Lora", Georgia, serif',
        sub: 'Refined & Distinguished',
        sample: 'Abc',
    },
    {
        value: 'sans',
        label: 'Modern Sans',
        preview: '"Inter", Arial, sans-serif',
        sub: 'Clean & Contemporary',
        sample: 'Abc',
    },
    {
        value: 'mono',
        label: 'Technical Mono',
        preview: '"Courier New", monospace',
        sub: 'Developer-Friendly',
        sample: 'Abc',
    },
];

const FontCard = ({ option, selected, onClick }) => (
    <button
        onClick={onClick}
        className={`
      w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left
      transition-all duration-150 group
      ${selected
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'
            }
    `}
    >
        {/* Large letter preview in the actual font */}
        <span
            className={`
        flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl
        transition-colors duration-150
        ${selected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
      `}
            style={{ fontFamily: option.preview }}
        >
            {option.sample}
        </span>

        <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold leading-tight transition-colors duration-150
                      ${selected ? 'text-blue-700' : 'text-slate-700'}`}>
                {option.label}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{option.sub}</p>
        </div>

        {/* Checkmark badge */}
        <div className={`
      flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
      transition-all duration-150
      ${selected ? 'bg-blue-500 opacity-100 scale-100' : 'opacity-0 scale-75'}
    `}>
            <svg viewBox="0 0 10 10" className="w-3 h-3 text-white" fill="currentColor">
                <path d="M8.5 2.5L4 7.5 1.5 5" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
        </div>
    </button>
);

// ─── Color Swatches ───────────────────────────────────────────────────────────
const COLOR_PRESETS = [
    { hex: '#2563eb', name: 'Royal Blue' },
    { hex: '#7c3aed', name: 'Violet' },
    { hex: '#0f766e', name: 'Teal' },
    { hex: '#b45309', name: 'Amber' },
    { hex: '#dc2626', name: 'Crimson' },
    { hex: '#0ea5e9', name: 'Sky' },
    { hex: '#374151', name: 'Slate' },
    { hex: '#111827', name: 'Ink' },
];

// ─── Main StyleSidebar ────────────────────────────────────────────────────────
const StyleSidebar = () => {
    const { styleConfig, updateStyle, resetStyles } = useStyle();

    return (
        <div className="pb-24">

            {/* ── Typography ───────────────────────────────────────────── */}
            <SectionLabel icon="✦" title="Typography" />

            <RangeSlider
                label="Body Text Size"
                value={styleConfig.globalFontSize}
                min={10}
                max={16}
                onChange={(v) => updateStyle('globalFontSize', v)}
            />
            <RangeSlider
                label="Section Heading Size"
                value={styleConfig.headingFontSize}
                min={9}
                max={16}
                onChange={(v) => updateStyle('headingFontSize', v)}
            />
            <RangeSlider
                label="Name / Title Size"
                value={styleConfig.nameSize}
                min={20}
                max={48}
                onChange={(v) => updateStyle('nameSize', v)}
            />
            <RangeSlider
                label="Line Height"
                value={styleConfig.lineHeight}
                min={1.0}
                max={2.0}
                step={0.05}
                unit="×"
                onChange={(v) => updateStyle('lineHeight', v)}
            />

            <Divider />

            {/* ── Font Family ──────────────────────────────────────────── */}
            <SectionLabel icon="Aa" title="Font Family" />
            <div className="space-y-2">
                {FONT_OPTIONS.map((opt) => (
                    <FontCard
                        key={opt.value}
                        option={opt}
                        selected={styleConfig.fontFamily === opt.value}
                        onClick={() => updateStyle('fontFamily', opt.value)}
                    />
                ))}
            </div>

            <Divider />

            {/* ── Colors ───────────────────────────────────────────────── */}
            <SectionLabel icon="◉" title="Colors" />

            <div className="mb-4">
                <label className="text-sm font-medium text-slate-600 block mb-2.5">
                    Link &amp; Accent Color
                </label>

                {/* Color picker + live hex preview */}
                <div className="flex items-center gap-2 mb-3">
                    {/*
            Native <input type="color"> is invisible and positioned absolutely
            under the swatch so clicking the swatch opens the OS color picker.
          */}
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shadow-sm cursor-pointer flex-shrink-0">
                        <div
                            className="w-full h-full"
                            style={{ backgroundColor: styleConfig.linkColor }}
                        />
                        <input
                            type="color"
                            value={styleConfig.linkColor}
                            onChange={(e) => updateStyle('linkColor', e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            title="Pick a custom color"
                        />
                    </div>
                    <span className="text-sm font-mono text-slate-500 select-all">
                        {styleConfig.linkColor.toUpperCase()}
                    </span>
                </div>

                {/* Quick-pick swatches */}
                <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map(({ hex, name }) => {
                        const isActive = styleConfig.linkColor.toLowerCase() === hex.toLowerCase();
                        return (
                            <button
                                key={hex}
                                title={name}
                                onClick={() => updateStyle('linkColor', hex)}
                                className={`
                  w-7 h-7 rounded-full transition-all duration-150 hover:scale-110
                  ${isActive ? 'ring-2 ring-offset-1 ring-slate-600 scale-110' : 'ring-1 ring-white shadow-sm'}
                `}
                                style={{ backgroundColor: hex }}
                            />
                        );
                    })}
                </div>
            </div>

            <Divider />

            {/* ── Formatting ───────────────────────────────────────────── */}
            <SectionLabel icon="⌥" title="Formatting" />

            <div className="bg-slate-50 rounded-xl px-3 divide-y divide-slate-100">
                <Toggle
                    label="Bold Section Headers"
                    description="e.g. WORK EXPERIENCE, PROJECTS"
                    checked={styleConfig.boldHeaders}
                    onChange={(v) => updateStyle('boldHeaders', v)}
                />
            </div>

            <Divider />

            {/* ── Reset ────────────────────────────────────────────────── */}
            <button
                onClick={resetStyles}
                className="
          w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200
          text-sm font-semibold text-slate-400 flex items-center justify-center gap-2
          hover:border-red-300 hover:text-red-400 hover:bg-red-50
          transition-all duration-200 group
        "
            >
                {/* Rotation icon */}
                <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-90"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                </svg>
                Reset to Defaults
            </button>
        </div>
    );
};

export default StyleSidebar;
