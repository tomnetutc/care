import React, { useState } from 'react';
import Button from "react-bootstrap/Button";
import Select from 'react-select';
import { useFilters } from '../../context/FilterContext';
import InfoBox from '../InfoBox/InfoBox';
import './TopMenu.scss';

interface OptionType {
  value: string;
  label: string;
}

interface GroupedOption {
  label: string;
  options: OptionType[];
}

const TopMenu: React.FC = () => {
  const [isAllSelected, setIsAllSelected] = useState(true);
  const [dropdownValues, setDropdownValues] = useState<(OptionType | null)[]>([null, null, null]); // Back to 3 dropdowns
  const { addFilter, removeFilter, clearFilters } = useFilters();
  
  // Combine the options into grouped format for all dropdowns
  const groupedOptions: GroupedOption[] = [
    {
      label: "Gender",
      options: [
        { value: '1', label: 'Male' }, { value: '2', label: 'Female' },
        { value: '4', label: 'Other' }
      ]
    },
    {
      label: "Age Group",
      options: [
        { value: '1', label: '18 to 24 years' }, { value: '2', label: '25 to 34 years' },
        { value: '3', label: '35 to 44 years' }, { value: '4', label: '45 to 54 years' },
        { value: '5', label: '55 to 64 years' }, { value: '6', label: '65+ years' }
      ]
    },
    {
      label: "Race",
      options: [
        { value: 'white', label: 'White' }, { value: 'black', label: 'Black' },
        { value: 'asian', label: 'Asian' }, { value: 'multiple', label: 'Multiple races' }
      ]
    },
    {
      label: "Hispanic",
      options: [{ value: '1', label: 'Hispanic' }, { value: '2', label: 'Non-Hispanic' }]
    },
    {
      label: "Education Level",
      options: [
        { value: 'less-than-high-school', label: 'Less than high school' },
        { value: 'high-school', label: 'High school' },
        { value: 'some-college-degree', label: 'Some college Degree' },
        { value: 'bachelors-degree', label: "Bachelor's degree" },
        { value: 'graduate-degree', label: 'Graduate/post-graduate degree' }
      ]
    },
    {
      label: "Disability Status",
      options: [{ value: 'no', label: 'No (Disability)' }, { value: 'yes', label: 'Yes (Disability)' }]
    },
    {
      label: "Employment",
      options: [
        { value: 'worker', label: 'Worker' }, { value: 'non-worker', label: 'Non-Worker' }
      ]
    },
    {
      label: "Driver's License",
      options: [
        { value: 'yes', label: 'Yes (License)' }, { value: 'no', label: 'No (License)' }
      ]
    },
    {
      label: "Household Size",
      options: [
        { value: 'one', label: '1' },
        { value: 'two', label: '2' },
        { value: 'three-or-more', label: '3 or more' }
      ]
    },
    {
      label: "Household Income",
      options: [
        { value: 'less-than-25', label: '<$25K' },
        { value: '25-50', label: '$25K-$50K' },
        { value: '50-100', label: '$50K-$100K' },
        { value: '100-200', label: '$100K-$200K' },
        { value: '200-or-more', label: '$200K+' }
      ]
    },
    {
      label: "Housing Type",
      options: [
        { value: 'stand-alone', label: 'Stand-alone' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      label: "Home Ownership",
      options: [
        { value: 'rent', label: 'Rent' },
        { value: 'own', label: 'Own' }
      ]
    },
    {
      label: "Number of Vehicles",
      options: [
        { value: 'vehicles-0', label: '0 (Vehicle)' },
        { value: 'vehicles-1', label: '1 (Vehicle)' },
        { value: 'vehicles-2', label: '2 (Vehicles)' },
        { value: 'vehicles-3-or-more', label: '3 or more (Vehicles)' }
      ]
    },
    {
      label: "Number of Drivers",
      options: [
        { value: 'drivers-0', label: '0 (Driver)' },
        { value: 'drivers-1', label: '1 (Driver)' },
        { value: 'drivers-2', label: '2 (Drivers)' },
        { value: 'drivers-3-or-more', label: '3 or more (Drivers)' }
      ]
    },
    {
      label: "Census Division",
      options: [
        { value: 'new-england', label: 'New England' },
        { value: 'middle-atlantic', label: 'Middle Atlantic' },
        { value: 'east-north-central', label: 'East North Central' },
        { value: 'west-north-central', label: 'West North Central' },
        { value: 'south-atlantic', label: 'South Atlantic' },
        { value: 'east-south-central', label: 'East South Central' },
        { value: 'west-south-central', label: 'West South Central' },
        { value: 'mountain', label: 'Mountain' },
        { value: 'pacific', label: 'Pacific' }
      ]
    },
    {
      label: "Census Region/County",
      options: [
        { value: 'maricopa-county', label: 'Maricopa County' },
        { value: 'puget-sound-county', label: 'Puget Sound County' },
        { value: 'northeast', label: 'Northeast' },
        { value: 'midwest', label: 'Midwest' },
        { value: 'south', label: 'South' },
        { value: 'west-excluding-maricopa-puget', label: 'West' }
      ]
    }
  ];

  // Check if any dropdown has a selection
  const hasSelection = dropdownValues.some(value => value !== null);

  // Handle all checkbox change
  const handleAllSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAllSelected(event.target.checked);
    if (event.target.checked) {
      setDropdownValues([null, null, null]);
      clearFilters();
    }
  };

  // Check if an option is already selected in any dropdown
  const isOptionSelected = (option: OptionType): boolean => {
    return dropdownValues.some(value => 
      value && 
      value.value === option.value && 
      value.label === option.label
    );
  };

  // Handle dropdown focus/click - automatically deselect "All"
  const handleDropdownInteraction = () => {
    if (isAllSelected) {
      setIsAllSelected(false);
    }
  };

  // Handle dropdown change
  const handleDropdownChange = (index: number, selectedOption: OptionType | null) => {
    const newValues = [...dropdownValues];
    
    // If there was a previous selection, remove its specific filter
    if (newValues[index]) {
      // Determine field based on the selected option
      const field = getFieldForOption(newValues[index]!);
      removeFilter(field, newValues[index]!.value);
    }
    
    newValues[index] = selectedOption;
    setDropdownValues(newValues);
    
    // Add the new filter if an option was selected
    if (selectedOption) {
      // Set All to false when a selection is made
      setIsAllSelected(false);
      
      // Determine field based on the selected option
      const field = getFieldForOption(selectedOption);
      addFilter({ 
        field: field, 
        value: selectedOption.value 
      });
    } else if (!newValues.some(v => v !== null)) {
      // If all dropdowns are cleared, set All to true
      setIsAllSelected(true);
      clearFilters();
    }
  };

  // Helper function to determine the correct field based on the selected option
  const getFieldForOption = (selectedOption: OptionType): string => {
    // Find which group this option belongs to
    for (const group of groupedOptions) {
      const foundOption = group.options.find(option => 
        option.value === selectedOption.value && option.label === selectedOption.label
      );
      
      if (foundOption) {
        // Return the field based on the group label
        switch (group.label) {
          case "Age Group":
            return 'age_category';
          case "Hispanic":
            return 'hispanic';
          case "Disability Status":
            return 'travel_disability';
          case "Gender":
            return 'gender';
          case "Race":
            return 'race';
          case "Employment":
            return 'employment';
          case "Education Level":
            return 'education';
          case "Driver's License":
            return 'license_status';
          case "Household Size":
            return 'household_size_category';
          case "Household Income":
            return 'household_income_category';
          case "Housing Type":
            return 'housing_type_category';
          case "Home Ownership":
            return 'home_ownership_category';
          case "Number of Vehicles":
            return 'vehicles_category';
          case "Number of Drivers":
            return 'drivers_category';
          case "Census Division":
            return 'division_category';
          case "Census Region/County":
            return 'census_region_category';
          default:
            return 'age_category'; // fallback
        }
      }
    }
    
    // Fallback: try to determine by value patterns
    const isAgeValue = ['1', '2', '3', '4', '5', '6'].includes(selectedOption.value);
    const isHispanicValue = ['1', '2'].includes(selectedOption.value);
    const isDisabilityValue = ['yes', 'no'].includes(selectedOption.value);
    const isGenderValue = ['1', '2', '3', '4'].includes(selectedOption.value);
    const isRaceValue = ['white', 'black', 'asian', 'multiple'].includes(selectedOption.value);
    const isEmploymentValue = ['worker', 'non-worker'].includes(selectedOption.value);
    const isEducationValue = ['less-than-high-school', 'high-school', 'some-college-degree', 'bachelors-degree', 'graduate-degree'].includes(selectedOption.value);
    const isLicenseValue = ['yes', 'no'].includes(selectedOption.value);
    const isHouseholdSizeValue = ['one', 'two', 'three-or-more'].includes(selectedOption.value);
    const isHouseholdIncomeValue = ['less-than-25', '25-50', '50-100', '100-200', '200-or-more'].includes(selectedOption.value);
    const isHousingTypeValue = ['stand-alone', 'apartment', 'other'].includes(selectedOption.value);
    const isHomeOwnershipValue = ['rent', 'own'].includes(selectedOption.value);
    const isNumberOfVehiclesValue = ['vehicles-0', 'vehicles-1', 'vehicles-2', 'vehicles-3-or-more'].includes(selectedOption.value);
    const isNumberOfDriversValue = ['drivers-0', 'drivers-1', 'drivers-2', 'drivers-3-or-more'].includes(selectedOption.value);
    const isDivisionValue = ['new-england', 'middle-atlantic', 'east-north-central', 'west-north-central', 'south-atlantic', 'east-south-central', 'west-south-central', 'mountain', 'pacific'].includes(selectedOption.value);
    const isCensusRegionValue = ['maricopa-county', 'puget-sound-county', 'northeast', 'midwest', 'south', 'west-excluding-maricopa-puget'].includes(selectedOption.value);
    
    if (isDisabilityValue) return 'travel_disability';
    if (isGenderValue) return 'gender';
    if (isHispanicValue) return 'hispanic';
    if (isAgeValue) return 'age_category';
    if (isRaceValue) return 'race';
    if (isEmploymentValue) return 'employment';
    if (isEducationValue) return 'education';
    if (isLicenseValue) return 'license_status';
    if (isHouseholdSizeValue) return 'household_size_category';
    if (isHouseholdIncomeValue) return 'household_income_category';
    if (isHousingTypeValue) return 'housing_type_category';
    if (isHomeOwnershipValue) return 'home_ownership_category';
    if (isNumberOfVehiclesValue) return 'vehicles_category';
    if (isNumberOfDriversValue) return 'drivers_category';
    if (isDivisionValue) return 'division_category';
    if (isCensusRegionValue) return 'census_region_category';
    
    return 'age_category'; // final fallback
  };

  // Reset all selections
  const handleReset = () => {
    setDropdownValues([null, null, null]);
    setIsAllSelected(true);
    clearFilters();
  };

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      border: '1px solid #ced4da',
      borderRadius: '0.25rem',
      minHeight: '36px',
      fontSize: '13.5px',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6c757d'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: '13.5px',
      backgroundColor: state.isSelected ? '#007bff' : state.isDisabled ? '#f8f9fa' : 'white',
      color: state.isSelected ? 'white' : state.isDisabled ? '#6c757d' : '#333',
      opacity: state.isDisabled ? 0.6 : 1,
      cursor: state.isDisabled ? 'not-allowed' : 'default',
    }),
    group: (provided: any) => ({
      ...provided,
      padding: 0,
    }),
    groupHeading: (provided: any) => ({
      ...provided,
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#6c757d',
      marginBottom: '4px',
      paddingLeft: '8px',
      paddingRight: '8px',
      paddingTop: '6px',
      paddingBottom: '6px',
      backgroundColor: '#f8f9fa',
    })
  };

  const CustomDropdownIndicator: React.FC = () => (
    <div className="dropdown-indicator">
      <svg width="15" height="15" fill="currentColor" className="bi bi-chevron-down" viewBox="-2 -2 21 21">
        <path
          fillRule="evenodd"
          d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
        />
      </svg>
    </div>
  );

  // Format options with disabled state for already selected options
  const getFormattedOptions = (dropdownIndex: number) => {
    return groupedOptions.map(group => ({
      label: group.label,
      options: group.options.map(option => ({
        ...option,
        isDisabled: isOptionSelected(option) && dropdownValues[dropdownIndex]?.value !== option.value
      }))
    }));
  };

  return (
    <div className="menu-container">
      <div className="menu-header">
        <div className="options-container">
          <label className="segment-label">Select Segment:</label>
          <div className="all-select-checkbox">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleAllSelectChange}
              disabled={hasSelection}
            />
            <span className="all-select-label">All</span>
          </div>
          
          <div className="dropdowns-menu-container">
            {[0, 1, 2].map(index => (
              <div key={index} className="dropdown-wrapper" onClick={handleDropdownInteraction}>
                <Select
                  className="dropdown-select"
                  classNamePrefix="dropdown-select"
                  value={dropdownValues[index]}
                  onChange={(option) => handleDropdownChange(index, option)}
                  options={getFormattedOptions(index)}
                  placeholder="Select attribute"
                  styles={customStyles}
                  isClearable
                  isSearchable
                  components={{
                    DropdownIndicator: CustomDropdownIndicator,
                  }}
                  onFocus={handleDropdownInteraction}
                  onMenuOpen={handleDropdownInteraction}
                  isDisabled={false}
                  menuPortalTarget={document.body}
                  menuPosition={'fixed'}
                  maxMenuHeight={200}
                  filterOption={(option, inputValue) => {
                    if (!inputValue) return true;
                    const searchValue = inputValue.toLowerCase();
                    
                    // Check if search matches the option label (like "male", "female")
                    const optionLabel = option.label?.toLowerCase() || '';
                    if (optionLabel.includes(searchValue)) {
                      return true;
                    }
                    
                    // Check if search matches any group label by searching through groupedOptions
                    for (const group of groupedOptions) {
                      if (group.label.toLowerCase().includes(searchValue)) {
                        // Check if this option belongs to this group
                        const belongsToGroup = group.options.some(groupOption => 
                          groupOption.value === option.value && groupOption.label === option.label
                        );
                        if (belongsToGroup) {
                          return true;
                        }
                      }
                    }
                    
                    return false;
                  }}
                />
              </div>
            ))}
            <div className="button-container">
              <Button 
                variant="danger"
                size="sm"
                onClick={handleReset}
                className="reset-button"
                disabled={isAllSelected && !hasSelection}
              >
                Reset
              </Button>
              <InfoBox style={{ display: 'inline-flex' }}>
                Select up to three attributes to define a population segment and view the corresponding results. By default, the view displays data for 'all' respondents aged 18 or older.
              </InfoBox>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;