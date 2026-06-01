import { Municipio, Bairro, AnaliseHistorico, SQLTableSchema } from "./types";

export const MUNICIPIONS_DATA: Municipio[] = [
  {
    id: "belem",
    nome: "Belém",
    areaKm2: 505.8,
    coberturaVegetalPct: 18.5,
    bairrosCount: 38,
    prioritariasCount: 11,
    arvoresEstimadas: 580000,
    coordenadas: [-1.4558, -48.4902]
  },
  {
    id: "ananindeua",
    nome: "Ananindeua",
    areaKm2: 190.4,
    coberturaVegetalPct: 24.2,
    bairrosCount: 22,
    prioritariasCount: 4,
    arvoresEstimadas: 180000,
    coordenadas: [-1.3653, -48.3748]
  },
  {
    id: "marituba",
    nome: "Marituba",
    areaKm2: 107.4,
    coberturaVegetalPct: 35.8,
    bairrosCount: 8,
    prioritariasCount: 2,
    arvoresEstimadas: 65000,
    coordenadas: [-1.3542, -48.3431]
  },
  {
    id: "benevides",
    nome: "Benevides",
    areaKm2: 440.3,
    coberturaVegetalPct: 48.1,
    bairrosCount: 4,
    prioritariasCount: 1,
    arvoresEstimadas: 25000,
    coordenadas: [-1.3619, -48.2435]
  }
];

