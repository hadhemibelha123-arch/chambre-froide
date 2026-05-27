import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface TelemetryData {
  ds18b20_temp?: number;
  bc10_temp?: number;
  bc10_hum?: number;
  bc10_batt?: number;
  alarm?: number;
  temp1_predite?: number;
  temp2_predite?: number;
  hum_predite?: number;
  ds18b20_failure_prob?: number;
  ds18b20_risk?: string;
  ds18b20_anomalie?: number;
  bc10_temp_failure_prob?: number;
  bc10_temp_risk?: string;
  bc10_temp_anomalie?: number;
  hum_failure_prob?: number;
  hum_risk?: string;
  hum_anomalie?: number;
  failure_probability?: number;
  risk_level?: string;
  future_t5_temp1?: number;
  future_t5_temp2?: number;
  future_t5_hum?: number;
  future_t10_temp1?: number;
  future_t10_temp2?: number;
  future_t10_hum?: number;
  future_t20_temp1?: number;
  future_t20_temp2?: number;
  future_t20_hum?: number;
}

@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private apiUrl = '/api/proxy';

  constructor(private http: HttpClient) {}

  getData(): Observable<TelemetryData> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(raw => this.parse(raw))
    );
  }

  private parse(raw: any): TelemetryData {
    const get = (key: string) => {
      const arr = raw[key];
      if (!arr || !arr.length) return undefined;
      const val = arr[0].value;
      const num = parseFloat(val);
      return isNaN(num) ? val : num;
    };
    return {
      ds18b20_temp: get('ds18b20_temp'),
      bc10_temp: get('bc10_temp'),
      bc10_hum: get('bc10_hum'),
      bc10_batt: get('bc10_batt'),
      alarm: get('alarm'),
      temp1_predite: get('temp1_predite'),
      temp2_predite: get('temp2_predite'),
      hum_predite: get('hum_predite'),
      ds18b20_failure_prob: get('ds18b20_failure_prob'),
      ds18b20_risk: get('ds18b20_risk'),
      ds18b20_anomalie: get('ds18b20_anomalie'),
      bc10_temp_failure_prob: get('bc10_temp_failure_prob'),
      bc10_temp_risk: get('bc10_temp_risk'),
      bc10_temp_anomalie: get('bc10_temp_anomalie'),
      hum_failure_prob: get('hum_failure_prob'),
      hum_risk: get('hum_risk'),
      hum_anomalie: get('hum_anomalie'),
      failure_probability: get('failure_probability'),
      risk_level: get('risk_level'),
      future_t5_temp1: get('future_t5_temp1'),
      future_t5_temp2: get('future_t5_temp2'),
      future_t5_hum: get('future_t5_hum'),
      future_t10_temp1: get('future_t10_temp1'),
      future_t10_temp2: get('future_t10_temp2'),
      future_t10_hum: get('future_t10_hum'),
      future_t20_temp1: get('future_t20_temp1'),
      future_t20_temp2: get('future_t20_temp2'),
      future_t20_hum: get('future_t20_hum'),
    };
  }
}
