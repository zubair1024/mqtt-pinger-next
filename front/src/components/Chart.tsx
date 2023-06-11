import React, { useRef, useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface IChartProps {
  data: { _id: string; count: number }[];
}

function Chart(props: IChartProps) {
  const { data } = props;
  useLayoutEffect(() => {
    console.log(data);
    const root = am5.Root.new("chartdiv");

    root.setThemes([am5themes_Animated.new(root)]);

    const xAxisRenderer = am5xy.AxisRendererX.new(root, {});

    xAxisRenderer.labels.template.setAll({
      rotation: -45,
    });

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        layout: root.verticalLayout,
        panX: true,
        wheelY: "zoomY",
      })
    );

    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, { orientation: "horizontal" })
    );

    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "zoomX",
      })
    );
    cursor.lineY.set("visible", false);

    // Create Y-axis
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueX}",
        }),
      })
    );

    // Create X-Axis
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: xAxisRenderer,
        categoryField: "_id",
      })
    );
    xAxis.data.setAll(data);

    // Create series
    const series1 = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "count",
        categoryXField: "_id",
      })
    );
    series1.data.setAll(data);

    // Add legend
    const legend = chart.children.push(am5.Legend.new(root, {}));
    legend.data.setAll(chart.series.values);

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {}));

    return () => {
      root.dispose();
    };
  }, [data]);

  return <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>;
}
export default Chart;
