"use client";

import { useState, useEffect } from "react";
import { Settings, RefreshCw, CheckCircle2, AlertCircle, ShieldAlert, User, Image } from "lucide-react";

interface SettingsManagerProps {
  userRole: string;
  initialWorkspaceName: string;
  userName: string;
  userEmail: string;
}

export default function SettingsManager({
  userRole,
  initialWorkspaceName,
  userName,
  userEmail,
}: SettingsManagerProps) {
  // Profile settings state
  const [profileName, setProfileName] = useState(userName);
  const [profileEmail, setProfileEmail] = useState(userEmail);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  // Workspace settings state
  const [workspaceName, setWorkspaceName] = useState(initialWorkspaceName);
  const [timezone, setTimezone] = useState("UTC - 5:00 (EST)");
  const [language, setLanguage] = useState("English (US)");

  // Notification states
  const [unreadAlerts, setUnreadAlerts] = useState(true);
  const [aiSpikeAlerts, setAiSpikeAlerts] = useState(true);
  const [importStatus, setImportStatus] = useState(false);

  // Operation flags
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    const stored = localStorage.getItem("loop_avatar");
    if (stored) setSelectedAvatar(stored);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setSelectedAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) return;

    setSavingProfile(true);
    setSuccessText(null);
    setErrorText(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName.trim(), email: profileEmail.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        // Save avatar locally
        if (selectedAvatar) {
          localStorage.setItem("loop_avatar", selectedAvatar);
          window.dispatchEvent(new Event("loop_avatar_updated"));
        }
        setSuccessText("Profile details and picture updated successfully.");
      } else {
        setErrorText(json.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Connection error while updating profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!workspaceName.trim()) return;

    setSavingWorkspace(true);
    setSuccessText(null);
    setErrorText(null);

    try {
      const res = await fetch("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessText("Workspace preferences saved successfully.");
      } else {
        setErrorText(json.message || "Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Connection error while updating workspace settings.");
    } finally {
      setSavingWorkspace(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-10">
      <div className="border-b border-slate-100 pb-3">
        <h4 className="text-base font-bold text-slate-800">Workspace Configurations</h4>
        <p className="text-xs text-slate-500">Alter company preferences, user profile details, and active notifications.</p>
      </div>

      {successText && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span className="font-bold">{successText}</span>
        </div>
      )}

      {errorText && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-650 shrink-0" />
          <span className="font-bold">{errorText}</span>
        </div>
      )}

      {/* 1. Profile Details & Picture */}
      <form onSubmit={handleProfileSubmit} className="space-y-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <User className="h-4 w-4 text-slate-400" /> Admin Profile details
          </h5>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">Profile Name</label>
              <input
                type="text"
                required
                disabled={savingProfile}
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">Gmail Email</label>
              <input
                type="email"
                required
                disabled={savingProfile}
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary/30"
              />
            </div>

            {/* Gallery File Upload */}
            <div className="space-y-2 col-span-2 flex items-center gap-4 border-t border-slate-100 pt-3 mt-1">
              <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center relative shadow-inner">
                {selectedAvatar ? (
                  <img src={selectedAvatar} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-6 w-6 text-slate-400 animate-pulse" />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-black block">Profile Picture (from Gallery)</label>
                <input
                  type="file"
                  id="avatar-file-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-file-upload"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-705 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
                >
                  <Image className="h-4 w-4 text-slate-400" />
                  <span>Choose Photo from Gallery</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile || !profileName.trim() || !profileEmail.trim()}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl shadow-md hover:bg-slate-800 transition cursor-pointer"
          >
            {savingProfile ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span>Save Profile Details</span>
            )}
          </button>
        </div>
      </form>

      {/* 2. Workspace settings */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="font-bold">Access Limited: Workspace metadata modifications are Admin-only. Settings locked.</span>
        </div>
      )}

      <form onSubmit={handleWorkspaceSubmit} className="space-y-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-450 text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Settings className="h-4 w-4 text-slate-400" /> Workspace Preferences
          </h5>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] text-slate-400 font-bold block">Company / Workspace Name</label>
              <input
                type="text"
                required
                disabled={!isAdmin || savingWorkspace}
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary/30 disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">Timezone Profile</label>
              <select
                disabled={!isAdmin || savingWorkspace}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full text-xs border border-slate-200 bg-white text-slate-700 rounded-xl p-2.5 outline-none disabled:opacity-60"
              >
                <option value="UTC - 5:00 (EST)">UTC - 5:00 (EST)</option>
                <option value="UTC + 0:00 (GMT)">UTC + 0:00 (GMT)</option>
                <option value="UTC + 5:30 (IST)">UTC + 5:30 (IST)</option>
                <option value="UTC + 8:00 (SGT)">UTC + 8:00 (SGT)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">Preferred Language</label>
              <select
                disabled={!isAdmin || savingWorkspace}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs border border-slate-200 bg-white text-slate-700 rounded-xl p-2.5 outline-none disabled:opacity-60"
              >
                <option value="English (US)">English (US)</option>
                <option value="Spanish (ES)">Spanish (ES)</option>
                <option value="French (FR)">French (FR)</option>
                <option value="German (DE)">German (DE)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Notifications checkboxes */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Notification Subscriptions
          </h5>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-755 font-bold">
              <input
                type="checkbox"
                disabled={savingWorkspace}
                checked={unreadAlerts}
                onChange={(e) => setUnreadAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-slate-350 text-brand-primary focus:ring-brand-primary"
              />
              <span>Send me emails for unread workspace notifications.</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-755 font-bold">
              <input
                type="checkbox"
                disabled={savingWorkspace}
                checked={aiSpikeAlerts}
                onChange={(e) => setAiSpikeAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-slate-355 text-brand-primary focus:ring-brand-primary"
              />
              <span>Alert me immediately on critical AI trend anomalies.</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-755 font-bold">
              <input
                type="checkbox"
                disabled={savingWorkspace}
                checked={importStatus}
                onChange={(e) => setImportStatus(e.target.checked)}
                className="h-4 w-4 rounded border-slate-355 text-brand-primary focus:ring-brand-primary"
              />
              <span>Receive summaries upon bulk file CSV ingestion completes.</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isAdmin || savingWorkspace || !workspaceName.trim()}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl shadow-md hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
        >
          {savingWorkspace ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <span>Save Workspace Preferences</span>
          )}
        </button>
      </form>
    </div>
  );
}
