import React from "react";
import Chart from "react-apexcharts";

type ChartProps = {
  chartData: any[];
  chartOptions: any;
  [x: string]: any;
};

const ColumnChart: React.FC<ChartProps> = (props) => {
  const { chartData, chartOptions, ...rest } = props;
  if (!chartData || !chartOptions || !Array.isArray(chartData)) {
    return null;
  }
  return (
    <Chart
      options={chartOptions}
      series={chartData}
      type="bar"
      width="100%"
      height="100%"
      {...rest}
    />
  );
};

export default ColumnChart;
