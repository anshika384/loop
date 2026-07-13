import prisma from "./prisma";

export interface ParsedRow {
  content: string;
  channel: string;
  customerLabel?: string;
  sourceRef?: string;
}

export interface CSVValidationReport {
  headers: string[];
  totalRows: number;
  validRows: ParsedRow[];
  invalidRowsCount: number;
  duplicateRowsCount: number;
  invalidRowLogs: string[];
}

export interface ImportSummary {
  success: boolean;
  totalRows: number;
  imported: number;
  skipped: number;
  failed: number;
  processingTimeMs: number;
}

/**
 * Split line by commas, but handle values enclosed in double quotes correctly.
 */
export function parseCSVLine(line: string): string[] {
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
}

/**
 * Parses raw CSV text and returns validation statistics, lists of valid entries, and logs of violations.
 */
export function parseAndValidateCSV(csvText: string): CSVValidationReport {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      headers: [],
      totalRows: 0,
      validRows: [],
      invalidRowsCount: 0,
      duplicateRowsCount: 0,
      invalidRowLogs: ["The CSV file contains no records."],
    };
  }

  const rawHeaders = parseCSVLine(lines[0]);
  const headers = rawHeaders.map((h) => h.toLowerCase().trim());

  const contentIdx = headers.indexOf("content");
  const channelIdx = headers.indexOf("channel");
  const customerLabelIdx = headers.indexOf("customerlabel");
  const sourceRefIdx = headers.indexOf("sourceref");

  // Enforce required content and channel columns
  if (contentIdx === -1 || channelIdx === -1) {
    return {
      headers: rawHeaders,
      totalRows: lines.length - 1,
      validRows: [],
      invalidRowsCount: lines.length - 1,
      duplicateRowsCount: 0,
      invalidRowLogs: ["Required columns 'content' and 'channel' are missing from the header."],
    };
  }

  const validRows: ParsedRow[] = [];
  let invalidRowsCount = 0;
  let duplicateRowsCount = 0;
  const invalidRowLogs: string[] = [];
  const seenKeys = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const columns = parseCSVLine(rawLine);

    const content = columns[contentIdx]?.trim() || "";
    const channel = columns[channelIdx]?.trim() || "";
    const customerLabel = customerLabelIdx !== -1 ? columns[customerLabelIdx]?.trim() : undefined;
    const sourceRef = sourceRefIdx !== -1 ? columns[sourceRefIdx]?.trim() : undefined;

    if (!content || !channel) {
      invalidRowsCount++;
      invalidRowLogs.push(`Row ${i}: Missing content or channel value.`);
      continue;
    }

    const dupKey = `${content.toLowerCase()}||${channel.toLowerCase()}`;
    if (seenKeys.has(dupKey)) {
      duplicateRowsCount++;
      invalidRowLogs.push(`Row ${i}: Duplicate feedback item inside file.`);
      continue;
    }

    seenKeys.add(dupKey);
    validRows.push({
      content,
      channel,
      customerLabel: customerLabel || undefined,
      sourceRef: sourceRef || undefined,
    });
  }

  return {
    headers: rawHeaders,
    totalRows: lines.length - 1,
    validRows,
    invalidRowsCount,
    duplicateRowsCount,
    invalidRowLogs,
  };
}

/**
 * Classifies feedback sentiment score using simple key word references.
 */
export function classifySentiment(content: string): { sentiment: "POS" | "NEU" | "NEG"; score: number } {
  const positiveKeywords = ["great", "love", "amazing", "good", "fast", "awesome", "beautiful", "satisfied", "helpful", "perfect", "resolved"];
  const negativeKeywords = ["lag", "slow", "fail", "timeout", "bug", "error", "worst", "unhappy", "broken", "missing", "crash", "stuck"];
  const contentLower = content.toLowerCase();

  const isPos = positiveKeywords.some((kw) => contentLower.includes(kw));
  const isNeg = negativeKeywords.some((kw) => contentLower.includes(kw));

  if (isPos && !isNeg) {
    return { sentiment: "POS", score: 0.9 };
  } else if (isNeg && !isPos) {
    return { sentiment: "NEG", score: 0.15 };
  } else {
    return { sentiment: "NEU", score: 0.5 };
  }
}

/**
 * Inserts list of validated CSV records inside PostgreSQL.
 */
export async function bulkImport(rows: ParsedRow[], workspaceId: string): Promise<ImportSummary> {
  const startTime = Date.now();
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  try {
    await prisma.$transaction(async (tx) => {
      for (const row of rows) {
        try {
          // De-duplicate check against PostgreSQL records
          const duplicate = await tx.feedback.findFirst({
            where: {
              workspaceId,
              content: row.content,
              channel: row.channel,
            },
          });

          if (duplicate) {
            skipped++;
            continue;
          }

          const { sentiment, score } = classifySentiment(row.content);

          await tx.feedback.create({
            data: {
              content: row.content,
              channel: row.channel,
              customerLabel: row.customerLabel || null,
              sourceRef: row.sourceRef || null,
              sentiment,
              sentimentScore: score,
              status: "NEW",
              workspaceId,
            },
          });
          imported++;
        } catch (e) {
          console.error("Failed to insert row:", row, e);
          failed++;
        }
      }

      if (imported > 0) {
        await tx.activity.create({
          data: {
            action: "CSV imported",
            target: `${imported} feedback records`,
            workspaceId,
          },
        });
      }
    });

    return {
      success: true,
      totalRows: rows.length,
      imported,
      skipped,
      failed,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error("Bulk import transaction failed:", error);
    return {
      success: false,
      totalRows: rows.length,
      imported: 0,
      skipped: 0,
      failed: rows.length,
      processingTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Inserts single logged manual feedback log inside database.
 */
export async function addSingleFeedback(row: ParsedRow, workspaceId: string): Promise<any> {
  const { sentiment, score } = classifySentiment(row.content);

  const created = await prisma.feedback.create({
    data: {
      content: row.content,
      channel: row.channel,
      customerLabel: row.customerLabel || null,
      sourceRef: row.sourceRef || null,
      sentiment,
      sentimentScore: score,
      status: "NEW",
      workspaceId,
    },
  });

  await prisma.activity.create({
    data: {
      action: "Manual feedback added",
      target: `Via ${row.channel}`,
      workspaceId,
    },
  });

  return created;
}

/**
 * Permanently deletes feedback and logs the admin's action in the activity feed.
 */
export async function deleteFeedback(feedbackId: string, workspaceId: string, adminName: string): Promise<any> {
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
  });

  if (!feedback || feedback.workspaceId !== workspaceId) {
    throw new Error("Feedback not found or access denied.");
  }

  const deleted = await prisma.feedback.delete({
    where: { id: feedbackId },
  });

  // Log activity action
  const snippet = feedback.content.substring(0, 40) + (feedback.content.length > 40 ? "..." : "");
  await prisma.activity.create({
    data: {
      action: "Feedback deleted",
      target: `Deleted feedback: "${snippet}" by ${adminName}`,
      workspaceId,
    },
  });

  return deleted;
}