export const INITIAL_BAIRROS: Bairro[] = [
  // Mais Arborizados (Belém)
  {
    id: "batista_campos",
    municipioId: "belem",
    nome: "Batista Campos",
    areaKm2: 1.05,
    areaVegetadaKm2: 0.45,
    coberturaPct: 42.8,
    metaPct: 30.0,
    prioridade: "Baixa",
    arvoresNecessarias: 0,
    coordenadas: { lat: -1.4589, lng: -48.4912 },
    geom: "POLYGON((-48.4962 -1.4539, -48.4862 -1.4539, -48.4812 -1.4589, -48.4862 -1.4639, -48.4962 -1.4639, -48.4962 -1.4539))"
  },
  {
    id: "nazare",
    municipioId: "belem",
    nome: "Nazaré",
    areaKm2: 1.25,
    areaVegetadaKm2: 0.48,
    coberturaPct: 38.4,
    metaPct: 30.0,
    prioridade: "Baixa",
    arvoresNecessarias: 0,
    coordenadas: { lat: -1.4532, lng: -48.4845 },
    geom: {
      type: "Polygon",
      coordinates: [
        [
          [-48.4895, -1.4482],
          [-48.4795, -1.4482],
          [-48.4745, -1.4532],
          [-48.4795, -1.4582],
          [-48.4895, -1.4582],
          [-48.4895, -1.4482]
        ]
      ]
    }
  },
  {
    id: "marco",
    municipioId: "belem",
    nome: "Marco",
    areaKm2: 4.80,
    areaVegetadaKm2: 1.68,
    coberturaPct: 35.1,
    metaPct: 30.0,
    prioridade: "Baixa",
    arvoresNecessarias: 0,
    coordenadas: { lat: -1.4398, lng: -48.4599 }
  },
  {
    id: "souza",
    municipioId: "belem",
    nome: "Souza",
    areaKm2: 2.10,
    areaVegetadaKm2: 0.65,
    coberturaPct: 31.2,
    metaPct: 30.0,
    prioridade: "Baixa",
    arvoresNecessarias: 0,
    coordenadas: { lat: -1.4192, lng: -48.4550 }
  },
  {
    id: "umarizal",
    municipioId: "belem",
    nome: "Umarizal",
    areaKm2: 1.70,
    areaVegetadaKm2: 0.50,
    coberturaPct: 29.7,
    metaPct: 30.0,
    prioridade: "Regular",
    arvoresNecessarias: 2200,
    coordenadas: { lat: -1.4423, lng: -48.4831 },
    geom: "POLYGON((-48.4880 -1.4370, -48.4780 -1.4370, -48.4730 -1.4420, -48.4780 -1.4470, -48.4880 -1.4470, -48.4880 -1.4370))"
  },

  // Mais Críticos (Belém)
  {
    id: "pedreira",
    municipioId: "belem",
    nome: "Pedreira",
    areaKm2: 3.20,
    areaVegetadaKm2: 0.42,
    coberturaPct: 13.1,
    metaPct: 30.0,
    prioridade: "Alta",
    arvoresNecessarias: 13500,
    coordenadas: { lat: -1.4325, lng: -48.4851 },
    geom: "POLYGON((-48.4900 -1.4270, -48.4800 -1.4270, -48.4750 -1.4320, -48.4800 -1.4370, -48.4900 -1.4370, -48.4900 -1.4270))"
  },
  {
    id: "guama",
    municipioId: "belem",
    nome: "Guamá",
    areaKm2: 5.40,
    areaVegetadaKm2: 0.45,
    coberturaPct: 8.4,
    metaPct: 30.0,
    prioridade: "Crítica",
    arvoresNecessarias: 28000,
    coordenadas: { lat: -1.4682, lng: -48.4651 },
    geom: "{\"type\":\"Polygon\",\"coordinates\":[[[-48.4700,-1.4630],[-48.4600,-1.4630],[-48.4550,-1.4680],[-48.4600,-1.4730],[-48.4700,-1.4730],[-48.4700,-1.4630]]]}"
  },
  {
    id: "terra_firme",
    municipioId: "belem",
    nome: "Terra Firme",
    areaKm2: 3.10,
    areaVegetadaKm2: 0.28,
    coberturaPct: 9.1,
    metaPct: 30.0,
    prioridade: "Crítica",
    arvoresNecessarias: 16000,
    coordenadas: { lat: -1.4512, lng: -48.4563 }
  },
  {
    id: "jurunas",
    municipioId: "belem",
    nome: "Jurunas",
    areaKm2: 3.80,
    areaVegetadaKm2: 0.44,
    coberturaPct: 11.5,
    metaPct: 30.0,
    prioridade: "Alta",
    arvoresNecessarias: 19500,
    coordenadas: { lat: -1.4619, lng: -48.5042 }
  },
  {
    id: "sacramenta",
    municipioId: "belem",
    nome: "Sacramenta",
    areaKm2: 4.10,
    areaVegetadaKm2: 0.56,
    coberturaPct: 13.8,
    metaPct: 30.0,
    prioridade: "Alta",
    arvoresNecessarias: 17800,
    coordenadas: { lat: -1.4112, lng: -48.4722 }
  },

  // Ananindeua Bairros
  {
    id: "coqueiro",
    municipioId: "ananindeua",
    nome: "Coqueiro",
    areaKm2: 8.20,
    areaVegetadaKm2: 1.64,
    coberturaPct: 20.0,
    metaPct: 30.0,
    prioridade: "Regular",
    arvoresNecessarias: 18000,
    coordenadas: { lat: -1.3512, lng: -48.3912 }
  },
  {
    id: "cidade_nova",
    municipioId: "ananindeua",
    nome: "Cidade Nova",
    areaKm2: 10.50,
    areaVegetadaKm2: 1.57,
    coberturaPct: 15.0,
    metaPct: 30.0,
    prioridade: "Alta",
    arvoresNecessarias: 28500,
    coordenadas: { lat: -1.3650, lng: -48.3790 }
  },
  {
    id: "quarenta_horas",
    municipioId: "ananindeua",
    nome: "Quarenta Horas",
    areaKm2: 6.40,
    areaVegetadaKm2: 2.11,
    coberturaPct: 33.0,
    metaPct: 30.0,
    prioridade: "Baixa",
    arvoresNecessarias: 0,
    coordenadas: { lat: -1.3323, lng: -48.3842 }
  },

  // Marituba Bairros
  {
    id: "decouville",
    municipioId: "marituba",
    nome: "Decouville",
    areaKm2: 3.50,
    areaVegetadaKm2: 1.12,
    coberturaPct: 32.0,
    metaPct: 30.0,
    prioridade: "Baixa",
    arvoresNecessarias: 0,
    coordenadas: { lat: -1.3582, lng: -48.3491 }
  },
  {
    id: "centro_marituba",
    municipioId: "marituba",
    nome: "Marituba Centro",
    areaKm2: 4.80,
    areaVegetadaKm2: 0.81,
    coberturaPct: 16.8,
    metaPct: 30.0,
    prioridade: "Alta",
    arvoresNecessarias: 14000,
    coordenadas: { lat: -1.3551, lng: -48.3372 }
  },

  // Benevides Bairros
  {
    id: "centro_benevides",
    municipioId: "benevides",
    nome: "Benevides Centro",
    areaKm2: 5.20,
    areaVegetadaKm2: 2.34,
    coberturaPct: 45.0,
    metaPct: 30.0,
    prioridade: "Baixa",
    arvoresNecessarias: 0,
    coordenadas: { lat: -1.3610, lng: -48.2430 }
  },
  {
    id: "murinin",
    municipioId: "benevides",
    nome: "Murinin",
    areaKm2: 12.0,
    areaVegetadaKm2: 6.60,
    coberturaPct: 55.0,
    metaPct: 30.0,
    prioridade: "Baixa",
    arvoresNecessarias: 0,
    coordenadas: { lat: -1.3129, lng: -48.2712 }
  }
];

