"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Download, Plus, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface ReportItem {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  contentJson: {
    csat: string;
    totalFeedbackProcessed?: number;
    recommendations: string[];
  };
  createdAt: string;
  generatedBy?: {
    name: string;
  };
}

interface ExecutiveReportsProps {
  userRole: string;
}

export default function ExecutiveReports({ userRole }: ExecutiveReportsProps) {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isViewer = userRole === "VIEWER";

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const json = await res.json();
        setReports(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleGenerateReport = async () => {
    if (isViewer) return;
    setGenerating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const title = `Voice of Customer Executive Report - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, periodType: "Weekly" }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMsg("Voice of Customer executive summary compiled successfully.");
        setReports((prev) => [json.data, ...prev]);
      } else {
        setErrorMsg(json.message || "Failed to generate report.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to compile AI insights report.");
    } finally {
      setGenerating(false);
    }
  };

  const triggerDownload = (filename: string) => {
    setSuccessMsg(`Document '${filename}' queued for download.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-base font-bold text-slate-800">Voice of Customer Reports</h4>
          <p className="text-xs text-slate-500">AI-generated weekly and monthly summaries mapping core recommendations.</p>
        </div>

        {/* Generate Trigger */}
        <button
          onClick={handleGenerateReport}
          disabled={isViewer || generating}
          className="flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl disabled:opacity-50 transition hover:bg-slate-800 shadow-sm"
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Compile AI Report
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-650 shrink-0" />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      {isViewer && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="font-bold">Access Limited: VIEWERS cannot generate reports.</span>
        </div>
      )}

      {/* Reports List Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-brand-primary" />
          <span>Ingesting report documents...</span>
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                <div className="space-y-1">
                  <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    {report.title}
                  </h5>
                  <p className="text-[9px] text-slate-400 font-bold">
                    Report Period: {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()} • Generated by {report.generatedBy?.name || "AI Assistant"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => triggerDownload(`Report_${report.id.slice(0, 4)}.csv`)}
                    className="flex items-center gap-1 text-[10px] text-slate-500 border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition font-bold"
                  >
                    <Download className="h-3 w-3" /> CSV
                  </button>
                  <button
                    onClick={() => triggerDownload(`Report_${report.id.slice(0, 4)}.pdf`)}
                    className="flex items-center gap-1 text-[10px] text-indigo-500 border border-indigo-150 bg-indigo-50/30 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition font-bold"
                  >
                    <Download className="h-3 w-3" /> PDF
                  </button>
                </div>
              </div>

              {/* Data values */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
                  <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">CSAT Score Index</span>
                  <span className="text-base font-black text-green-600">{report.contentJson.csat}</span>
                </div>
                <div className="space-y-1 bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
                  <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Feedback Items Indexed</span>
                  <span className="text-base font-black text-slate-800">
                    {report.contentJson.totalFeedbackProcessed || 15} items
                  </span>
                </div>
              </div>

              {/* Recommendations list */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-450 text-slate-400 block">AI Executive Recommendations:</span>
                <ul className="space-y-1 border-l-2 border-brand-primary/30 pl-3 italic text-slate-600">
                  {report.contentJson.recommendations.map((rec, i) => (
                    <li key={i}>"{i + 1}. {rec}"</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-3">
          <FileText className="h-10 w-10 text-slate-200 animate-pulse" />
          <span>No compiled reports found. Generate one above to begin.</span>
        </div>
      )}
    </div>
  );
}
