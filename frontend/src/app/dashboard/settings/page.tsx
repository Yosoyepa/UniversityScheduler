"use client";

/**
 * Settings Page — /dashboard/settings
 *
 * Multi-tab settings interface matching the mockup design.
 * Tabs: General, Alerts & Notifications, Privacy & Security, Appearance
 */

import React, { useState } from "react";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { useTheme } from "@/features/theme/context/ThemeContext";
import {
    UserIcon,
    BellIcon,
    ShieldIcon,
    PaletteIcon,
    SettingsIcon,
} from "@/components/atoms/Icon";
import type { IconProps } from "@/components/atoms/Icon";
import type { UpdateSettingsPayload } from "@/types/entities";

// =============================================================================
// Tab types
// =============================================================================

type SettingsTab = "general" | "alerts" | "privacy" | "appearance";

const TABS: { id: SettingsTab; label: string; icon: React.FC<Omit<IconProps, "children">> }[] = [
    { id: "general", label: "General", icon: UserIcon },
    { id: "alerts", label: "Alerts & Notifications", icon: BellIcon },
    { id: "privacy", label: "Privacy & Security", icon: ShieldIcon },
    { id: "appearance", label: "Appearance", icon: PaletteIcon },
];

const REMINDER_MINUTES_OPTIONS = [5, 10, 15, 30, 60, 120];
const REMINDER_DAYS_OPTIONS = [1, 2, 3, 5, 7, 14, 30];
const REMINDER_HOURS_OPTIONS = [1, 2, 4, 8, 12, 24, 48, 72];

// =============================================================================
// Toggle Switch Atom (local helper)
// =============================================================================