export const HISTORICO_INICIAL: AnaliseHistorico[] = [
  {
    id: "hist-01",
    dataStr: "24 Out 2023, 14:30",
    municipioId: "belem",
    regiaoMonitorada: "Batista Campos / Nazaré",
    coberturaVegetal: 40.6,
    variacaoPct: 1.2,
    status: "Processada",
    dataCriacao: "2023-10-24T14:30:00Z"
  },
  {
    id: "hist-02",
    dataStr: "20 Out 2023, 09:15",
    municipioId: "belem",
    regiaoMonitorada: "Pedreira / Sacramenta",
    coberturaVegetal: 10.1,
    variacaoPct: -0.4,
    status: "Processada",
    dataCriacao: "2023-10-20T09:15:00Z"
  },
  {
    id: "hist-03",
    dataStr: "18 Out 2023, 16:45",
    municipioId: "belem",
    regiaoMonitorada: "Umarizal / Marco",
    coberturaVegetal: 32.4,
    variacaoPct: 0.0,
    status: "Processada",
    dataCriacao: "2023-10-18T16:45:00Z"
  },
  {
    id: "hist-04",
    dataStr: "15 Out 2023, 11:20",
    municipioId: "belem",
    regiaoMonitorada: "Guamá / Terra Firme",
    coberturaVegetal: 8.7,
    variacaoPct: -1.1,
    status: "Processada",
    dataCriacao: "2023-10-15T11:20:00Z"
  },
  {
    id: "hist-05",
    dataStr: "30 Jan 2024, 08:30",
    municipioId: "ananindeua",
    regiaoMonitorada: "Cidade Nova / Coqueiro",
    coberturaVegetal: 17.5,
    variacaoPct: 0.8,
    status: "Processada",
    dataCriacao: "2024-01-30T08:30:00Z"
  },
  {
    id: "hist-06",
    dataStr: "14 Mai 2024, 10:00",
    municipioId: "marituba",
    regiaoMonitorada: "Marituba Centro",
    coberturaVegetal: 16.8,
    variacaoPct: 0.2,
    status: "Processada",
    dataCriacao: "2024-05-14T10:00:00Z"
  }
];

