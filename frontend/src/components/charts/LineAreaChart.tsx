import React from "react";
import ReactApexChart from "react-apexcharts";

type ChartProps = {
  chartData: any[];
  chartOptions: any;
  [x: string]: any;
};

const LineAreaChart: React.FC<ChartProps> = (props) => {
  const { chartData, chartOptions, ...rest } = props;
  if (!chartData || !chartOptions || !Array.isArray(chartData)) {
    return null;
  }
  return (
    <ReactApexChart
      options={chartOptions}
      series={chartData}
      type="area"
      width="100%"
      height="100%"
      {...rest}
    />
  );
};

export default LineAreaChart;
