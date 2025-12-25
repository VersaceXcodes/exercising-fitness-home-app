import React from 'react';
import { Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ProgressionDataPoint {
  date: string;
  max_weight: number | string;
}

interface ProgressionChartProps {
  data: ProgressionDataPoint[];
  loading?: boolean;
}

export function ProgressionChart({ data, loading }: ProgressionChartProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  if (loading) {
    return (
      <ThemedView style={{ padding: 20, alignItems: 'center', justifyContent: 'center', height: 220 }}>
        <ActivityIndicator size="small" color={tintColor} />
      </ThemedView>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ThemedView style={{ padding: 20, alignItems: 'center', justifyContent: 'center', height: 220 }}>
        <ThemedText style={{ opacity: 0.6 }}>No progression data available.</ThemedText>
      </ThemedView>
    );
  }

  // Sort by date just in case
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Slice to last 6 entries to keep chart readable
  const chartDataPoints = sortedData.slice(-6);
  
  const labels = chartDataPoints.map(d => {
    const date = new Date(d.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  
  const values = chartDataPoints.map(d => Number(d.max_weight));

  // Ensure we have at least one point to avoid chart errors if any
  if (values.length === 0) return null;

  return (
    <ThemedView style={{ alignItems: 'center', marginVertical: 10, width: '100%' }}>
      <ThemedText type="subtitle" style={{ marginBottom: 10, alignSelf: 'flex-start', marginLeft: 16 }}>
        Strength Progression
      </ThemedText>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: values
            }
          ]
        }}
        width={Dimensions.get('window').width - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix="kg"
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: backgroundColor,
          backgroundGradientFrom: backgroundColor,
          backgroundGradientTo: backgroundColor,
          decimalPlaces: 1,
          color: (opacity = 1) => tintColor, // Use tint color (blue/white)
          labelColor: (opacity = 1) => textColor,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: tintColor
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
        withInnerLines={true}
        withOuterLines={false}
      />
    </ThemedView>
  );
}
