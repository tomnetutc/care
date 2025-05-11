import React, { useState } from 'react';
import Button from "react-bootstrap/Button";
import Select from 'react-select';
import { useFilters } from '../../context/FilterContext';
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
  const [dropdownValues, setDropdownValues] = useState<(OptionType | null)[]>([null, null, null]);
  const { filters, addFilter, removeFilter, clearFilters } = useFilters();
  
  // Combine the options into grouped format for all dropdowns
  const groupedOptions: GroupedOption[] = [
    {
      label: "Age Group",
      options: [
        { value: '18-34', label: '18-34' },
        { value: '35-54', label: '35-54' },
        { value: '55+', label: '55+' }
      ]
    },
    {
      label: "Hispanic",
      options: [
        { value: '1', label: 'Yes' },
        { value: '2', label: 'No' }
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
    return dropdownValues.some(value => value && value.value === option.value);
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
    
    // If there was a previous selection, remove its filter
    if (newValues[index]) {
      // Determine if it was an age group or hispanic option
      const isAgeGroup = ['18-34', '35-54', '55+'].includes(newValues[index]!.value);
      removeFilter(isAgeGroup ? 'Age_group' : 'hispanic');
    }
    
    newValues[index] = selectedOption;
    setDropdownValues(newValues);
    
    // Add the new filter if an option was selected
    if (selectedOption) {
      // Set All to false when a selection is made
      setIsAllSelected(false);
      
      // Determine if it's an age group or hispanic option
      const isAgeGroup = ['18-34', '35-54', '55+'].includes(selectedOption.value);
      addFilter({ 
        field: isAgeGroup ? 'Age_group' : 'hispanic', 
        value: selectedOption.value 
      });
    } else if (!newValues.some(v => v !== null)) {
      // If all dropdowns are cleared, set All to true
      setIsAllSelected(true);
      clearFilters();
    }
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
      backgroundColor: state.isSelected ? '#007bff' : 'white',
      color: state.isSelected ? 'white' : '#333',
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
                  components={{
                    DropdownIndicator: CustomDropdownIndicator,
                  }}
                  onFocus={handleDropdownInteraction}
                  onMenuOpen={handleDropdownInteraction}
                  isDisabled={false}
                  menuPortalTarget={document.body}
                  menuPosition={'fixed'}
                  maxMenuHeight={200}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;