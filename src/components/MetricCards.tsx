import React from "react";
import { Trees, MapPin, HardHat, TrendingDown, Layers } from "lucide-react";

interface MetricCardsProps {
  totalAreaKm2: number;
  averageVegPct: number;
  bairrosCount: number;
  prioritariasCount: number;
  arvoresEstimadas: number;
}

export default function MetricCards({
  totalAreaKm2,
  averageVegPct,
  bairrosCount,
  prioritariasCount,
  arvoresEstimadas,
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* CARD 1: Área Analisada */}
      <div className="bg-[#ffffff]/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800">
            <Layers className="w-5 h-5 text-emerald-700" />
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Área Analisada
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-bold text-primary">
            {totalAreaKm2.toLocaleString("pt-BR")}{" "}
            <span className="text-sm font-medium text-on-surface-variant">km²</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Região Metropolitana de Belém
          </p>
        </div>
      </div>

      {/* CARD 2: Cobertura Vegetal */}
      <div className="bg-[#ffffff]/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800">
            <Trees className="w-5 h-5 text-emerald-700" />
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Cobertura Média
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-bold text-secondary">
            {averageVegPct.toFixed(1)}%
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-red-600 font-semibold">
            <TrendingDown className="w-3 h-3" />
            <span>Abaixo da meta OMS (30%)</span>
          </div>
        </div>
      </div>

      {/* CARD 3: Bairros Analisados */}
      <div className="bg-[#ffffff]/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800">
            <MapPin className="w-5 h-5 text-emerald-700" />
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Bairros Ativos
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-bold text-primary">{bairrosCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Zonas mapeadas com NDVI
          </p>
        </div>
      </div>

      {/* CARD 4: Áreas Prioritárias */}
      <div className="bg-[#ffffff]/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-orange-500">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-50 rounded-xl text-orange-850">
            <HardHat className="w-5 h-5 text-orange-600" />
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Áreas Críticas
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-bold text-orange-600">{prioritariasCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Estresse térmico severo
          </p>
        </div>
      </div>

      {/* CARD 5: Árvores Necessárias */}
      <div className="bg-[#ffffff]/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-emerald-600">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800">
            <span className="material-symbols-outlined text-[20px] text-emerald-700">forest</span>
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Mudas Requeridas
          </span>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-bold text-emerald-800">
            {arvoresEstimadas.toLocaleString("pt-BR")}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Para cobrir passivo ambiental
          </p>
        </div>
      </div>
    </div>
  );
}
