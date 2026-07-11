"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, PlusCircle, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

interface ParsedFeedback {
  content: string;
  channel: string;
}

interface ImportManagerProps {
  userRole: string;
  onImportSuccess: () => void;
}

export default function ImportManager({ userRole, onImportSuccess }: ImportManagerProps) {
  // Manual feedback state
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("Intercom");
  const [submittingManual, setSubmittingManual] = useState(false);

  // File import state
  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedFeedback[]>([]);
  const [importingFile, setImportingFile] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Status feedback states
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const isViewer = userRole === "VIEWER";

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    if (!content.trim() || !channel) return;

    setSubmittingManual(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), channel }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessText("Feedback comment logged successfully in database.");
        setContent("");
        onImportSuccess();
      } else {
        setErrorText(json.message || "Failed to log feedback.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Something went wrong. Please check connection.");
    } finally {
      setSubmittingManual(false);
    }
  };

  const simulateCSVParse = () => {
    if (isViewer) return;
    setErrorText(null);
    setSuccessText(null);
    
    // Simulate loading a CSV file with 3 typical rows
    const mockRows: ParsedFeedback[] = [
      { content: "Stripe checkout failing periodically on Android Chrome version 124.", channel: "Zendesk" },
      { content: "Love the dashboard preview animation, very clean UI!", channel: "App Store" },
      { content: "Safari latency when downloading PDF invoices is still present.", channel: "Intercom" },
    ];
    setParsedRows(mockRows);
  };

  const handleBulkImport = async () => {
    if (isViewer || parsedRows.length === 0) return;

    setImportingFile(true);
    setErrorText(null);
    setSuccessText(null);
    setProgress(10);

    // Progress interval animation
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 20;
      });
    }, 200);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedRows),
      });

      const json = await res.json();
      clearInterval(interval);
      setProgress(100);

      if (res.ok && json.success) {
        setSuccessText(`Successfully imported and AI-analyzed ${parsedRows.length} feedbacks.`);
        setParsedRows([]);
        onImportSuccess();
      } else {
        setErrorText(json.message || "Failed to import rows.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Connection failed during bulk import.");
    } finally {
      setTimeout(() => {
        setImportingFile(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="border-b border-slate-100 pb-3">
        <h4 className="text-base font-bold text-slate-800">Log & Import Customer Feedback</h4>
        <p className="text-xs text-slate-500">Submit singular reviews or upload CSV listings for batch AI analysis.</p>
      </div>

      {/* Banner Indicators */}
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

      {isViewer && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="font-bold">Access Limited: You hold the VIEWER role. Ingestion actions are disabled.</span>
        </div>
      )}

      {/* Grid forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Manual Form */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">Manual Feedback Entry</h5>
          
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold block">Feedback Content</label>
            <textarea
              required
              disabled={isViewer || submittingManual}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Stripe checkout throws 402 code error on credit card form click..."
              className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl p-3 focus:outline-none focus:border-brand-primary/30 h-28 placeholder-slate-400 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold block">Source Channel</label>
            <select
              value={channel}
              disabled={isViewer || submittingManual}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-700 rounded-xl p-2.5 outline-none"
            >
              <option value="Intercom">Intercom Messenger</option>
              <option value="Zendesk">Zendesk Support</option>
              <option value="App Store">App Store Reviews</option>
              <option value="Twitter">Twitter/X Mentions</option>
              <option value="Slack">Slack Community</option>
              <option value="Hubspot">Hubspot Integration</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isViewer || submittingManual || !content.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-secondary to-brand-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-md disabled:opacity-50 transition"
          >
            {submittingManual ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlusCircle className="h-3.5 w-3.5" />
            )}
            Add Feedback Log
          </button>
        </form>

        {/* 2. File Import */}
        <div className="space-y-4">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">CSV Bulk Ingestion</h5>
          
          {/* Uploader Mock Drop-zone */}
          <div
            onClick={() => !isViewer && simulateCSVParse()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); !isViewer && simulateCSVParse(); }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 h-44 ${
              isViewer
                ? "bg-slate-50 border-slate-200 cursor-not-allowed opacity-60"
                : dragActive
                ? "border-brand-primary bg-brand-primary/5"
                : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
            }`}
          >
            <Upload className="h-8 w-8 text-slate-350 text-slate-400 animate-bounce" />
            <div className="text-xs font-bold text-slate-700">Drag & Drop CSV / Excel sheet here</div>
            <div className="text-[9px] text-slate-400 font-bold">Or click to select mock document</div>
          </div>

          {/* Import progress/preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                  {parsedRows.length} Rows Parsed
                </span>
                <button
                  onClick={() => setParsedRows([])}
                  className="text-slate-400 hover:text-slate-655"
                >
                  Clear
                </button>
              </div>

              {/* Ingest action button */}
              <button
                onClick={handleBulkImport}
                disabled={isViewer || importingFile}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl shadow-md hover:bg-slate-800 disabled:opacity-50 transition"
              >
                {importingFile ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Ingesting ({progress}%)
                  </span>
                ) : (
                  <span>Import Preview Logs</span>
                )}
              </button>
            </div>
          )}

          {/* Progress bar */}
          {importingFile && (
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-primary h-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
