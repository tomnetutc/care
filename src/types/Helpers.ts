export interface DataItem {
  [key: string]: string | number;
}

export interface ProcessedDataItem {
  question: string;
  values: {
    category: string;
    value: number;
    count: number;
  }[];
}

export interface SummaryStatistic {
  question: string;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  responses: number;
}

export interface ChartSegment {
  question: string;
  category: string;
  value: number;
  count: number;
  start: number;
  end: number;
}

export interface StackedData {
  question: string;
  questionId: string;
  segments: ChartSegment[];
}

export interface LikertChartProps {
  questionId: string;
  title: string;
  subtitle?: string;
  questionOrder?: string[];
  questionLabels?: Record<string, string>;
  responseCategories?: string[];
  categoryColors?: string[];
  categoryLabels?: string[];
  showSummaryTable?: boolean;
  dataProcessor?: (data: ProcessedDataItem[]) => ProcessedDataItem[];
  sourceCategories?: string[];
  legendWrap?: boolean;
  summaryString?: string;
}

export interface LikertDataOptions {
  questionOrder: string[];
  questionLabels: Record<string, string>;
  responseCategories: string[];
  sourceCategories?: string[];
  dataProcessor?: (data: ProcessedDataItem[]) => ProcessedDataItem[];
}