export const SUPABASE_SCHEMAS: SQLTableSchema[] = [
  {
    tableName: "municipios",
    description: "Tabela que armazena os dados dos municípios da Região Metropolitana abrangida pelo portal.",
    fields: [
      { name: "id", type: "uuid", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", desc: "Identificador único do registro" },
      { name: "nome", type: "varchar(100)", constraints: "NOT NULL UNIQUE", desc: "Nome do município (ex: Belém, Ananindeua)" },
      { name: "area_total_km2", type: "numeric(10,2)", constraints: "NOT NULL", desc: "Área territorial total em km²" },
      { name: "meta_arborizacao_pct", type: "numeric(5,2)", constraints: "DEFAULT 30.00", desc: "Alvo recomendado para cobertura vegetal (%)" },
      { name: "latitude", type: "numeric(9,6)", constraints: "", desc: "Coordenada latitudinal central para mapas" },
      { name: "longitude", type: "numeric(9,6)", constraints: "", desc: "Coordenada longitudinal central para mapas" },
      { name: "geom_limites", type: "geometry(Polygon, 4326)", constraints: "", desc: "Limites geográficos do município para desenho no mapa" },
      { name: "created_at", type: "timestamp with time zone", constraints: "DEFAULT now()", desc: "Data de criação do registro" }
    ]
  },
  {
    tableName: "bairros",
    description: "Tabela contendo a caracterização de área vegetada e cálculos de déficit por bairro.",
    fields: [
      { name: "id", type: "uuid", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", desc: "Identificador único" },
      { name: "municipio_id", type: "uuid", constraints: "REFERENCES municipios(id) ON DELETE CASCADE", desc: "Vínculo com o município pai" },
      { name: "nome", type: "varchar(150)", constraints: "NOT NULL", desc: "Nome do bairro (ex: Pedreira, Guamá)" },
      { name: "area_total_m2", type: "numeric(15,2)", constraints: "NOT NULL", desc: "Área em metros quadrados para cálculos exatos" },
      { name: "area_vegetada_m2", type: "numeric(15,2)", constraints: "NOT NULL", desc: "Área de vegetação filtrada via NDVI" },
      { name: "meta_cobertura_pct", type: "numeric(5,2)", constraints: "DEFAULT 30.0", desc: "Taxa mínima ideal (Meta)" },
      { name: "estimativa_arvores_deficit", type: "integer", constraints: "DEFAULT 0", desc: "Mudas necessárias para cobrir o passivo arbóreo" },
      { name: "geom_limites", type: "geometry(Polygon, 4326)", constraints: "", desc: "Polígono GIS PostGIS dos limites oficiais" },
      { name: "created_at", type: "timestamp with time zone", constraints: "DEFAULT now()", desc: "Carimbo de gravação" }
    ]
  },
  {
    tableName: "analises_satelite",
    description: "Registros históricos de processamentos NDVI realizados através do Sentinel/Landsat.",
    fields: [
      { name: "id", type: "uuid", constraints: "PRIMARY KEY", desc: "Id sequencial da análise" },
      { name: "bairro_id", type: "uuid", constraints: "REFERENCES bairros(id)", desc: "Bairro alvo ou NULL para nível macro" },
      { name: "cobertura_vegetal_obtida_pct", type: "numeric(5,2)", constraints: "NOT NULL", desc: "Percentual calculado pelo motor de IA" },
      { name: "variacao_periodo_anterior_pct", type: "numeric(5,2)", constraints: "", desc: "Aumento ou retrocesso em comparação à anterior" },
      { name: "sensor_origem", type: "varchar(50)", constraints: "DEFAULT 'Sentinel-2 L2A'", desc: "Constelação de satélites utilizada" },
      { name: "status_analise", type: "varchar(30)", constraints: "CHECK (status IN ('Processada', 'Processando', 'Falha'))", desc: "Status da fila de cálculo" },
      { name: "data_analise", type: "timestamp with time zone", constraints: "DEFAULT now()", desc: "Data de processamento" }
    ]
  },
  {
    tableName: "areas_prioritarias",
    description: "Pontos quentes de ilhas de calor e calçadas agressivamente impermeabilizadas catalogados.",
    fields: [
      { name: "id", type: "uuid", constraints: "PRIMARY KEY", desc: "Chave primária" },
      { name: "bairro_id", type: "uuid", constraints: "REFERENCES bairros(id)", desc: "Vínculo geográfico" },
      { name: "urgencia_intervencao", type: "varchar(20)", constraints: "NOT NULL", desc: "Crítica, Alta ou Média" },
      { name: "temperatura_superficial_estimada", type: "numeric(4,1)", constraints: "", desc: "Medição térmica obtida via infravermelho térmico" },
      { name: "created_at", type: "timestamp with time zone", constraints: "DEFAULT now()", desc: "Data de detecção inicial" }
    ]
  }
];

export const EXPORT_DATABASE_SQL = `-- Estrutura de Banco de Dados PostGIS para o ArborizIA Belém
-- Pronto para importação no Supabase (com PostGIS habilitado)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Municipios
CREATE TABLE public.municipios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    area_total_km2 NUMERIC(10,2) NOT NULL,
    meta_arborizacao_pct NUMERIC(5,2) DEFAULT 30.00,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    geom_limites GEOMETRY(Polygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bairros
CREATE TABLE public.bairros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipio_id UUID REFERENCES public.municipios(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    area_total_m2 NUMERIC(15,2) NOT NULL,
    area_vegetada_m2 NUMERIC(15,2) NOT NULL,
    meta_cobertura_pct NUMERIC(5,2) DEFAULT 30.00,
    estimativa_arvores_deficit INTEGER DEFAULT 0,
    geom_limites GEOMETRY(Polygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices Espaciais PostGIS para consultas eficientes de proximidade
CREATE INDEX idx_bairros_geom ON public.bairros USING GIST (geom_limites);

-- 2.5 View municipios_geojson para entrega no formato GeoJSON do Leaflet
CREATE OR REPLACE VIEW public.municipios_geojson AS
SELECT 
    id,
    nome,
    'Pará'::varchar AS estado,
    area_total_km2 AS area_km2,
    ST_AsGeoJSON(geom_limites)::json AS geometry
FROM public.municipios;

-- 3. Historico de Analises
CREATE TABLE public.analises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bairro_id UUID REFERENCES public.bairros(id) ON DELETE CASCADE,
    cobertura_vegetal_pct NUMERIC(5,2) NOT NULL,
    variacao_pct NUMERIC(5,2) DEFAULT 0.00,
    sensor_origem VARCHAR(100) DEFAULT 'Sentinel-2 Multispectral',
    status VARCHAR(50) DEFAULT 'Processada' CHECK (status IN ('Processada', 'Processando', 'Falha')),
    data_analise TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Popula dados iniciais para homologação
INSERT INTO public.municipios (id, nome, area_total_km2, meta_arborizacao_pct, latitude, longitude) VALUES
('b38fe311-bf31-4b1a-824b-3cc3b708ddbd', 'Belém', 505.80, 30.00, -1.4558, -48.4902),
('6fb455c1-6b60-496e-a579-effb7ff0ddbb', 'Ananindeua', 190.40, 30.00, -1.3653, -48.3748);

INSERT INTO public.bairros (id, municipio_id, nome, area_total_m2, area_vegetada_m2, meta_cobertura_pct, estimativa_arvores_deficit) VALUES
(uuid_generate_v4(), 'b38fe311-bf31-4b1a-824b-3cc3b708ddbd', 'Pedreira', 3200000.00, 420000.00, 30.00, 13500),
(uuid_generate_v4(), 'b38fe311-bf31-4b1a-824b-3cc3b708ddbd', 'Guamá', 5400000.00, 450000.00, 30.00, 28000),
(uuid_generate_v4(), '6fb455c1-6b60-496e-a579-effb7ff0ddbb', 'Cidade Nova', 10500000.00, 1570000.00, 30.00, 28500);
`;
