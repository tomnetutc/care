import React, { useEffect, useState } from 'react';
import WordCloud from 'react-wordcloud';
import * as d3 from 'd3';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import './Q16aVisualization.scss';

const Q16aVisualization: React.FC = () => {
  const [words, setWords] = useState<{ text: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.PUBLIC_URL}/leaphi_final_data.csv`);
      if (!response.ok) throw new Error('Failed to fetch data');

      const csvText = await response.text();
      const parsedData = d3.csvParse(csvText);

      const comments = parsedData
        .map(row => row.ext_heat_cope_comments?.trim())
        .filter(Boolean) as string[];

      const bigramCounts: Record<string, number> = {};

      comments.forEach(comment => {
        const cleaned = comment
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .split(/\s+/)
          .filter(w => w && !['the', 'and', 'for', 'you', 'with', 'would', 'not', 'but', 'are'].includes(w));

        for (let i = 0; i < cleaned.length - 1; i++) {
          const bigram = `${cleaned[i]} ${cleaned[i + 1]}`;
          bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
        }
      });

      const topBigrams = Object.entries(bigramCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50)
        .map(([text, value]) => ({ text, value }));

      setWords(topBigrams);
      setIsLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  loadData();
}, []);


  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        Loading word cloud...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="q16a-heat-cope-wordcloud">
      <h2>Is there anything else you would do to cope with extreme heat?</h2>
      <div style={{ width: '100%', height: '400px' }}>
        <WordCloud
          words={words}
          options={{
            rotations: 1,
            rotationAngles: [0, 0],
            fontSizes: [18, 60],
            enableTooltip: true,
            deterministic: false,
          }}
        />
      </div>
    </div>
  );
};

export default Q16aVisualization;
