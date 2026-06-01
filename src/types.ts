/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Municipio {
  id: string; // e.g. "belem", "ananindeua"
  nome: string;
  areaKm2: number;
  coberturaVegetalPct: number;
  bairrosCount: number;
  prioritariasCount: number;
  arvoresEstimadas: number;
  coordenadas: [number, number]; // [lat, lng]
  geometry?: any;
  geom?: any;
  dbId?: string;
}

export interface Bairro {
  id: string;
  municipioId: string;
  nome: string;
  areaKm2: number;
  areaVegetadaKm2: number;
  coberturaPct: number; // calculated as areaVegetadaKm2 / areaKm2 * 100
  metaPct: number; // target coverage, recommended
  prioridade: "Baixa" | "Regular" | "Alta" | "Crítica";
  arvoresNecessarias: number;
  coordenadas: { lat: number; lng: number };
  geometriaText?: string; // polygon coordinate mock references or shapes
  geom?: any;
}

export interface AnaliseHistorico {
  id: string;
  dataStr: string;
  municipioId: string;
  bairroId?: string; // optional specific neighborhood
  regiaoMonitorada: string;
  coberturaVegetal: number;
  variacaoPct: number; // positive or negative percentage variation
  status: "Processada" | "Processando" | "Falha";
  dataCriacao: string;
}

export interface AreaPrioritaria {
  id: string;
  bairroId: string;
  nomeBairro: string;
  urgencia: "Crítica" | "Alta" | "Média";
  temperaturaMediaCelsius: number;
  deficitArbPct: number;
}

export interface SQLTableSchema {
  tableName: string;
  description: string;
  fields: { name: string; type: string; constraints?: string; desc: string }[];
}