function ToggleSwitch({
    id,
    checked,
    onChange,
    disabled = false,
}: {
    id: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`
                relative inline-flex w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${checked ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
        >
            <span
                className={`
                    inline-block w-5 h-5 mt-0.5 rounded-full bg-white shadow transform transition-transform duration-200
                    ${checked ? "translate-x-6" : "translate-x-1"}
                `}
            />
        </button>
    );
}

// =============================================================================
// General Tab
// =============================================================================

function GeneralTab({ onDiscardChanges, isSaving, updateProfile }: {
    onDiscardChanges: () => void;
    isSaving: boolean;
    updateProfile: (p: { full_name?: string }) => Promise<void>;
}) {
    const [fullName, setFullName] = useState("");
    const [hasChanges, setHasChanges] = useState(false);

    const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFullName(e.target.value);
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (fullName.trim()) {
            await updateProfile({ full_name: fullName.trim() });
            setHasChanges(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    Profile Information
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Update your personal information
                </p>
            </div>

            {/* Avatar placeholder */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <UserIcon size="lg" className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile photo</p>
                    <p className="text-xs text-gray-400">Coming soon</p>
                </div>
            </div>

            {/* Full Name field */}
            <div>
                <label
                    htmlFor="settings-full-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                    Full Name
                </label>
                <input
                    id="settings-full-name"
                    type="text"
                    value={fullName}
                    onChange={handleFullNameChange}
                    placeholder="Tu nombre completo"
                    className="
                        w-full max-w-sm px-3 py-2 rounded-lg border text-sm
                        bg-white dark:bg-gray-800
                        border-gray-300 dark:border-gray-600
                        text-gray-900 dark:text-white
                        placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-indigo-500
                    "
                />
            </div>

            {/* Action buttons */}
            {hasChanges && (
                <div className="flex gap-3 pt-2">
                    <button
                        id="settings-save-profile"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {isSaving ? "Guardando..." : "Save Changes"}
                    </button>
                    <button
                        id="settings-discard-profile"
                        onClick={() => { setFullName(""); setHasChanges(false); onDiscardChanges(); }}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Discard Changes
                    </button>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// Alerts & Notifications Tab
// =============================================================================

function AlertsTab({
    settings,
    pending,
    setPending,
    onSave,
    onDiscard,
    isSaving,
}: {
    settings: UpdateSettingsPayload;
    pending: UpdateSettingsPayload;
    setPending: (p: UpdateSettingsPayload) => void;
    onSave: (p: UpdateSettingsPayload) => void;
    onDiscard: () => void;
    isSaving: boolean;
}) {
    const merged = { ...settings, ...pending };
    const hasChanges = Object.keys(pending).length > 0;

    const update = (key: keyof UpdateSettingsPayload, val: unknown) =>
        setPending({ ...pending, [key]: val });

    return (
        <div className="space-y-8">
            {/* Notification Channels */}
            <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Notification Channels
                </h3>
                <div className="space-y-4">
                    {[
                        { key: "email_notifications" as const, label: "Email Notifications", desc: "Receive updates and reminders via email" },
                        { key: "push_notifications" as const, label: "Push Notifications", desc: "Browser push notifications (coming soon)" },
                        { key: "sms_alerts" as const, label: "SMS Alerts", desc: "Text message alerts for critical events (coming soon)" },
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                            </div>
                            <ToggleSwitch
                                id={`settings-toggle-${key}`}
                                checked={!!merged[key]}
                                onChange={(val) => update(key, val)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Reminder Timing */}
            <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Reminder Timing
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <label htmlFor="settings-class-reminder" className="text-sm font-medium text-gray-800 dark:text-gray-200 block mb-2">
                            Class Reminders
                        </label>
                        <select
                            id="settings-class-reminder"
                            value={merged.class_reminder_minutes ?? 15}
                            onChange={(e) => update("class_reminder_minutes", Number(e.target.value))}
                            className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {REMINDER_MINUTES_OPTIONS.map((m) => (
                                <option key={m} value={m}>{m < 60 ? `${m} minutes before` : `${m / 60} hour before`}</option>
                            ))}
                        </select>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <label htmlFor="settings-exam-reminder" className="text-sm font-medium text-gray-800 dark:text-gray-200 block mb-2">
                            Exam Reminders
                        </label>
                        <select
                            id="settings-exam-reminder"
                            value={merged.exam_reminder_days ?? 1}
                            onChange={(e) => update("exam_reminder_days", Number(e.target.value))}
                            className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {REMINDER_DAYS_OPTIONS.map((d) => (
                                <option key={d} value={d}>{d === 1 ? "1 day before" : `${d} days before`}</option>
                            ))}
                        </select>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <label htmlFor="settings-assignment-reminder" className="text-sm font-medium text-gray-800 dark:text-gray-200 block mb-2">
                            Assignment Deadlines
                        </label>
                        <select
                            id="settings-assignment-reminder"
                            value={merged.assignment_reminder_hours ?? 2}
                            onChange={(e) => update("assignment_reminder_hours", Number(e.target.value))}
                            className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {REMINDER_HOURS_OPTIONS.map((h) => (
                                <option key={h} value={h}>{h < 24 ? `${h} hours before` : `${h / 24} days before`}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Calendar Integration placeholder */}
            <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Calendar Integration
                </h3>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-600 flex items-center gap-3">
                    <div className="text-2xl">📅</div>
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Google Calendar</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Integration coming in Phase 6</p>
                    </div>
                    <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">Soon</span>
                </div>
            </div>

            {/* Save / Discard buttons */}
            {hasChanges && (
                <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                        id="settings-save-preferences"
                        onClick={() => onSave(pending)}
                        disabled={isSaving}
                        className="px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {isSaving ? "Guardando..." : "Save Preferences"}
                    </button>
                    <button
                        id="settings-discard-preferences"
                        onClick={onDiscard}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Discard Changes
                    </button>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// Appearance Tab
// =============================================================================

function AppearanceTab({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Theme</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize the visual appearance of the app</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Dark Mode</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Switch between light and dark themes</p>
                </div>
                <ToggleSwitch id="settings-dark-mode" checked={isDark} onChange={onToggle} />
            </div>
        </div>
    );
}

// =============================================================================
// Privacy Tab (Skeleton)
// =============================================================================

function PrivacyTab() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Privacy & Security</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your privacy preferences</p>
            </div>
            <div className="p-8 text-center rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-sm text-gray-400">Privacy controls coming in Phase 8</p>
            </div>
        </div>
    );
}

// =============================================================================
// Page Component
// =============================================================================

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("general");
    const { settings, isLoading, isSaving, updateSettings, updateProfile, discardChanges, pendingChanges, setPendingChanges } = useSettings();
    const { isDark, toggleTheme, setTheme } = useTheme();

    const handleDarkModeToggle = async () => {
        toggleTheme();
        await updateSettings({ dark_mode: !isDark });
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Page header */}
                <div className="flex items-center gap-3 mb-8">
                    <SettingsIcon size="lg" className="text-indigo-600 dark:text-indigo-400" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account preferences</p>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar tabs */}
                    <nav aria-label="Settings navigation" className="w-48 flex-shrink-0">
                        <ul className="space-y-1">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <li key={tab.id}>
                                        <button
                                            id={`settings-tab-${tab.id}`}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                                                ${isActive
                                                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                }
                                            `}
                                        >
                                            <Icon size="sm" />
                                            {tab.label}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Tab content */}
                    <main className="flex-1 min-w-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-48">
                                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                                {activeTab === "general" && (
                                    <GeneralTab
                                        onDiscardChanges={discardChanges}
                                        isSaving={isSaving}
                                        updateProfile={updateProfile}
                                    />
                                )}
                                {activeTab === "alerts" && settings && (
                                    <AlertsTab
                                        settings={settings}
                                        pending={pendingChanges}
                                        setPending={setPendingChanges}
                                        onSave={updateSettings}
                                        onDiscard={discardChanges}
                                        isSaving={isSaving}
                                    />
                                )}
                                {activeTab === "privacy" && <PrivacyTab />}
                                {activeTab === "appearance" && (
                                    <AppearanceTab isDark={isDark} onToggle={handleDarkModeToggle} />
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </DashboardLayout>
    );
}
