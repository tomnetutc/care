import { csvParse } from 'd3';

export class VisualizationDataProvider {
  private static instance: VisualizationDataProvider;
  private data: any[] | null = null;
  private loadingPromise: Promise<any[]> | null = null;
  
  private constructor() {}
  
  public static getInstance(): VisualizationDataProvider {
    if (!VisualizationDataProvider.instance) {
      VisualizationDataProvider.instance = new VisualizationDataProvider();
    }
    return VisualizationDataProvider.instance;
  }
  
  public async loadData(): Promise<any[]> {
    // Return cached data if available
    if (this.data !== null) {
      return this.data;
    }
    
    // Return existing promise if already loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }
    
    // Create loading promise and clear when done
    this.loadingPromise = this.loadFromSource().finally(() => {
      this.loadingPromise = null;
    });
    
    return this.loadingPromise;
  }
  
  private async loadFromSource(): Promise<any[]> {
    try {
      const isGitHubPages = window.location.hostname.includes('github.io');
      
      // Try multiple sources
      const sources = [
        // GitHub Pages path
        isGitHubPages ? 
          '/hard/leaphi_final_data.csv' :
          // Local development paths
          '/leaphi_final_data.csv',
        './leaphi_final_data.csv',
        'leaphi_final_data.csv'
      ];
      
      let csvData = null;
      let lastError = null;
      
      // Try each source until one works
      for (const source of sources) {
        try {
          console.log(`Trying to load data from: ${source}`);
          const response = await fetch(source);
          
          if (!response.ok) {
            console.warn(`Failed to load from ${source}: ${response.status} ${response.statusText}`);
            continue;
          }
          
          csvData = await response.text();
          console.log(`Successfully loaded from ${source}`);
          break;
        } catch (error) {
          console.warn(`Error loading from ${source}:`, error);
          lastError = error;
        }
      }
      
      // If all sources failed, use fallback URL
      if (!csvData) {
        console.log("Trying fallback GitHub raw URL");
        try {
          const fallbackUrl = "https://raw.githubusercontent.com/YourGitHubUsername/hard/main/public/leaphi_final_data.csv";
          const response = await fetch(fallbackUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch from ${fallbackUrl}: ${response.status}`);
          }
          csvData = await response.text();
        } catch (fallbackError) {
          console.error("Fallback URL also failed:", fallbackError);
          throw lastError || fallbackError;
        }
      }
      
      if (!csvData) {
        throw new Error("Failed to load data from all sources");
      }
      
      // Parse CSV data
      this.data = csvParse(csvData);
      return this.data;
    } catch (error) {
      console.error("Error loading data:", error);
      throw error;
    }
  }
}