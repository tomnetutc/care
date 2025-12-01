import * as d3 from 'd3';

export interface DataRow {
  [key: string]: string | number;
}

class DataService {
  private static instance: DataService;
  private cachedData: d3.DSVRowArray<string> | null = null;
  private loadingPromise: Promise<d3.DSVRowArray<string>> | null = null;
  // Separate cache for scenario analysis data (df_output.csv with derived variables)
  private cachedScenarioData: d3.DSVRowArray<string> | null = null;
  private loadingScenarioPromise: Promise<d3.DSVRowArray<string>> | null = null;

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
    const response = await fetch(`${process.env.PUBLIC_URL}/df_dashboard.csv`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const csvText = await response.text();
    const parsedData = d3.csvParse(csvText);
    
    // Add computed race field for filtering
    parsedData.forEach((row: any) => {
      // Determine the primary race category
      const selectedRaces = [
        row['race_indian_native'] === '1' ? 'indian_native' : null,
        row['race_asian'] === '1' ? 'asian' : null,
        row['race_black'] === '1' ? 'black' : null,
        row['race_native_pacific'] === '1' ? 'native_pacific' : null,
        row['race_white'] === '1' ? 'white' : null,
        row['race_other'] && String(row['race_other']).trim() !== '' && row['race_other'] !== '0' && row['race_other'] !== '-8' ? 'other' : null
      ].filter(Boolean);
      
      if (selectedRaces.length === 0) {
        row['race'] = 'none';
      } else if (selectedRaces.length === 1) {
        row['race'] = selectedRaces[0];
      } else {
        row['race'] = 'multiple';
      }
      
      // Add computed employment field for filtering
      const employmentStatus = row['employment_status'];
      if (employmentStatus === '1' || employmentStatus === '2') {
        // Both a worker and a student (1) OR A worker (2) = Worker
        row['employment'] = 'worker';
      } else if (employmentStatus === '3' || employmentStatus === '4') {
        // A student (3) OR Neither a worker nor a student (4) = Non-Worker
        row['employment'] = 'non-worker';
      } else {
        row['employment'] = 'unknown';
      }
      
      // Add computed education field for filtering
      const educationLevel = row['educ'];
      if (educationLevel === '1') {
        row['education'] = 'less-than-high-school';
      } else if (educationLevel === '2') {
        row['education'] = 'high-school';
      } else if (educationLevel === '3' || educationLevel === '4' || educationLevel === '5') {
        // Some college (3) OR Vocational/technical training (4) OR Associate degree (5) = Some college Degree
        row['education'] = 'some-college-degree';
      } else if (educationLevel === '6') {
        row['education'] = 'bachelors-degree';
      } else if (educationLevel === '7') {
        row['education'] = 'graduate-degree';
      } else {
        row['education'] = 'unknown';
      }
      
      // Add computed license field for filtering
      const licenseStatus = row['license'];
      if (licenseStatus === '1') {
        row['license_status'] = 'yes';
      } else if (licenseStatus === '2') {
        row['license_status'] = 'no';
      } else {
        row['license_status'] = 'unknown';
      }
      
      // Add computed household size field for filtering
      const householdSize = row['hh_size'];
      if (householdSize === '1') {
        row['household_size_category'] = 'one';
      } else if (householdSize === '2') {
        row['household_size_category'] = 'two';
      } else if (householdSize === '3' || householdSize === '4' || householdSize === '5' || householdSize === '6' || householdSize === '7' || householdSize === '8' || householdSize === '9') {
        row['household_size_category'] = 'three-or-more';
      } else {
        row['household_size_category'] = 'unknown';
      }
      
      // Add computed household income field for filtering
      const householdIncome = row['hh_income'];
      if (householdIncome === '1' || householdIncome === '2') {
        // Less than $9,999, $10,000 - $24,999
        row['household_income_category'] = 'less-than-25';
      } else if (householdIncome === '3' || householdIncome === '4') {
        // $25,000 - $34,999, $35,000 - $49,999
        row['household_income_category'] = '25-50';
      } else if (householdIncome === '5' || householdIncome === '6') {
        // $50,000 - $74,999, $75,000 - $99,999
        row['household_income_category'] = '50-100';
      } else if (householdIncome === '7' || householdIncome === '8') {
        // $100,000 - $149,999, $150,000 - $199,999
        row['household_income_category'] = '100-200';
      } else if (householdIncome === '9' || householdIncome === '10') {
        // $200,000 - $249,999, $250,000 or higher
        row['household_income_category'] = '200-or-more';
      } else {
        // Prefer not to answer (11) or other values
        row['household_income_category'] = 'unknown';
      }
      
      // Add computed housing type field for filtering
      const housingType = row['hh_unit'];
      if (housingType === '1') {
        // Stand-alone/detached house
        row['housing_type_category'] = 'stand-alone';
      } else if (housingType === '2' || housingType === '3') {
        // Attached home/townhome + Apartment/condo
        row['housing_type_category'] = 'apartment';
      } else if (housingType === '4' || housingType === '5') {
        // Mobile home + Other
        row['housing_type_category'] = 'other';
      } else {
        // Unknown values
        row['housing_type_category'] = 'unknown';
      }
      
      // Add computed home ownership field for filtering
      const homeOwnership = row['hh_tenure'];
      if (homeOwnership === '1') {
        // Rent
        row['home_ownership_category'] = 'rent';
      } else if (homeOwnership === '2') {
        // Own
        row['home_ownership_category'] = 'own';
      } else {
        // Other (3,4,5) or unknown values
        row['home_ownership_category'] = 'unknown';
      }
      
      // Add computed number of vehicles field for filtering
      const numberOfVehicles = row['hh_veh'];
      if (numberOfVehicles === '0') {
        // 0 vehicles
        row['vehicles_category'] = 'vehicles-0';
      } else if (numberOfVehicles === '1') {
        // 1 vehicle
        row['vehicles_category'] = 'vehicles-1';
      } else if (numberOfVehicles === '2') {
        // 2 vehicles
        row['vehicles_category'] = 'vehicles-2';
      } else if (numberOfVehicles === '3' || numberOfVehicles === '4' || numberOfVehicles === '5' || numberOfVehicles === '6') {
        // 3 or more vehicles
        row['vehicles_category'] = 'vehicles-3-or-more';
      } else {
        // Unknown values
        row['vehicles_category'] = 'unknown';
      }
      
      // Add computed number of drivers field for filtering
      const numberOfDrivers = row['hh_license'];
      if (numberOfDrivers === '0') {
        // 0 drivers
        row['drivers_category'] = 'drivers-0';
      } else if (numberOfDrivers === '1') {
        // 1 driver
        row['drivers_category'] = 'drivers-1';
      } else if (numberOfDrivers === '2') {
        // 2 drivers
        row['drivers_category'] = 'drivers-2';
      } else if (numberOfDrivers === '3' || numberOfDrivers === '4' || numberOfDrivers === '5' || numberOfDrivers === '6' || numberOfDrivers === '7' || numberOfDrivers === '8' || numberOfDrivers === '9' || numberOfDrivers === '10') {
        // 3 or more drivers
        row['drivers_category'] = 'drivers-3-or-more';
      } else {
        // Unknown values
        row['drivers_category'] = 'unknown';
      }
      
      // Add computed division field for filtering
      const divisionValue = row['division'];
      if (divisionValue === '1') {
        // New England
        row['division_category'] = 'new-england';
      } else if (divisionValue === '2') {
        // Middle Atlantic
        row['division_category'] = 'middle-atlantic';
      } else if (divisionValue === '3') {
        // East North Central
        row['division_category'] = 'east-north-central';
      } else if (divisionValue === '4') {
        // West North Central
        row['division_category'] = 'west-north-central';
      } else if (divisionValue === '5') {
        // South Atlantic
        row['division_category'] = 'south-atlantic';
      } else if (divisionValue === '6') {
        // East South Central
        row['division_category'] = 'east-south-central';
      } else if (divisionValue === '7') {
        // West South Central
        row['division_category'] = 'west-south-central';
      } else if (divisionValue === '8') {
        // Mountain
        row['division_category'] = 'mountain';
      } else if (divisionValue === '9') {
        // Pacific
        row['division_category'] = 'pacific';
      } else {
        // Unknown values
        row['division_category'] = 'unknown';
      }
      
      // Add computed census region field for filtering
      const countyRegionValue = row['county_region'];
      if (countyRegionValue === '1') {
        // Maricopa County
        row['census_region_category'] = 'maricopa-county';
      } else if (countyRegionValue === '2') {
        // Puget Sound County
        row['census_region_category'] = 'puget-sound-county';
      } else if (countyRegionValue === '3') {
        // Northeast
        row['census_region_category'] = 'northeast';
      } else if (countyRegionValue === '4') {
        // Midwest
        row['census_region_category'] = 'midwest';
      } else if (countyRegionValue === '5') {
        // South
        row['census_region_category'] = 'south';
      } else if (countyRegionValue === '6' || countyRegionValue === '7' || countyRegionValue === '8' || countyRegionValue === '9') {
        // West* (excluding Maricopa and Puget)
        row['census_region_category'] = 'west-excluding-maricopa-puget';
      } else {
        // Unknown values (including 0)
        row['census_region_category'] = 'unknown';
      }
    });
    
    return parsedData;
  }

