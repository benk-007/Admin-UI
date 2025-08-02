import { Component } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { cilBookmark, cilChevronBottom, cilChevronTop, cilHome, cilTransfer } from '@coreui/icons';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  RowComponent,
  ColComponent,
  WidgetStatFComponent,
  TemplateIdDirective,
  CardComponent, CardBodyComponent, CardHeaderComponent
} from '@coreui/angular';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  ApexPlotOptions,
  ApexYAxis,
  ApexFill,
  ApexLegend,
  ApexMarkers
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  legend: ApexLegend;
  colors: string[];
  markers: ApexMarkers;
};

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [
    RowComponent,
    ColComponent,
    IconDirective,
    ReactiveFormsModule,
    WidgetStatFComponent,
    TemplateIdDirective,
    NgApexchartsModule,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent
  ]
})
export class DashboardComponent {
  icons = { cilTransfer, cilChevronBottom, cilChevronTop, cilHome, cilBookmark };

  public chartOptions: Partial<ChartOptions>;

  // Property revenue data
  public monthlyIncome = [52000, 58000, 53500, 40000, 46000, 42500];
  public totalIncome = this.monthlyIncome.reduce((sum, income) => sum + income, 0);
  public averageIncome = Math.round(this.totalIncome / this.monthlyIncome.length);
  public highestMonth = Math.max(...this.monthlyIncome);

  public donutChart1Options: any;
  public donutChart2Options: any;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "Monthly Income (Bars)",
          type: "column",
          data: this.monthlyIncome
        },
        {
          name: "Income Trend (Line)",
          type: "line",
          data: this.monthlyIncome
        }
      ],
      chart: {
        height: 300,
        type: "line",
        stacked: false,
        toolbar: {
          show: true
        }
      },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: [0, 4],
        strokeWidth: [0, 0],
        colors: ['#2E93fA', '#013557'],
        strokeColors: ['#ffffff'],
        hover: {
          size: 8
        }
      },
      stroke: {
        width: [0, 3],
        curve: 'straight'
      },
      xaxis: {
        categories: [
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ],
        title: {
          text: "Month (2024)"
        }
      },
      yaxis: {
        axisTicks: {
          show: true
        },
        axisBorder: {
          show: true,
          color: "#2E93fA"
        },
        labels: {
          style: {
            colors: "#2E93fA"
          },
          formatter: function (val) {
            return "$" + (val / 1000).toFixed(0) + "k";
          }
        },
        title: {
          text: "Monthly Income ($)",
          style: {
            color: "#2E93fA"
          }
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (val) {
            return "$" + val.toLocaleString();
          }
        }
      },
      legend: {
        horizontalAlign: "center",
        offsetX: 0,
        position: "bottom"
      },
      plotOptions: {
        bar: {
          columnWidth: "60%",
          borderRadius: 4
        }
      },
      fill: {
        opacity: [0.8, 1]
      },
      colors: ["#2E93fA", "#013557"]
    };

    this.donutChart1Options = {
      series: [17, 2, 6],
      chart: {
        type: 'donut',
        height: 150,
        width: 150
      },
      labels: ['Occupied', 'Vacant', 'Unlisted'],
      colors: ['#2E93fA', '#dc3545', '#ffc107'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#013557']
        },
        background: {
          enabled: true,
          foreColor: '#fff',
          borderWidth: 0
        },
        dropShadow: {
          enabled: false
        },
        formatter: function(val: any, opts: any) {
          return opts.w.config.series[opts.seriesIndex];
        }
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          dataLabels: {
            offset: 15,
            minAngleToShowLabel: 20
          },
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                fontSize: '12px',
                color: '#666',
                formatter: () => '25'
              },
              value: {
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#242424'
              }
            }
          }
        }
      }
    };

    this.donutChart2Options = {
      series: [70, 30],
      chart: {
        type: 'donut',
        height: 150,
        width: 150
      },
      labels: ['Occupied', 'Available'],
      colors: ['#2E93fA', '#dee2e6'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#013557']
        },
        background: {
          enabled: true,
          foreColor: '#fff',
          borderWidth: 0
        },
        dropShadow: {
          enabled: false
        },
        formatter: function(val: any, opts: any) {
          return opts.w.config.series[opts.seriesIndex];
        }
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          dataLabels: {
            offset: 15,
            minAngleToShowLabel: 10
          },
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Occupancy Rate',
                fontSize: '10px',
                color: '#666',
                formatter: () => '70%'
              },
              value: {
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#242424'
              }
            }
          }
        }
      }
    };
  }
}
