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
    executiveSummary?: string;
    recommendations?: string[];
    topThemes?: string[];
    positiveThemes?: string[];
    negativeThemes?: string[];
    customerQuotes?: string[];
    businessRisks?: string[];
    priorityActions?: string[];
    trendSpikes?: string[];
    improvements?: string[];
    roadmap?: string[];
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

  const handleDownload = async (reportId: string, format: "pdf" | "csv", filename: string) => {
    setSuccessMsg(`Compiling your ${format.toUpperCase()} document...`);
    try {
      const res = await fetch(`/api/reports/${reportId}/${format}`);
      if (!res.ok) {
        throw new Error(`Failed to compile ${format.toUpperCase()} document.`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSuccessMsg(`Report exported successfully as ${filename}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || `An error occurred while compiling your export.`);
      setTimeout(() => setErrorMsg(null), 4000);
    }
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
                    onClick={() => handleDownload(report.id, "csv", `voice-of-customer-report-${report.id.slice(0, 5)}.csv`)}
                    className="flex items-center gap-1 text-[10px] text-slate-500 border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition font-bold"
                  >
                    <Download className="h-3 w-3" /> CSV
                  </button>
                  <button
                    onClick={() => handleDownload(report.id, "pdf", `voice-of-customer-report-${report.id.slice(0, 5)}.pdf`)}
                    className="flex items-center gap-1 text-[10px] text-indigo-500 border border-indigo-150 bg-indigo-50/30 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition font-bold"
                  >
                    <Download className="h-3 w-3" /> PDF
                  </button>
                </div>
              </div>

              {/* Data values & Detailed Lists */}
              {(() => {
                const content = report.contentJson || {};
                const csat = content.csat || "0.0%";
                const totalProcessed = content.totalFeedbackProcessed || 0;
                
                const recommendations = content.recommendations || [];
                const topThemes = content.topThemes || [];
                const positiveThemes = content.positiveThemes || [];
                const negativeThemes = content.negativeThemes || [];
                const customerQuotes = content.customerQuotes || [];
                const businessRisks = content.businessRisks || [];
                const priorityActions = content.priorityActions || [];
                const trendSpikes = content.trendSpikes || [];
                const improvements = content.improvements || [];
                const roadmap = content.roadmap || [];

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1 bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
                        <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">CSAT Score Index</span>
                        <span className="text-base font-black text-green-600">{csat}</span>
                      </div>
                      <div className="space-y-1 bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
                        <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Feedback Items Indexed</span>
                        <span className="text-base font-black text-slate-800">
                          {totalProcessed} items
                        </span>
                      </div>
                    </div>

                    {/* Executive Summary */}
                    {content.executiveSummary && (
                      <div className="text-[11px] bg-slate-100/50 p-3 rounded-xl border border-slate-200/40 text-slate-650 leading-relaxed font-medium">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1">Executive Summary</span>
                        {content.executiveSummary}
                      </div>
                    )}

                    {/* Top Themes Badges */}
                    {topThemes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 shrink-0">Top Themes:</span>
                        {topThemes.map((theme: string, i: number) => (
                          <span key={i} className="bg-slate-200/60 text-slate-700 text-[9px] px-2 py-0.5 rounded-md font-bold">
                            {theme}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Detailed AI Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs pt-1 border-t border-slate-100">
                      
                      {/* Left Column */}
                      <div className="space-y-3.5">
                        {/* Recommendations */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">AI Executive Recommendations</span>
                          {recommendations.length > 0 ? (
                            <ul className="space-y-1 border-l-2 border-brand-primary/30 pl-3 italic text-slate-600">
                              {recommendations.map((rec: string, i: number) => (
                                <li key={i}>"{rec}"</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-400 italic text-[11px] pl-3">No recommendations available</p>
                          )}
                        </div>

                        {/* Priority Actions */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Priority Actions</span>
                          {priorityActions.length > 0 ? (
                            <ul className="space-y-1 list-disc list-inside text-slate-650 pl-1">
                              {priorityActions.map((act: string, i: number) => (
                                <li key={i} className="font-semibold text-slate-700">{act}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-400 italic text-[11px] pl-1">No priority actions available</p>
                          )}
                        </div>

                        {/* Customer Quotes */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Customer Voice Quotes</span>
                          {customerQuotes.length > 0 ? (
                            <div className="space-y-2">
                              {customerQuotes.map((q: string, i: number) => (
                                <div key={i} className="bg-indigo-50/30 border border-indigo-100/50 p-2 rounded-lg text-[11px] text-indigo-950 font-medium italic">
                                  "{q}"
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic text-[11px] pl-1">No customer quotes yet</p>
                          )}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3.5">
                        {/* Key Business Risks */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block text-red-500">Key Business Risks</span>
                          {businessRisks.length > 0 ? (
                            <ul className="space-y-1 list-disc list-inside text-slate-600 pl-1">
                              {businessRisks.map((risk: string, i: number) => (
                                <li key={i} className="text-red-700/90 font-medium">{risk}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-400 italic text-[11px] pl-1">No business risks identified yet</p>
                          )}
                        </div>

                        {/* Trend Spikes & Anomalies */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Flagged Spikes & Anomalies</span>
                          {trendSpikes.length > 0 ? (
                            <ul className="space-y-1 text-slate-650 pl-1">
                              {trendSpikes.map((spike: string, i: number) => (
                                <li key={i} className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 text-amber-800 px-2 py-1 rounded-lg text-[10px] font-semibold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                  {spike}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-400 italic text-[11px] pl-1">No trend spikes identified</p>
                          )}
                        </div>

                        {/* Roadmap */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Product Roadmap Schedule</span>
                          {roadmap.length > 0 ? (
                            <ul className="space-y-1 text-slate-650 pl-1">
                              {roadmap.map((item: string, i: number) => (
                                <li key={i} className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 px-2 py-1 rounded-lg text-[10px] font-semibold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-400 italic text-[11px] pl-1">No roadmap items scheduled</p>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}
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
