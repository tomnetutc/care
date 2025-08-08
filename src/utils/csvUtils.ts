// CSV field quoting utility
export function quoteField(field: string | number): string {
  const str = String(field);
  if (str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  if (str.includes(",") || str.includes("\n")) {
    return `"${str}"`;
  }
  return str;
}

// Format number to 2 decimal places for CSV export
export function formatNumberForCSV(value: number): number {
  return Math.round(value * 100) / 100;
}

// Format percentage with 1 decimal place and % symbol
export function formatPercentageForCSV(value: number): string {
  return `${(Math.round(value * 10) / 10).toFixed(1)}%`;
}

// CSV generation function for chart data
export function chartDataToCSV(
  data: { [key: string]: string | number }[],
  datasets: { label: string }[]
): string {
  const header = ["Name", ...datasets.map((ds) => ds.label)]
    .map(quoteField)
    .join(",");

  const rows = data.map((entry) => {
    const row = [
      entry.name,
      ...datasets.map((ds) => {
        const value = entry[ds.label];
        if (typeof value === 'number') {
          // Check if this is a percentage column
          if (ds.label.toLowerCase().includes('percentage') || ds.label.toLowerCase().includes('percent')) {
            return formatPercentageForCSV(value);
          }
          return formatNumberForCSV(value);
        }
        return value || 0;
      }),
    ].map(quoteField);
    return row.join(",");
  });

  return [header, ...rows].join("\r\n");
}

// Download handler function
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 