  // Method to clear cache if needed (for testing or data updates)
  public clearCache(): void {
    this.cachedData = null;
    this.loadingPromise = null;
  }

  // Method to force reload data (useful for testing computed fields)
  public async reloadData(): Promise<d3.DSVRowArray<string>> {
    this.clearCache();
    return this.getData();
  }

  /**
   * Get scenario analysis data (df_output.csv with all derived variables)
   * This is separate from dashboard data to ensure dashboard visualizations are not affected
   * df_output.csv contains pre-computed model variables like CR, PR, SE, hcity, urban, etc.
   */
  public async getScenarioData(): Promise<d3.DSVRowArray<string>> {
    // If data is already cached, return it immediately
    if (this.cachedScenarioData) {
      return Promise.resolve(this.cachedScenarioData);
    }

    // If a request is already in progress, return the same promise
    if (this.loadingScenarioPromise) {
      return this.loadingScenarioPromise;
    }

    // Start a new fetch request
    this.loadingScenarioPromise = this.fetchScenarioData();
    
    try {
      this.cachedScenarioData = await this.loadingScenarioPromise;
      return this.cachedScenarioData;
    } catch (error) {
      this.loadingScenarioPromise = null; // Reset on error so we can retry
      throw error;
    }
  }

  private async fetchScenarioData(): Promise<d3.DSVRowArray<string>> {
    const response = await fetch(`${process.env.PUBLIC_URL}/df_output.csv`);
    if (!response.ok) {
      throw new Error('Failed to load scenario analysis data (df_output.csv)');
    }
    
    const csvText = await response.text();
    const parsedData = d3.csvParse(csvText);
    
    // Note: df_output.csv already has all derived variables computed
    // We still add computed fields for filtering compatibility (same as dashboard data)
    parsedData.forEach((row: any) => {
      // Add computed fields for filter compatibility (same logic as dashboard data)
      // This ensures filters work the same way for both datasets
      
      // Determine the primary race category
      const selectedRaces = [
        row['race_indian_native'] === '1' ? 'indian_native' : null,
        row['race_asian'] === '1' ? 'asian' : null,
        row['race_black'] === '1' ? 'black' : null,
        row['race_native_pacific'] === '1' ? 'native_pacific' : null,
        row['race_white'] === '1' ? 'white' : null,
        row['race_other'] && String(row['race_other']).trim() !== '' && row['race_other'] !== '0' && row['race_other'] !== '-8' ? 'other' : null
      ].filter(Boolean);
      
      if (selectedRaces.length === 0) {
        row['race'] = 'none';
      } else if (selectedRaces.length === 1) {
        row['race'] = selectedRaces[0];
      } else {
        row['race'] = 'multiple';
      }
      
      // Add computed employment field for filtering
      const employmentStatus = row['employment_status'];
      if (employmentStatus === '1' || employmentStatus === '2') {
        row['employment'] = 'worker';
      } else if (employmentStatus === '3' || employmentStatus === '4') {
        row['employment'] = 'non-worker';
      } else {
        row['employment'] = 'unknown';
      }
      
      // Add computed education field for filtering
      const educationLevel = row['educ'];
      if (educationLevel === '1') {
        row['education'] = 'less-than-high-school';
      } else if (educationLevel === '2') {
        row['education'] = 'high-school';
      } else if (educationLevel === '3' || educationLevel === '4' || educationLevel === '5') {
        row['education'] = 'some-college-degree';
      } else if (educationLevel === '6') {
        row['education'] = 'bachelors-degree';
      } else if (educationLevel === '7') {
        row['education'] = 'graduate-degree';
      } else {
        row['education'] = 'unknown';
      }
      
      // Add computed license field for filtering
      const licenseStatus = row['license'];
      if (licenseStatus === '1') {
        row['license_status'] = 'yes';
      } else if (licenseStatus === '2') {
        row['license_status'] = 'no';
      } else {
        row['license_status'] = 'unknown';
      }
      
      // Add computed household size field for filtering
      const householdSize = row['hh_size'];
      if (householdSize === '1') {
        row['household_size_category'] = 'one';
      } else if (householdSize === '2') {
        row['household_size_category'] = 'two';
      } else if (householdSize === '3' || householdSize === '4' || householdSize === '5' || householdSize === '6' || householdSize === '7' || householdSize === '8' || householdSize === '9') {
        row['household_size_category'] = 'three-or-more';
      } else {
        row['household_size_category'] = 'unknown';
      }
      
      // Add computed household income field for filtering
      const householdIncome = row['hh_income'];
      if (householdIncome === '1' || householdIncome === '2') {
        row['household_income_category'] = 'less-than-25';
      } else if (householdIncome === '3' || householdIncome === '4') {
        row['household_income_category'] = '25-50';
      } else if (householdIncome === '5' || householdIncome === '6') {
        row['household_income_category'] = '50-100';
      } else if (householdIncome === '7' || householdIncome === '8') {
        row['household_income_category'] = '100-200';
      } else if (householdIncome === '9' || householdIncome === '10') {
        row['household_income_category'] = '200-or-more';
      } else {
        row['household_income_category'] = 'unknown';
      }
      
      // Add computed housing type field for filtering
      const housingType = row['hh_unit'];
      if (housingType === '1') {
        row['housing_type_category'] = 'stand-alone';
      } else if (housingType === '2' || housingType === '3') {
        row['housing_type_category'] = 'apartment';
      } else if (housingType === '4' || housingType === '5') {
        row['housing_type_category'] = 'other';
      } else {
        row['housing_type_category'] = 'unknown';
      }
      
      // Add computed home ownership field for filtering
      const homeOwnership = row['hh_tenure'];
      if (homeOwnership === '1') {
        row['home_ownership_category'] = 'rent';
      } else if (homeOwnership === '2') {
        row['home_ownership_category'] = 'own';
      } else {
        row['home_ownership_category'] = 'unknown';
      }
      
      // Add computed number of vehicles field for filtering
      const numberOfVehicles = row['hh_veh'];
      if (numberOfVehicles === '0') {
        row['vehicles_category'] = 'vehicles-0';
      } else if (numberOfVehicles === '1') {
        row['vehicles_category'] = 'vehicles-1';
      } else if (numberOfVehicles === '2') {
        row['vehicles_category'] = 'vehicles-2';
      } else if (numberOfVehicles === '3' || numberOfVehicles === '4' || numberOfVehicles === '5' || numberOfVehicles === '6') {
        row['vehicles_category'] = 'vehicles-3-or-more';
      } else {
        row['vehicles_category'] = 'unknown';
      }
      
      // Add computed number of drivers field for filtering
      const numberOfDrivers = row['hh_license'];
      if (numberOfDrivers === '0') {
        row['drivers_category'] = 'drivers-0';
      } else if (numberOfDrivers === '1') {
        row['drivers_category'] = 'drivers-1';
      } else if (numberOfDrivers === '2') {
        row['drivers_category'] = 'drivers-2';
      } else if (numberOfDrivers === '3' || numberOfDrivers === '4' || numberOfDrivers === '5' || numberOfDrivers === '6' || numberOfDrivers === '7' || numberOfDrivers === '8' || numberOfDrivers === '9' || numberOfDrivers === '10') {
        row['drivers_category'] = 'drivers-3-or-more';
      } else {
        row['drivers_category'] = 'unknown';
      }
      
      // Add computed division field for filtering
      const divisionValue = row['division'];
      if (divisionValue === '1') {
        row['division_category'] = 'new-england';
      } else if (divisionValue === '2') {
        row['division_category'] = 'middle-atlantic';
      } else if (divisionValue === '3') {
        row['division_category'] = 'east-north-central';
      } else if (divisionValue === '4') {
        row['division_category'] = 'west-north-central';
      } else if (divisionValue === '5') {
        row['division_category'] = 'south-atlantic';
      } else if (divisionValue === '6') {
        row['division_category'] = 'east-south-central';
      } else if (divisionValue === '7') {
        row['division_category'] = 'west-south-central';
      } else if (divisionValue === '8') {
        row['division_category'] = 'mountain';
      } else if (divisionValue === '9') {
        row['division_category'] = 'pacific';
      } else {
        row['division_category'] = 'unknown';
      }
      
      // Add computed census region field for filtering
      const countyRegionValue = row['county_region'];
      if (countyRegionValue === '1') {
        row['census_region_category'] = 'maricopa-county';
      } else if (countyRegionValue === '2') {
        row['census_region_category'] = 'puget-sound-county';
      } else if (countyRegionValue === '3') {
        row['census_region_category'] = 'northeast';
      } else if (countyRegionValue === '4') {
        row['census_region_category'] = 'midwest';
      } else if (countyRegionValue === '5') {
        row['census_region_category'] = 'south';
      } else if (countyRegionValue === '6' || countyRegionValue === '7' || countyRegionValue === '8' || countyRegionValue === '9') {
        row['census_region_category'] = 'west-excluding-maricopa-puget';
      } else {
        row['census_region_category'] = 'unknown';
      }
    });
    
    return parsedData;
  }

  // Method to clear scenario data cache if needed
  public clearScenarioCache(): void {
    this.cachedScenarioData = null;
    this.loadingScenarioPromise = null;
  }
}

export default DataService;