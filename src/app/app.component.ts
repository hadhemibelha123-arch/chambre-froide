import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TelemetryService, TelemetryData } from './telemetry.service';
import { interval, Subscription, switchMap, startWith } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tempChart') tempChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('humChart') humChartRef!: ElementRef<HTMLCanvasElement>;

  data: TelemetryData = {};
  loading = true;
  error = false;
  lastUpdate: Date | null = null;
  private sub!: Subscription;
  private tempChart!: Chart;
  private humChart!: Chart;
  now = new Date();

  constructor(private svc: TelemetryService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.sub = interval(30000).pipe(
      startWith(0),
      switchMap(() => this.svc.getData())
    ).subscribe({
      next: d => {
        this.data = d;
        this.loading = false;
        this.error = false;
        this.lastUpdate = new Date();
        this.now = new Date();
        this.updateCharts();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.tempChart?.destroy();
    this.humChart?.destroy();
  }

  get riskColor(): string {
    const r = (this.data.risk_level || '').toLowerCase();
    if (r === 'high' || r === 'élevé' || r === 'eleve') return 'var(--red)';
    if (r === 'medium' || r === 'moyen') return 'var(--amber)';
    return 'var(--green)';
  }

  get riskLabel(): string {
    const r = (this.data.risk_level || '').toLowerCase();
    if (r === 'high' || r === 'élevé' || r === 'eleve') return 'ÉLEVÉ';
    if (r === 'medium' || r === 'moyen') return 'MOYEN';
    if (r === 'low' || r === 'faible') return 'FAIBLE';
    return this.data.risk_level || '—';
  }

  riskColorFor(risk: string | undefined): string {
    const r = (risk || '').toLowerCase();
    if (r === 'high' || r === 'élevé' || r === 'eleve') return 'var(--red)';
    if (r === 'medium' || r === 'moyen') return 'var(--amber)';
    return 'var(--green)';
  }

  riskLabelFor(risk: string | undefined): string {
    const r = (risk || '').toLowerCase();
    if (r === 'high' || r === 'élevé' || r === 'eleve') return 'ÉLEVÉ';
    if (r === 'medium' || r === 'moyen') return 'MOYEN';
    if (r === 'low' || r === 'faible') return 'FAIBLE';
    return risk || '—';
  }

  fmt(val: number | undefined, decimals = 1): string {
    if (val === undefined || val === null) return '—';
    return val.toFixed(decimals);
  }

  fmtPct(val: number | undefined): string {
    if (val === undefined || val === null) return '—';
    return (val * 100 > 1 ? val : val * 100).toFixed(1) + '%';
  }

  get alarmActive(): boolean {
    return !!this.data.alarm && this.data.alarm !== 0;
  }

  futureTime(minutesAhead: number): string {
    const t = new Date(this.now.getTime() + minutesAhead * 60000);
    return t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  private initCharts() {
    const gridColor = 'rgba(100,200,255,0.06)';
    const tickColor = '#3d6070';

    this.tempChart = new Chart(this.tempChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Actuel', '+5 min', '+10 min', '+20 min'],
        datasets: [
          {
            label: 'BC10 Temp (°C)',
            data: [null, null, null, null],
            borderColor: '#4fc3f7',
            backgroundColor: 'rgba(79,195,247,0.08)',
            borderWidth: 2,
            pointBackgroundColor: '#4fc3f7',
            pointRadius: 5,
            tension: 0.4,
            fill: true
          },
          {
            label: 'DS18B20 Temp (°C)',
            data: [null, null, null, null],
            borderColor: '#00e676',
            backgroundColor: 'rgba(0,230,118,0.06)',
            borderWidth: 2,
            pointBackgroundColor: '#00e676',
            pointStyle: 'triangle',
            pointRadius: 5,
            tension: 0.4,
            fill: true,
            borderDash: [6, 3]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tickColor, font: { family: 'DM Mono', size: 11 } }, grid: { color: gridColor } },
          y: { ticks: { color: tickColor, font: { family: 'DM Mono', size: 11 }, callback: v => v + '°C' }, grid: { color: gridColor } }
        }
      }
    });

    this.humChart = new Chart(this.humChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Actuel', '+5 min', '+10 min', '+20 min'],
        datasets: [
          {
            label: 'Humidité BC10 (%)',
            data: [null, null, null, null],
            borderColor: '#b39ddb',
            backgroundColor: 'rgba(179,157,219,0.08)',
            borderWidth: 2,
            pointBackgroundColor: '#b39ddb',
            pointRadius: 5,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tickColor, font: { family: 'DM Mono', size: 11 } }, grid: { color: gridColor } },
          y: { ticks: { color: tickColor, font: { family: 'DM Mono', size: 11 }, callback: v => v + '%' }, grid: { color: gridColor }, min: 0, max: 100 }
        }
      }
    });
  }

  private updateCharts() {
    if (!this.tempChart || !this.humChart) return;
    const d = this.data;

    this.tempChart.data.datasets[0].data = [
      d.bc10_temp ?? null,
      d.future_t5_temp1 ?? null,
      d.future_t10_temp1 ?? null,
      d.future_t20_temp1 ?? null
    ];
    this.tempChart.data.datasets[1].data = [
      d.ds18b20_temp ?? null,
      d.future_t5_temp2 ?? null,
      d.future_t10_temp2 ?? null,
      d.future_t20_temp2 ?? null
    ];
    this.tempChart.update();

    this.humChart.data.datasets[0].data = [
      d.bc10_hum ?? null,
      d.future_t5_hum ?? null,
      d.future_t10_hum ?? null,
      d.future_t20_hum ?? null
    ];
    this.humChart.update();
  }
}
