/**
 * SectionOrderPanel
 * ─────────────────────────────────────────────────────────────────────
 * A drag-and-drop list that lets the user reorder **and show/hide**
 * resume sections without touching the actual preview.
 *
 * Built with @dnd-kit/core + @dnd-kit/sortable:
 *  • DndContext       — provides drag events
 *  • SortableContext  — manages item IDs and sorting strategy
 *  • useSortable      — hook attached to each item; gives drag props
 *  • verticalListSortingStrategy — optimised hit-detection for vertical lists
 *  • arrayMove        — utility to reorder the array on drag end
 *
 * State:
 *  • sectionOrder (from StyleContext) — drives the rendered order
 *  • showSummary  (from StyleContext) — gates whether "Summary" appears
 */

import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useStyle, ALL_SECTIONS } from '../../context/StyleContext';

// ─── Individual draggable row ─────────────────────────────────────────────────
const SortableItem = ({ id, label, icon, isLocked, styleConfig, updateStyle }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.85 : 1,
    };

    // "Summary" has a dedicated visibility toggle; other sections are always visible
    const isSummary = id === 'summary';
    const isVisible = isSummary ? styleConfig.showSummary : true;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl border-2
        transition-colors duration-100 select-none
        ${isDragging
                    ? 'border-blue-400 bg-blue-50 shadow-lg'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }
      `}
        >
            {/* Drag handle — only the grip icon initiates drag */}
            <button
                {...attributes}
                {...listeners}
                className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing
                   focus:outline-none p-0.5 flex-shrink-0 touch-none"
                aria-label={`Drag to reorder ${label}`}
            >
                {/* 6-dot grip icon */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <circle cx="4" cy="3" r="1.2" />
                    <circle cx="10" cy="3" r="1.2" />
                    <circle cx="4" cy="7" r="1.2" />
                    <circle cx="10" cy="7" r="1.2" />
                    <circle cx="4" cy="11" r="1.2" />
                    <circle cx="10" cy="11" r="1.2" />
                </svg>
            </button>

            {/* Section icon + label */}
            <span className="text-sm leading-none">{icon}</span>
            <span className="flex-1 text-sm font-medium text-slate-700">{label}</span>

            {/* Summary-specific show/hide toggle */}
            {isSummary && (
                <button
                    onClick={() => updateStyle('showSummary', !styleConfig.showSummary)}
                    title={isVisible ? 'Hide Summary' : 'Show Summary'}
                    className={`
            relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent
            cursor-pointer transition-colors duration-200
            ${isVisible ? 'bg-blue-500' : 'bg-slate-200'}
          `}
                >
                    <span
                        className={`
              pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm
              transition-transform duration-200
              ${isVisible ? 'translate-x-4' : 'translate-x-0'}
            `}
                    />
                </button>
            )}
        </div>
    );
};

// ─── Main panel ───────────────────────────────────────────────────────────────
const SectionOrderPanel = () => {
    const { styleConfig, updateStyle, reorderSections } = useStyle();
    const { sectionOrder } = styleConfig;

    // Build a lookup for icon + label from ALL_SECTIONS
    const sectionMeta = Object.fromEntries(ALL_SECTIONS.map((s) => [s.id, s]));

    // Sensors: pointer (mouse/touch) + keyboard for accessibility
    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Require a 6px move before DnD activates so accidental drags don't fire
            activationConstraint: { distance: 6 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;

        const oldIndex = sectionOrder.indexOf(active.id);
        const newIndex = sectionOrder.indexOf(over.id);
        reorderSections(arrayMove(sectionOrder, oldIndex, newIndex));
    };

    return (
        <div>
            <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                Drag the <span className="font-semibold">⠿</span> handle to reorder sections.
                Toggle <span className="font-semibold">Summary</span> on/off with its switch.
            </p>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {sectionOrder.map((id) => {
                            const meta = sectionMeta[id];
                            if (!meta) return null;
                            return (
                                <SortableItem
                                    key={id}
                                    id={id}
                                    label={meta.label}
                                    icon={meta.icon}
                                    styleConfig={styleConfig}
                                    updateStyle={updateStyle}
                                />
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default SectionOrderPanel;
