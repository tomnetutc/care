import * as d3 from 'd3';

export interface DataRow {
  [key: string]: string | number;
}

class DataService {
  private static instance: DataService;
  private cachedData: d3.DSVRowArray<string> | null = null;
  private loadingPromise: Promise<d3.DSVRowArray<string>> | null = null;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public async getData(): Promise<d3.DSVRowArray<string>> {
    // If data is already cached, return it immediately
    if (this.cachedData) {
      return Promise.resolve(this.cachedData);
    }

    // If a request is already in progress, return the same promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Start a new fetch request
    this.loadingPromise = this.fetchData();
    
    try {
      this.cachedData = await this.loadingPromise;
      return this.cachedData;
    } catch (error) {
      this.loadingPromise = null; // Reset on error so we can retry
      throw error;
    }
  }

  private async fetchData(): Promise<d3.DSVRowArray<string>> {
    const response = await fetch(`${process.env.PUBLIC_URL}/leaphi_final_data.csv`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const csvText = await response.text();
    return d3.csvParse(csvText);
  }

  // Method to clear cache if needed (for testing or data updates)
  public clearCache(): void {
    this.cachedData = null;
    this.loadingPromise = null;
  }
}

export default DataService;