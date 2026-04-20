import React, { useState, useEffect } from 'react';
import DataService from '../../services/DataService';
import { useFilters } from '../../context/FilterContext';

const SummaryStatsPanel: React.FC = () => {
  const { filters, isDataLoading } = useFilters();
  const [totalN, setTotalN] = useState<number | null>(null);
  const [filteredN, setFilteredN] = useState<number | null>(null);

  useEffect(() => {
    if (isDataLoading) return;
    DataService.getInstance().getData().then(data => {
      setTotalN(data.length);
      if (filters.length === 0) {
        setFilteredN(data.length);
        return;
      }
      const filtered = data.filter(row => {
        const filtersByField: Record<string, string[]> = {};
        filters.forEach(f => {
          if (!filtersByField[f.field]) filtersByField[f.field] = [];
          if (f.field === 'travel_disability') {
            if (f.value === 'yes') filtersByField[f.field].push('2', '3', '4');
            else if (f.value === 'no') filtersByField[f.field].push('1');
            else filtersByField[f.field].push(String(f.value));
          } else if (f.field === 'gender' && f.value === '4') {
            filtersByField[f.field].push('3', '4');
          } else {
            filtersByField[f.field].push(String(f.value));
          }
        });
        return Object.entries(filtersByField).every(([field, values]) =>
          values.includes(String(row[field]))
        );
      });
      setFilteredN(filtered.length);
    });
  }, [filters, isDataLoading]);

  const isFiltered = filters.length > 0;

  return (
    <div style={{
      marginBottom: 16,
      padding: '10px 16px',
      background: 'white',
      borderRadius: 6,
      border: '1px solid #ddd',
      display: 'inline-block',
    }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ background: '#2c3e50', color: 'white', padding: '6px 14px', textAlign: 'left', borderRadius: '4px 0 0 0' }}>
              Statistic
            </th>
            <th style={{ background: '#2c3e50', color: 'white', padding: '6px 14px', textAlign: 'center', borderRadius: '0 4px 0 0' }}>
              N
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '5px 14px', borderBottom: '1px solid #eee', color: '#333' }}>
              Total Respondents
            </td>
            <td style={{ padding: '5px 14px', borderBottom: '1px solid #eee', textAlign: 'center', fontWeight: 600, color: '#2c3e50' }}>
              {totalN !== null ? totalN.toLocaleString() : '…'}
            </td>
          </tr>
          {isFiltered && (
            <tr>
              <td style={{ padding: '5px 14px', background: '#f9f9f9', color: '#333' }}>
                Filtered Respondents
              </td>
              <td style={{ padding: '5px 14px', background: '#f9f9f9', textAlign: 'center', fontWeight: 600, color: '#2c3e50' }}>
                {filteredN !== null ? filteredN.toLocaleString() : '…'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryStatsPanel;
