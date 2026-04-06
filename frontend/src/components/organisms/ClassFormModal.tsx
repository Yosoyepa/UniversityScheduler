/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
/**
 * ClassFormModal Organism Component.
 *
 * Dual-column Modal form for creating/editing subjects and class sessions.
 * Follows add_and_edit_class_details_1 mockup.
 */

"use client";

import { useState, type FormEvent, useEffect } from "react";
import type {
    DifficultyLevel,
    SubjectType,
    DayOfWeek,
    HexColor,
} from "@/types";
import { useProfessors } from "@/features/professors/hooks/useProfessors";

// =============================================================================
// Types & Defaults
// =============================================================================

export interface ClassSessionFormData {
    id?: string;
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    classroom: string;
    is_virtual: boolean;
}

export interface SubjectFormData {
    id?: string;
    name: string;
    credits: number;
    difficulty: DifficultyLevel;
    subject_type: SubjectType;
    professor_id: string | null;
    color: HexColor;
    sessions: ClassSessionFormData[];
}

export interface ClassFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: SubjectFormData) => void;
    initialData?: Partial<SubjectFormData>;
    loading?: boolean;
}

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; colorClass: string; activeClass: string }[] = [
    { value: "HARD", label: "Hard", colorClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800", activeClass: "ring-2 ring-red-500 ring-offset-1 opacity-100" },
    { value: "MEDIUM", label: "Medium", colorClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800", activeClass: "ring-2 ring-yellow-500 ring-offset-1 opacity-100" },
    { value: "EASY", label: "Easy", colorClass: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800", activeClass: "ring-2 ring-green-500 ring-offset-1 opacity-100" }
];

const SUBJECT_TYPE_OPTIONS: { value: SubjectType; label: string }[] = [
    { value: "DISCIPLINAR_OBLIGATORIA", label: "Disciplinar Obligatoria" },
    { value: "DISCIPLINAR_OPTATIVA", label: "Disciplinar Optativa" },
    { value: "FUNDAMENTAL_OBLIGATORIA", label: "Fundamental Obligatoria" },
    { value: "FUNDAMENTAL_OPTATIVA", label: "Fundamental Optativa" },
    { value: "LIBRE_ELECCION", label: "Libre Elección" },
    { value: "TRABAJO_DE_GRADO", label: "Trabajo de Grado" },
];

const DAY_OPTIONS: { value: DayOfWeek; letter: string }[] = [
    { value: 1, letter: "M" },
    { value: 2, letter: "T" },
    { value: 3, letter: "W" },
    { value: 4, letter: "T" },
    { value: 5, letter: "F" },
    { value: 6, letter: "S" },
    { value: 7, letter: "S" },
];

const DEFAULT_COLORS: HexColor[] = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

const EMPTY_SESSION: ClassSessionFormData = {
    day_of_week: 1,
    start_time: "07:00",
    end_time: "09:00",
    classroom: "",
    is_virtual: false,
};

// =============================================================================
// Helper Component: Custom Toggle
// =============================================================================
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`}
            />
        </button>
    );
}

// =============================================================================
// Main Component
// =============================================================================
export function ClassFormModal({
    open,
    onClose,
    onSubmit,
    initialData,
    loading = false,
}: ClassFormModalProps) {
    const { professors } = useProfessors();
    
    // UI Local State Mocks (Not persisted in backend directly)
    const [alert10, setAlert10] = useState(false);
    const [alert1h, setAlert1h] = useState(true);
    const [attendanceReq, setAttendanceReq] = useState(true);
    const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
    
    // Core Form State
    const [formData, setFormData] = useState<SubjectFormData>({
        name: "",
        credits: 3,
        difficulty: "MEDIUM",
        subject_type: "DISCIPLINAR_OBLIGATORIA",
        professor_id: null,
        color: DEFAULT_COLORS[0],
        sessions: [{ ...EMPTY_SESSION }],
    });

    useEffect(() => {
        if (open) {
            const data = {
                name: initialData?.name || "",
                credits: initialData?.credits || 3,
                difficulty: initialData?.difficulty || "MEDIUM",
                subject_type: initialData?.subject_type || "DISCIPLINAR_OBLIGATORIA",
                professor_id: initialData?.professor_id || null,
                color: initialData?.color || DEFAULT_COLORS[0],
                sessions: initialData?.sessions && initialData.sessions.length > 0 ? initialData.sessions : [{ ...EMPTY_SESSION }],
            };
            setFormData(data as SubjectFormData);
            setSelectedDays(data.sessions.map((s: any) => s.day_of_week));
        }
    }, [open, initialData]);

    if (!open) return null;

    // --- State Handlers ---
    const handleDayToggle = (day: DayOfWeek) => {
        let newDays = [...selectedDays];
        if (newDays.includes(day)) {
            newDays = newDays.filter((d) => d !== day);
            if (newDays.length === 0) newDays = [1]; // Ensure at least 1 day
        } else {
            newDays.push(day);
        }
        setSelectedDays(newDays);

        // Sync to sessions array
        const baseSession = formData.sessions[0] || { ...EMPTY_SESSION };
        const newSessions = newDays.map((d) => {
            const existing = formData.sessions.find(s => s.day_of_week === d);
            return existing ? existing : { ...baseSession, day_of_week: d };
        });
        setFormData(prev => ({ ...prev, sessions: newSessions }));
    };

    const updateSharedSessionField = (field: keyof ClassSessionFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => ({ ...s, [field]: value }))
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Derived session info for UI
    const activeSession = formData.sessions[0] || { ...EMPTY_SESSION };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative w-full max-w-5xl h-[90vh] bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-gray-700 pointer-events-auto">
                    
                    {/* Left Column: Form */}
                    <div className="w-full md:w-7/12 lg:w-2/3 p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {initialData?.name ? "Edit Class Details" : "New Class Details"}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update course information and alert preferences.</p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <span className="material-icons-round text-2xl">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
                            {/* Subject & Core Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <span className="material-icons-round text-lg">school</span>
                                        </span>
                                        <input
                                            required
                                            type="text"
                                            className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-colors"
                                            placeholder="e.g. Calculus I"
                                            value={formData.name}
                                            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professor</label>
                                    <select
                                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm shadow-sm"
                                        value={formData.professor_id || ""}
                                        onChange={(e) => setFormData(p => ({ ...p, professor_id: e.target.value || null }))}
                                    >
                                        <option value="">Unassigned</option>
                                        {professors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select
                                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm shadow-sm"
                                        value={formData.subject_type}
                                        onChange={(e) => setFormData(p => ({ ...p, subject_type: e.target.value as SubjectType }))}
                                    >
                                        {SUBJECT_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                
                                <div className="col-span-2 md:col-span-1">
                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credits</label>
                                     <input
                                        type="number"
                                        min="0"
                                        className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm shadow-sm"
                                        value={formData.credits}
                                        onChange={(e) => setFormData(p => ({ ...p, credits: parseInt(e.target.value) || 0 }))}
                                    />
                                </div>
                                
                                {/* Color Picker inline */}
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Color</label>
                                    <div className="flex gap-1.5 flex-wrap mt-1">
                                        {DEFAULT_COLORS.map(c => (
                                            <button
                                                key={c} type="button"
                                                className={`w-6 h-6 rounded-full border-2 transition-transform ${formData.color === c ? 'border-gray-900 dark:border-white scale-125' : 'border-transparent'}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setFormData(p => ({ ...p, color: c as HexColor }))}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Time & Location */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-4">Time &amp; Location</h3>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repeats On</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {DAY_OPTIONS.map((d) => {
                                            const isSelected = selectedDays.includes(d.value);
                                            return (
                                                <button
                                                    key={d.value}
                                                    type="button"
                                                    onClick={() => handleDayToggle(d.value)}
                                                    className={`w-10 h-10 rounded-full font-medium text-sm flex items-center justify-center transition-all transform active:scale-95 ${
                                                        isSelected 
                                                            ? "bg-primary text-white shadow-md border-transparent" 
                                                            : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary"
                                                    }`}
                                                >
                                                    {d.letter}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm shadow-sm"
                                            value={activeSession.start_time}
                                            onChange={(e) => updateSharedSessionField('start_time', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm shadow-sm"
                                            value={activeSession.end_time}
                                            onChange={(e) => updateSharedSessionField('end_time', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location / URL</label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <span className="text-xs uppercase font-bold text-gray-500">Virtual</span>
                                            <ToggleSwitch checked={activeSession.is_virtual} onChange={() => updateSharedSessionField('is_virtual', !activeSession.is_virtual)} />
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <span className="material-icons-round text-lg">{activeSession.is_virtual ? 'link' : 'meeting_room'}</span>
                                        </span>
                                        <input
                                            type="text"
                                            className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm shadow-sm"
                                            placeholder={activeSession.is_virtual ? "Meeting URL" : "Room Number"}
                                            value={activeSession.classroom}
                                            onChange={(e) => updateSharedSessionField('classroom', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Mocked Settings */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 md:pb-0">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alert Settings</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center cursor-pointer group">
                                            <input type="checkbox" checked={alert10} onChange={() => setAlert10(!alert10)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600" />
                                            <span className="ml-2 block text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">10 minutes before</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer group">
                                            <input type="checkbox" checked={alert1h} onChange={() => setAlert1h(!alert1h)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600" />
                                            <span className="ml-2 block text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">1 hour before</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Attendance Required</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Is attendance mandatory?</span>
                                        </div>
                                        <ToggleSwitch checked={attendanceReq} onChange={() => setAttendanceReq(!attendanceReq)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Difficulty</label>
                                        <div className="flex items-center space-x-2">
                                            {DIFFICULTY_OPTIONS.map((diff) => (
                                                <button
                                                    type="button"
                                                    key={diff.value}
                                                    onClick={() => setFormData(p => ({ ...p, difficulty: diff.value }))}
                                                    className={`px-2.5 py-0.5 rounded-md text-xs border font-medium cursor-pointer transition-all ${diff.colorClass} ${formData.difficulty === diff.value ? diff.activeClass : 'opacity-50 hover:opacity-100'}`}
                                                >
                                                    {diff.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Mobile Actions */}
                            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 md:hidden">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Cancel</button>
                                <button type="button" onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-hover focus:outline-none flex items-center">
                                    {loading ? <span className="material-icons-round text-sm animate-spin mr-1">sync</span> : null}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Preview Dashboard */}
                    <div className="hidden md:flex w-5/12 lg:w-1/3 bg-gray-50 dark:bg-gray-900/50 border-l border-gray-200 dark:border-gray-700 p-8 flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-6">Preview on Calendar</h3>
                            
                            {/* Entity Preview Card */}
                            <div className="relative bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 mb-8">
                                <div className="absolute -left-px top-4 bottom-4 w-1 rounded-r" style={{ backgroundColor: formData.color }}></div>
                                <div className="flex justify-between items-start mb-2 pl-3">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: formData.color, backgroundColor: `${formData.color}20` }}>
                                        {formData.subject_type.substring(0, 10).replace(/_/g, ' ')}...
                                    </span>
                                    <span className="material-icons-round text-gray-400 text-sm">more_horiz</span>
                                </div>
                                <div className="pl-3">
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1 truncate">{formData.name || "Untitled Class"}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{formData.credits} Credits</p>
                                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        <span className="material-icons-round text-sm mr-1.5">schedule</span>
                                        {activeSession.start_time} - {activeSession.end_time}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                        <span className="material-icons-round text-sm mr-1.5">{activeSession.is_virtual ? 'videocam' : 'room'}</span>
                                        <span className="truncate">{activeSession.classroom || "No Location"}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Graphical Mockup rendering */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-inner opacity-75">
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Day Overview</div>
                                <div className="space-y-2 relative">
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                                        <div className="border-t border-gray-400 w-full h-8"></div>
                                        <div className="border-t border-gray-400 w-full h-8"></div>
                                        <div className="border-t border-gray-400 w-full h-8"></div>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-400">
                                        <span className="w-10 text-right mr-2">{activeSession.start_time}</span>
                                        <div className="h-8 flex-grow border-t border-gray-100 dark:border-gray-700"></div>
                                    </div>
                                    <div className="flex items-start text-xs text-gray-400">
                                        <span className="w-10 text-right mr-2 pt-1">Now</span>
                                        <div className="border-l-2 rounded p-1 flex-grow h-16 relative z-10" style={{ backgroundColor: `${formData.color}20`, borderColor: formData.color}}>
                                            <div className="text-[10px] font-bold truncate" style={{ color: formData.color }}>{formData.name || 'Preview'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-400 mt-[-1rem]">
                                        <span className="w-10 text-right mr-2">{activeSession.end_time}</span>
                                        <div className="h-8 flex-grow"></div> 
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Actions */}
                        <div className="flex justify-end space-x-3 mt-6">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-800 transition-all">Cancel</button>
                            <button type="button" onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 text-sm font-medium text-white bg-primary border border-transparent rounded-lg shadow-md hover:bg-primary-hover focus:outline-none transition-all flex items-center">
                                {loading ? <span className="material-icons-round text-sm animate-spin mr-2">sync</span> : <span className="material-icons-round text-sm mr-2">save</span>}
                                Save Schedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
