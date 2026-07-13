"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, PlusCircle, AlertCircle, RefreshCw, CheckCircle2, ShieldAlert, FileText, Trash2, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ParsedFeedback {
  content: string;
  channel: string;
  customerLabel?: string;
  sourceRef?: string;
}

interface ValidationReport {
  headers: string[];
  totalRows: number;
  validRows: ParsedFeedback[];
  invalidRowsCount: number;
  duplicateRowsCount: number;
  invalidRowLogs: string[];
}

interface ImportSummary {
  success: boolean;
  totalRows: number;
  imported: number;
  skipped: number;
  failed: number;
  processingTimeMs: number;
}

interface ImportManagerProps {
  userRole: string;
  onImportSuccess: () => void;
}

export default function ImportManager({ userRole, onImportSuccess }: ImportManagerProps) {
  const [activeTab, setActiveTab] = useState<"csv" | "manual">("csv");

  // Manual Ingestion Form States
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("Intercom");
  const [customerLabel, setCustomerLabel] = useState("");
  const [sourceRef, setSourceRef] = useState("");
  const [submittingManual, setSubmittingManual] = useState(false);

  // CSV Drag and Drop States
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Import Execution States
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  // Status Alerts
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isViewer = userRole === "VIEWER";

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (isViewer) {
    return (
      <div className="p-8 text-center border border-red-200 bg-red-50/50 rounded-2xl max-w-xl mx-auto shadow-sm my-12 space-y-4">
        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-extrabold text-slate-800">403 Forbidden - Access Denied</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          You do not have permission to import or create customer feedback. Feedback ingestion is reserved for workspace Admins and Analysts.
        </p>
      </div>
    );
  }

  // Quote-aware CSV line parsing
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result.map((val) => {
      if (val.startsWith('"') && val.endsWith('"')) {
        return val.slice(1, -1).trim();
      }
      return val;
    });
  };

  // Client-side CSV parser and validator
  const handleCSVValidation = (text: string) => {
    setValidationError(null);
    setValidationReport(null);

    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length <= 1) {
      setValidationError("The CSV file must contain a header row and at least one feedback row.");
      return;
    }

    const rawHeaders = parseCSVLine(lines[0]);
    const headers = rawHeaders.map((h) => h.toLowerCase().trim());

    const contentIdx = headers.indexOf("content");
    const channelIdx = headers.indexOf("channel");
    const customerLabelIdx = headers.indexOf("customerlabel");
    const sourceRefIdx = headers.indexOf("sourceref");

    if (contentIdx === -1 || channelIdx === -1) {
      setValidationError("Required columns 'content' and 'channel' are missing from the header row.");
      return;
    }

    const validRows: ParsedFeedback[] = [];
    let invalidRowsCount = 0;
    let duplicateRowsCount = 0;
    const invalidRowLogs: string[] = [];
    const seenKeys = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const rawLine = lines[i];
      const columns = parseCSVLine(rawLine);

      const contentVal = columns[contentIdx]?.trim() || "";
      const channelVal = columns[channelIdx]?.trim() || "";
      const customerLabelVal = customerLabelIdx !== -1 ? columns[customerLabelIdx]?.trim() : undefined;
      const sourceRefVal = sourceRefIdx !== -1 ? columns[sourceRefIdx]?.trim() : undefined;

      if (!contentVal || !channelVal) {
        invalidRowsCount++;
        invalidRowLogs.push(`Row ${i}: Missing content or channel value.`);
        continue;
      }

      const dupKey = `${contentVal.toLowerCase()}||${channelVal.toLowerCase()}`;
      if (seenKeys.has(dupKey)) {
        duplicateRowsCount++;
        invalidRowLogs.push(`Row ${i}: Duplicate feedback item inside file.`);
        continue;
      }

      seenKeys.add(dupKey);
      validRows.push({
        content: contentVal,
        channel: channelVal,
        customerLabel: customerLabelVal || undefined,
        sourceRef: sourceRefVal || undefined,
      });
    }

    setValidationReport({
      headers: rawHeaders,
      totalRows: lines.length - 1,
      validRows,
      invalidRowsCount,
      duplicateRowsCount,
      invalidRowLogs,
    });
  };

  const handleFileChange = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setValidationError("Invalid file type. Accept only .csv files.");
      setSelectedFile(null);
      setValidationReport(null);
      return;
    }

    setSelectedFile(file);
    setValidationError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleCSVValidation(text);
    };
    reader.readAsText(file);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !channel) return;

    setSubmittingManual(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          channel,
          customerLabel: customerLabel.trim() || undefined,
          sourceRef: sourceRef.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        triggerToast("Manual feedback added successfully.");
        setSuccessText("Manual feedback comment logged successfully in database.");
        setContent("");
        setCustomerLabel("");
        setSourceRef("");
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

  const handleBulkImport = async () => {
    if (!validationReport || validationReport.validRows.length === 0) return;

    setImporting(true);
    setErrorText(null);
    setSuccessText(null);
    setProgress(5);

    // Mock progress steps
    const interval = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + 20));
    }, 150);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validationReport.validRows),
      });

      clearInterval(interval);
      setProgress(100);

      const json = await res.json();
      if (res.ok && json.success) {
        setImportSummary(json.data);
        triggerToast("CSV feedback imported successfully.");
        // Clear active stats file
        setSelectedFile(null);
        setValidationReport(null);
        onImportSuccess();
      } else {
        setErrorText(json.message || "Failed to import feedback rows.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Connection failed during bulk import.");
    } finally {
      setTimeout(() => {
        setImporting(false);
        setProgress(0);
      }, 500);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setValidationReport(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h4 className="text-base font-bold text-slate-800">Log & Import Customer Feedback</h4>
          <p className="text-xs text-slate-500">Submit singular reviews or upload CSV listings for batch AI analysis.</p>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => {
              setActiveTab("csv");
              setErrorText(null);
              setSuccessText(null);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "csv" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Ingest CSV File
          </button>
          <button
            onClick={() => {
              setActiveTab("manual");
              setErrorText(null);
              setSuccessText(null);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "manual" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {successText && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span className="font-bold">{successText}</span>
        </div>
      )}

      {errorText && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span className="font-bold">{errorText}</span>
        </div>
      )}

      {/* Ingestion views */}
      <div className="max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "csv" ? (
            <motion.div
              key="csv"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">CSV Bulk Ingestion</h5>

              {/* Drag and Drop Zone */}
              {!selectedFile && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 h-52 ${
                    dragActive
                      ? "border-brand-primary bg-brand-primary/5"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file);
                    }}
                  />
                  <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Upload className="h-6 w-6 animate-bounce" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-700">Drag & Drop CSV sheet here</div>
                    <div className="text-[10px] text-slate-400">Or click to browse files from computer</div>
                  </div>
                  <div className="text-[8px] bg-slate-150 text-slate-500 font-black tracking-wide uppercase px-2 py-0.5 rounded">
                    Accept Only .csv
                  </div>
                </div>
              )}

              {/* Invalid Selection Alert */}
              {validationError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-655 text-red-600 shrink-0" />
                  <span className="font-bold">{validationError}</span>
                </div>
              )}

              {/* CSV Verification Preview */}
              {selectedFile && validationReport && (
                <div className="space-y-4 border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={clearSelectedFile}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 px-2 py-1 rounded-lg transition cursor-pointer"
                    >
                      Remove File
                    </button>
                  </div>

                  {/* Validation Statistics cards */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[16px] font-black text-slate-800 block">{validationReport.totalRows}</span>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block">Rows Found</span>
                    </div>
                    <div className="bg-green-50/50 p-2.5 rounded-xl border border-green-100">
                      <span className="text-[16px] font-black text-green-700 block">{validationReport.validRows.length}</span>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-green-500 block">Valid Rows</span>
                    </div>
                    <div className="bg-red-50/30 p-2.5 rounded-xl border border-red-100">
                      <span className="text-[16px] font-black text-red-600 block">{validationReport.invalidRowsCount}</span>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-red-400 block">Invalid Rows</span>
                    </div>
                    <div className="bg-amber-50/30 p-2.5 rounded-xl border border-amber-100">
                      <span className="text-[16px] font-black text-amber-600 block">{validationReport.duplicateRowsCount}</span>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-400 block">Duplicates</span>
                    </div>
                  </div>

                  {/* Display list of violations */}
                  {validationReport.invalidRowLogs.length > 0 && (
                    <div className="bg-red-50/30 border border-red-100 rounded-xl p-3 max-h-24 overflow-y-auto space-y-1">
                      <p className="text-[9px] font-bold text-red-655 text-red-600 uppercase tracking-wider">Validation Errors:</p>
                      {validationReport.invalidRowLogs.map((log, idx) => (
                        <p key={idx} className="text-[9px] text-red-600 leading-snug font-medium">• {log}</p>
                      ))}
                    </div>
                  )}

                  {/* Ingest Action triggers */}
                  <div className="pt-2">
                    {validationReport.invalidRowsCount === 0 && validationReport.duplicateRowsCount === 0 && validationReport.validRows.length > 0 ? (
                      <button
                        onClick={handleBulkImport}
                        disabled={importing}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-secondary to-brand-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-md disabled:opacity-50 transition cursor-pointer"
                      >
                        {importing ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Processing CSV Ingestion ({progress}%)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            Ingest {validationReport.validRows.length} Valid Records <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          disabled
                          className="w-full bg-slate-100 text-slate-400 text-xs font-bold py-2.5 rounded-xl border border-slate-200 cursor-not-allowed"
                        >
                          Import Blocked: Resolve Validation Failures
                        </button>
                        <p className="text-[9px] text-slate-400 text-center">
                          CSV files must contain zero duplicate or invalid rows to allow database ingestion.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress loading animation */}
              {importing && (
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-primary h-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Import Completed Summary Popup Overlay */}
              <AnimatePresence>
                {importSummary && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden"
                    >
                      <div className="space-y-4">
                        <div className="border-b border-slate-100 pb-3 text-center">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-600 mb-2">
                            <Check className="h-5 w-5" />
                          </div>
                          <h3 className="text-base font-bold text-slate-900">Import Completed Successfully</h3>
                          <p className="text-xs text-slate-500">CSV transaction pipeline completed.</p>
                        </div>

                        <div className="space-y-2 text-xs text-slate-700">
                          <div className="flex justify-between py-1.5 border-b border-slate-50">
                            <span className="font-bold text-slate-400">Total File Rows</span>
                            <span className="font-bold text-slate-800">{importSummary.totalRows}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-50">
                            <span className="font-bold text-slate-400">Imported Successfully</span>
                            <span className="font-bold text-green-600">{importSummary.imported}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-50">
                            <span className="font-bold text-slate-400">Skipped (Postgres Duplicates)</span>
                            <span className="font-bold text-amber-500">{importSummary.skipped}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-50">
                            <span className="font-bold text-slate-400">Database Failures</span>
                            <span className="font-bold text-red-500">{importSummary.failed}</span>
                          </div>
                          <div className="flex justify-between py-1.5 border-b border-slate-50">
                            <span className="font-bold text-slate-400">Processing Time</span>
                            <span className="font-bold text-slate-800">
                              {importSummary.processingTimeMs >= 1000
                                ? `${(importSummary.processingTimeMs / 1000).toFixed(2)}s`
                                : `${importSummary.processingTimeMs}ms`}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setImportSummary(null)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer mt-2"
                        >
                          Acknowledge & Close
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">Manual Feedback Entry</h5>

              <form onSubmit={handleManualSubmit} className="space-y-4 border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold block">Feedback Content</label>
                  <textarea
                    required
                    disabled={submittingManual}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="e.g. Invoices downloads fail entirely when I click the export report button..."
                    className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl p-3 focus:outline-none focus:border-brand-primary/30 h-28 placeholder-slate-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">Source Channel</label>
                    <select
                      value={channel}
                      disabled={submittingManual}
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

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">Customer Label (optional)</label>
                    <input
                      type="text"
                      disabled={submittingManual}
                      value={customerLabel}
                      onChange={(e) => setCustomerLabel(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold block">Source Reference (optional)</label>
                  <input
                    type="text"
                    disabled={submittingManual}
                    value={sourceRef}
                    onChange={(e) => setSourceRef(e.target.value)}
                    placeholder="e.g. REF-INVOICE-098"
                    className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingManual || !content.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-secondary to-brand-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-md disabled:opacity-50 transition cursor-pointer"
                >
                  {submittingManual ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <PlusCircle className="h-3.5 w-3.5" />
                  )}
                  Add Feedback Log
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating success toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-55 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 border border-slate-800"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
