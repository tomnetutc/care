import React, { useState, useEffect, useRef } from 'react';
import { useFilters } from '../../context/FilterContext';
import DataService from '../../services/DataService';
import InfoBox from '../InfoBox/InfoBox';
import './TopMenu.scss';

// ─── Dimension definitions ────────────────────────────────────────────────────
// These mirror the field/value mapping in the original getFieldForOption() and
// in the filter predicate used by every hook (usePieChartData, useLikertData, …).
// Do NOT change field names or option values — chart hooks depend on them.

interface DimOption {
  value: string;
  label: string;
}

interface Dimension {
  label: string;
  field: string;
  options: DimOption[];
}

const DIMENSIONS: Dimension[] = [
  {
    label: 'Gender',
    field: 'gender',
    options: [
      { value: '1', label: 'Male' },
      { value: '2', label: 'Female' },
      // value '4' maps to Other + Prefer not to answer in the predicate
      { value: '4', label: 'Other' },
    ],
  },
  {
    label: 'Age Group',
    field: 'age_category',
    options: [
      { value: '1', label: '18 to 24 years' },
      { value: '2', label: '25 to 34 years' },
      { value: '3', label: '35 to 44 years' },
      { value: '4', label: '45 to 54 years' },
      { value: '5', label: '55 to 64 years' },
      { value: '6', label: '65+ years' },
    ],
  },
  {
    label: 'Race',
    field: 'race',
    options: [
      { value: 'white', label: 'White' },
      { value: 'black', label: 'Black' },
      { value: 'asian', label: 'Asian' },
      { value: 'multiple', label: 'Multiple races' },
    ],
  },
  {
    label: 'Hispanic',
    field: 'hispanic',
    options: [
      { value: '1', label: 'Hispanic' },
      { value: '2', label: 'Non-Hispanic' },
    ],
  },
  {
    label: 'Education Level',
    field: 'education',
    options: [
      { value: 'less-than-high-school', label: 'Less than high school' },
      { value: 'high-school', label: 'High school' },
      { value: 'some-college-degree', label: 'Some college degree' },
      { value: 'bachelors-degree', label: "Bachelor's degree" },
      { value: 'graduate-degree', label: 'Graduate/post-graduate' },
    ],
  },
  {
    label: 'Disability Status',
    field: 'travel_disability',
    // Predicate maps 'yes' → raw values 2/3/4, 'no' → raw value 1
    options: [
      { value: 'no', label: 'No disability' },
      { value: 'yes', label: 'Has disability' },
    ],
  },
  {
    label: 'Employment',
    field: 'employment',
    options: [
      { value: 'worker', label: 'Worker' },
      { value: 'non-worker', label: 'Non-Worker' },
    ],
  },
  {
    label: "Driver's License",
    field: 'license_status',
    options: [
      { value: 'yes', label: 'Has license' },
      { value: 'no', label: 'No license' },
    ],
  },
  {
    label: 'Household Size',
    field: 'household_size_category',
    options: [
      { value: 'one', label: '1 person' },
      { value: 'two', label: '2 people' },
      { value: 'three-or-more', label: '3 or more' },
    ],
  },
  {
    label: 'Household Income',
    field: 'household_income_category',
    options: [
      { value: 'less-than-25', label: '<$25K' },
      { value: '25-50', label: '$25K–$50K' },
      { value: '50-100', label: '$50K–$100K' },
      { value: '100-200', label: '$100K–$200K' },
      { value: '200-or-more', label: '$200K+' },
    ],
  },
  {
    label: 'Housing Type',
    field: 'housing_type_category',
    options: [
      { value: 'stand-alone', label: 'Stand-alone' },
      { value: 'apartment', label: 'Apartment' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    label: 'Home Ownership',
    field: 'home_ownership_category',
    options: [
      { value: 'rent', label: 'Rent' },
      { value: 'own', label: 'Own' },
    ],
  },
  {
    label: 'Vehicles',
    field: 'vehicles_category',
    options: [
      { value: 'vehicles-0', label: '0 vehicles' },
      { value: 'vehicles-1', label: '1 vehicle' },
      { value: 'vehicles-2', label: '2 vehicles' },
      { value: 'vehicles-3-or-more', label: '3+ vehicles' },
    ],
  },
  {
    label: 'Drivers',
    field: 'drivers_category',
    options: [
      { value: 'drivers-0', label: '0 drivers' },
      { value: 'drivers-1', label: '1 driver' },
      { value: 'drivers-2', label: '2 drivers' },
      { value: 'drivers-3-or-more', label: '3+ drivers' },
    ],
  },
  {
    label: 'Census Division',
    field: 'division_category',
    options: [
      { value: 'new-england', label: 'New England' },
      { value: 'middle-atlantic', label: 'Middle Atlantic' },
      { value: 'east-north-central', label: 'East North Central' },
      { value: 'west-north-central', label: 'West North Central' },
      { value: 'south-atlantic', label: 'South Atlantic' },
      { value: 'east-south-central', label: 'East South Central' },
      { value: 'west-south-central', label: 'West South Central' },
      { value: 'mountain', label: 'Mountain' },
      { value: 'pacific', label: 'Pacific' },
    ],
  },
  {
    label: 'Census Region/County',
    field: 'census_region_category',
    options: [
      { value: 'maricopa-county', label: 'Maricopa County' },
      { value: 'puget-sound-county', label: 'Puget Sound County' },
      { value: 'northeast', label: 'Northeast' },
      { value: 'midwest', label: 'Midwest' },
      { value: 'south', label: 'South' },
      { value: 'west-excluding-maricopa-puget', label: 'West' },
    ],
  },
];

// Replicate the filter predicate logic from usePieChartData/useLikertData to
// compute the live respondent count without touching chart hooks.
function applyFiltersToData(
  data: any[],
  filters: { field: string; value: string | number }[]
): any[] {
  if (filters.length === 0) return data;
  return data.filter(row => {
    const byField: Record<string, string[]> = {};
    filters.forEach(f => {
      if (!byField[f.field]) byField[f.field] = [];
      if (f.field === 'travel_disability') {
        if (f.value === 'yes') byField[f.field].push('2', '3', '4');
        else if (f.value === 'no') byField[f.field].push('1');
        else byField[f.field].push(String(f.value));
      } else if (f.field === 'gender' && f.value === '4') {
        // 'Other' includes both code 4 and code 3 (Prefer not to answer)
        byField[f.field].push('3', '4');
      } else {
        byField[f.field].push(String(f.value));
      }
    });
    return Object.entries(byField).every(([field, values]) =>
      values.includes(String(row[field]))
    );
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

const TopMenu: React.FC = () => {
  const { filters, addFilter, removeFilter, clearFilters, isDataLoading } = useFilters();

  // dimSelections: field → selected values.
  // A field that is ABSENT from this map means "all options selected" (default / no filter active).
  // A field present with a full array also means all selected, but we normalise that to absent.
  // A field present with an empty array means 0 selected (invalid / warning state).
  const [dimSelections, setDimSelections] = useState<Record<string, string[]>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Respondent counts shown in modal footer
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [filteredCount, setFilteredCount] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);

  // ── Derived values ─────────────────────────────────────────────────────────

  const isAllDefault = Object.keys(dimSelections).length === 0;
  const activeDimCount = Object.keys(dimSelections).length;

  const getSelectedValues = (dim: Dimension): string[] =>
    dimSelections[dim.field] ?? dim.options.map(o => o.value);

  const isDimDefault = (dim: Dimension): boolean =>
    dimSelections[dim.field] === undefined;

  const isChecked = (dim: Dimension, value: string): boolean => {
    const sel = dimSelections[dim.field];
    if (sel === undefined) return true; // all selected by default
    return sel.includes(value);
  };

  // ── Filter sync ────────────────────────────────────────────────────────────
  // Called from event handlers (React 18 batches all setState calls within an
  // event handler, so removeFilter + N×addFilter correctly produce [f1, f2, …]).

  const syncDimToFilter = (
    field: string,
    newSelected: string[],
    totalOpts: number
  ) => {
    removeFilter(field); // clear any existing filters for this field
    if (newSelected.length === totalOpts) return; // all selected = no filter needed
    if (newSelected.length === 0) {
      // 0 selected: add a sentinel value that can never match a real data row.
      // The predicate does values.includes(String(row[field])), and no row
      // will ever have field value '__no_match__', so the result is 0 respondents.
      addFilter({ field, value: '__no_match__' });
      return;
    }
    newSelected.forEach(val => addFilter({ field, value: val }));
  };

  // ── Event handlers ─────────────────────────────────────────────────────────

  const handleCheckboxChange = (dim: Dimension, value: string, checked: boolean) => {
    const current = getSelectedValues(dim);
    const newSelected = checked
      ? [...current, value]
      : current.filter(v => v !== value);

    if (newSelected.length === dim.options.length) {
      // Back to all-selected → remove the field from dimSelections (normalise)
      setDimSelections(prev => {
        const { [dim.field]: _removed, ...rest } = prev;
        return rest;
      });
    } else {
      setDimSelections(prev => ({ ...prev, [dim.field]: newSelected }));
    }
    syncDimToFilter(dim.field, newSelected, dim.options.length);
  };

  // "All" link inside a dimension column: restore all options
  const handleDimAll = (dim: Dimension) => {
    setDimSelections(prev => {
      const { [dim.field]: _removed, ...rest } = prev;
      return rest;
    });
    removeFilter(dim.field);
  };

  // "None" link inside a dimension column: deselect all options
  // The sentinel filter ensures 0 respondents match (not "all respondents")
  const handleDimNone = (dim: Dimension) => {
    setDimSelections(prev => ({ ...prev, [dim.field]: [] }));
    removeFilter(dim.field);
    addFilter({ field: dim.field, value: '__no_match__' });
  };

  // Reset all dimensions to default
  const handleResetAll = () => {
    setDimSelections({});
    clearFilters();
  };

  // × button on a chip resets ONLY that dimension
  const handleChipRemove = (dim: Dimension) => {
    setDimSelections(prev => {
      const { [dim.field]: _removed, ...rest } = prev;
      return rest;
    });
    removeFilter(dim.field);
  };

  // "All" checkbox in top bar: read-only when checked (all default),
  // clicking when not default = reset all
  const handleAllCheckboxChange = () => {
    if (!isAllDefault) handleResetAll();
    // when already all-default, do nothing (keep checkbox checked)
  };

  // ── Modal ──────────────────────────────────────────────────────────────────

  const openModal = () => {
    setIsModalOpen(true);
    setSearchQuery('');
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchQuery('');
  };

  // Escape key closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) closeModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isModalOpen]);

  // Measure the menu bar height and expose it as a CSS custom property so
  // MainContent.scss can use var(--top-menu-height) for its padding-top.
  // This keeps the visualization area correctly offset even when chips wrap.
  useEffect(() => {
    if (!menuRef.current) return;
    const update = () => {
      const h = menuRef.current?.offsetHeight ?? 65;
      document.documentElement.style.setProperty('--top-menu-height', `${h + 15}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(menuRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute respondent counts whenever filters change (mirrors SummaryStatsPanel logic)
  useEffect(() => {
    if (isDataLoading) return;
    DataService.getInstance().getData().then(data => {
      setTotalCount(data.length);
      const matched = applyFiltersToData(data as any[], filters as any[]);
      setFilteredCount(matched.length);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isDataLoading]); // 'filters' is an array ref; this is intentional

  // ── Search ─────────────────────────────────────────────────────────────────
  // If query matches the dimension label → show all its options.
  // If query matches only specific options → show only that dimension with those options.
  // "All" / "None" buttons always operate on the FULL option list regardless of search.

  const getFilteredDimensions = (): Dimension[] => {
    if (!searchQuery.trim()) return DIMENSIONS;
    const q = searchQuery.toLowerCase();
    return DIMENSIONS.flatMap(dim => {
      if (dim.label.toLowerCase().includes(q)) return [dim]; // show all options
      const matched = dim.options.filter(o => o.label.toLowerCase().includes(q));
      if (matched.length > 0) return [{ ...dim, options: matched }];
      return [];
    });
  };

  // ── Chip helpers ───────────────────────────────────────────────────────────

  const activeChips = DIMENSIONS.filter(d => dimSelections[d.field] !== undefined);

  const getChipLabel = (dim: Dimension): string => {
    const sel = dimSelections[dim.field];
    if (!sel || sel.length === 0) return `${dim.label}: none selected`;
    return `${dim.label}: ${sel.length} of ${dim.options.length} selected`;
  };

  const isChipWarning = (dim: Dimension): boolean => {
    const sel = dimSelections[dim.field];
    return sel !== undefined && sel.length === 0;
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const filteredDimensions = getFilteredDimensions();

  const respondentLabel = (() => {
    if (filteredCount === null) return 'Loading…';
    if (isAllDefault) return `Showing ${filteredCount.toLocaleString()} respondents`;
    return `Filtered: ${filteredCount.toLocaleString()} of ${totalCount?.toLocaleString() ?? '…'} respondents`;
  })();

  // ── JSX ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Top bar ── */}
      <div className="menu-container" ref={menuRef}>
        <div className="filter-bar">
          <label className="segment-label">Select Segment:</label>

          <div className="all-select-checkbox">
            <input
              type="checkbox"
              checked={isAllDefault}
              onChange={handleAllCheckboxChange}
              aria-label="All respondents (no segment filter)"
            />
            <span className="all-select-label">All</span>
          </div>

          {/* Trigger button */}
          <button
            className="filter-trigger-btn"
            onClick={openModal}
            aria-haspopup="dialog"
            aria-expanded={isModalOpen}
            title="Open filter palette"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
            <span>Filter segments…</span>
            {activeDimCount > 0 && (
              <span className="active-badge" aria-label={`${activeDimCount} filter dimensions active`}>
                {activeDimCount}
              </span>
            )}
            <span className="cmd-hint" aria-hidden="true">⌘K</span>
          </button>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="chip-strip" aria-label="Active filters">
              {activeChips.map(dim => (
                <span
                  key={dim.field}
                  className={`filter-chip${isChipWarning(dim) ? ' filter-chip--warning' : ''}`}
                  role="status"
                  aria-label={getChipLabel(dim)}
                >
                  <span className="chip-label">{getChipLabel(dim)}</span>
                  <button
                    className="chip-remove"
                    onClick={() => handleChipRemove(dim)}
                    aria-label={`Reset ${dim.label} to all selected`}
                    title={`Reset ${dim.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Reset + Info */}
          <div className="button-container">
            <button
              className="reset-button"
              onClick={handleResetAll}
              disabled={isAllDefault}
            >
              Reset
            </button>
            <InfoBox style={{ display: 'inline-flex' }}>
              Select attributes to define a population segment. By default, the view
              displays data for all respondents aged 18 or older.
            </InfoBox>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div
          className="filter-modal-backdrop"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Filter segments"
        >
          <div className="filter-modal-card" ref={modalCardRef}>

            {/* Search bar row */}
            <div className="modal-search-row">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="modal-search-icon">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                className="modal-search-input"
                placeholder="Search dimensions or options…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search filter dimensions and options"
              />
              <button
                className="modal-esc-btn"
                onClick={closeModal}
                aria-label="Close filter modal"
              >
                ESC
              </button>
            </div>

            {/* Filter grid (scrollable) */}
            <div className="modal-grid-scroll">
              {filteredDimensions.length === 0 ? (
                <p className="modal-empty-state">
                  No dimensions or options match &ldquo;{searchQuery}&rdquo;
                </p>
              ) : (
                <div className="modal-grid">
                  {filteredDimensions.map(dim => {
                    // fullDim always has ALL options so All/None operate on the
                    // complete list even when search has narrowed the visible set.
                    const fullDim = DIMENSIONS.find(d => d.field === dim.field)!;
                    const isPartial = !isDimDefault(fullDim);
                    return (
                      <div
                        key={dim.field}
                        className={`dim-column${isPartial ? ' dim-column--active' : ''}`}
                      >
                        <div className="dim-header">
                          <span className="dim-label">{dim.label}</span>
                          <div className="dim-actions">
                            <button
                              className="dim-action-link"
                              onClick={() => handleDimAll(fullDim)}
                              title={`Select all ${dim.label}`}
                            >
                              All
                            </button>
                            <button
                              className="dim-action-link"
                              onClick={() => handleDimNone(fullDim)}
                              title={`Deselect all ${dim.label}`}
                            >
                              None
                            </button>
                          </div>
                        </div>

                        <div className="dim-options">
                          {dim.options.map(opt => (
                            <label key={opt.value} className="dim-option">
                              <input
                                type="checkbox"
                                checked={isChecked(fullDim, opt.value)}
                                onChange={e =>
                                  handleCheckboxChange(fullDim, opt.value, e.target.checked)
                                }
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sticky footer */}
            <div className="modal-footer">
              <span className="modal-respondent-count">{respondentLabel}</span>
              <div className="modal-footer-actions">
                <button className="modal-reset-btn" onClick={handleResetAll}>
                  Reset all
                </button>
                <button className="modal-done-btn" onClick={closeModal}>
                  Done ✓
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default TopMenu;
