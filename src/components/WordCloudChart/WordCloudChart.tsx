import React, { useMemo } from 'react';
import WordCloud from 'react-wordcloud';
import { useWordCloudData, UseWordCloudDataOptions } from '../../hooks/useWordCloudData';
import { chartDataToCSV, downloadCSV } from '../../utils/csvUtils';
import DownloadButton from '../DownloadButton/DownloadButton';
import { useCurrentTopicLabel } from '../../hooks/useCurrentTopicLabel';
import styles from './WordCloudChart.module.scss';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

export interface WordCloudChartProps extends UseWordCloudDataOptions {
  title: React.ReactNode;
  colors?: string[];
  height?: number;
  fontSizes?: [number, number];
  rotations?: number;
  rotationAngles?: [number, number];
  deterministic?: boolean;
  enableTooltip?: boolean;
}

const WordCloudChart: React.FC<WordCloudChartProps> = ({
  title,
  dataField,
  maxWords = 50,
  minWordLength = 2,
  stopWords,
  useBigrams = true,
  colors = ['#2ba88c', '#507dbc', '#e25b61', '#93c4b9', '#ead97c'], 
  height = 400,
  fontSizes = [18, 60],
  rotations = 1,
  rotationAngles = [0, 0],
  deterministic = false,
  enableTooltip = true
}) => {
  const { words, isLoading, error } = useWordCloudData({ 
    dataField, 
    maxWords,
    minWordLength,
    stopWords,
    useBigrams
  });

  const topicLabel = useCurrentTopicLabel(typeof title === 'string' ? title : 'WordCloud');

  // Transform data for CSV export
  const transformedData = useMemo(() => {
    return words.map((word) => ({
      name: word.text,
      Count: word.value
    }));
  }, [words]);

  // Download CSV handler
  const handleDownload = () => {
    const csv = chartDataToCSV(
      transformedData,
      [{ label: 'Count' }]
    );
    const filename = `${topicLabel}.csv`;
    downloadCSV(csv, filename);
  };

  if (isLoading) {
    return (
      <div className={styles.wordCloudContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Loading word cloud...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wordCloudContainer}>
        <div className={styles.errorContainer}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className={styles.wordCloudContainer}>
        <div className={styles.titleContainer}>
          <h2>{title}</h2>
          <DownloadButton onClick={handleDownload} />
        </div>
        <div className={styles.noData}>
          <p>No data available for this visualization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wordCloudContainer}>
      <div className={styles.titleContainer}>
        <h2>{title}</h2>
        <DownloadButton onClick={handleDownload} />
      </div>
      <div style={{ width: '100%', height: `${height}px` }} className={styles.cloudWrapper}>
        <WordCloud
          words={words}
          options={{
            rotations,
            rotationAngles,
            fontSizes,
            enableTooltip,
            deterministic,
            colors,
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            padding: 3,
          }}
        />
      </div>
    </div>
  );
};

export default WordCloudChart;