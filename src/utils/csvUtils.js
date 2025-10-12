import Papa from "papaparse";

export const PRIZE_HEADERS = [
  "tier",
  "prize_name",
  "quantity",
  "weight",
  "sku",
  "notes"
];

export const PRICING_HEADERS = [
  "preset_id",
  "label",
  "draw_count",
  "price",
  "bonus_draws",
  "active"
];

export function parsePrizesCsv(csvText) {
  return parseCsv(csvText, PRIZE_HEADERS, (row) => ({
    tier: row.tier?.trim() ?? "",
    prize_name: row.prize_name?.trim() ?? "",
    quantity: Number.parseInt(row.quantity, 10) || 0,
    weight: Number.parseInt(row.weight, 10) || 1,
    sku: row.sku?.trim() ?? "",
    notes: row.notes?.trim() ?? ""
  }));
}

export function parsePricingCsv(csvText) {
  return parseCsv(
    csvText,
    PRICING_HEADERS,
    (row) => {
      const rawPrice =
        row.price ?? row.price_dollars ?? row.price_minor ?? row.price_major;

      let parsedPrice = Number.parseFloat(rawPrice);
      if (!Number.isFinite(parsedPrice)) {
        parsedPrice = 0;
      }

      if (!row.price && !row.price_dollars && row.price_minor) {
        parsedPrice /= 100;
      }

      return {
        preset_id: row.preset_id?.trim() ?? "",
        label: row.label?.trim() ?? "",
        draw_count: Number.parseInt(row.draw_count, 10) || 0,
        price: Math.round(parsedPrice),
        bonus_draws: Number.parseInt(row.bonus_draws, 10) || 0,
        active: String(row.active).toLowerCase() === "true"
      };
    },
    {
      fallbackHeaders: {
        price: ["price_dollars", "price_minor", "price_major"]
      }
    }
  );
}

export function exportToCsv(rows, headers) {
  return Papa.unparse({ fields: headers, data: rows.map((row) => headers.map((key) => row[key])) });
}

/**
 * Export a CSV template with headers only (no data rows)
 * @param {string[]} headers - Array of header names
 * @returns {string} CSV string with headers only
 */
export function exportCsvTemplate(headers) {
  return Papa.unparse({ fields: headers, data: [] });
}

/**
 * Download a CSV file to the user's computer
 * @param {string} csvContent - CSV content as string
 * @param {string} filename - Name of the file to download
 */
export function downloadCsv(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

function parseCsv(csvText, headers, mapRow, options = {}) {
  const { fallbackHeaders = {} } = options;

  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  const data = [];
  const errors = [...result.errors];
  const fields = result.meta.fields ?? [];

  const missingHeaders = headers.filter((header) => {
    if (fields.includes(header)) return false;
    const fallbacks = fallbackHeaders[header];
    if (!fallbacks) return true;
    return !fallbacks.some((fallback) => fields.includes(fallback));
  });

  if (missingHeaders.length) {
    errors.push({
      message: "CSV headers do not match the required template.",
      type: "HeadersMismatch"
    });
  }

  result.data.forEach((row, index) => {
    try {
      data.push(mapRow(row));
    } catch (error) {
      errors.push({
        message: error.message,
        type: "RowParseError",
        row: index
      });
    }
  });

  return { data, errors };
}