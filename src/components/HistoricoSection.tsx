import React, { useState } from "react";
import { AnaliseHistorico } from "../types";
import { HISTORICO_INICIAL } from "../data";
import { History, Calendar, HelpCircle, CheckCircle2, TrendingUp, TrendingDown, ArrowRight, Minus } from "lucide-react";

interface HistoricoSectionProps {
  historicoList: AnaliseHistorico[];
}

export default function HistoricoSection({ historicoList }: HistoricoSectionProps) {
  const [filterRegion, setFilterRegion] = useState<string>("todas");

  const filteredHistory = historicoList.filter((item) => {
    if (filterRegion === "todas") return true;
    if (filterRegion === "belem") return item.municipioId === "belem";
    if (filterRegion === "ananindeua") return item.municipioId === "ananindeua";
    if (filterRegion === "marituba") return item.municipioId === "marituba";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search and Dropdowns */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="p-5 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <History className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-primary font-bold">
                Log de Análises Anteriores
              </h3>
              <p className="text-xs text-on-surface-variant">
                Registros históricos de sensoriamento por satélite e flutuações NDVI
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="appearance-none bg-slate-100 border border-outline-variant/40 px-4 py-2 pr-10 rounded-xl text-xs font-semibold text-slate-700 focus:ring-emerald-700 focus:border-emerald-700 cursor-pointer"
              >
                <option value="todas">Filtrar por Município</option>
                <option value="belem">Belém</option>
                <option value="ananindeua">Ananindeua</option>
                <option value="marituba">Marituba</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-2 pointer-events-none text-slate-500 text-sm">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Table view */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f0f3ff]/50 font-sans">
              <tr className="text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                <th className="px-6 py-4">Data da Análise</th>
                <th className="px-6 py-4">Região Monitorada</th>
                <th className="px-6 py-4 text-center">Cobertura Veg.</th>
                <th className="px-6 py-4 text-center">Variação</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Referência Sensor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.dataStr}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary capitalize">
                    {item.regiaoMonitorada}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900 text-center">
                    {item.coberturaVegetal}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.variacaoPct > 0 ? (
                      <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{item.variacaoPct}%
                      </span>
                    ) : item.variacaoPct < 0 ? (
                      <span className="inline-flex items-center text-xs font-bold text-red-650 bg-red-50 px-2.5 py-1 rounded-full">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {item.variacaoPct}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
                        <Minus className="w-3 h-3 mr-1" />
                        Estável
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.status === "Processada" ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span className="text-xs font-medium text-slate-700">{item.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-mono text-slate-400">
                    Sentinel-2 L2A · Multispectral
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400 italic">
                    Nenhuma análise catalogada para a região selecionada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info counts */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium font-sans">
          <span>Exibindo {filteredHistory.length} análises de sensoriamento</span>
          <div className="flex gap-2">
            <button disabled className="p-1.5 rounded border border-outline-variant/40 bg-white disabled:opacity-40 text-slate-400">
              Anterior
            </button>
            <button disabled className="p-1.5 rounded border border-outline-variant/40 bg-white disabled:opacity-40 text-slate-400">
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* Strategic City Vision Banner representation */}
      <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg group">
        <img
          alt="Visão de satélite Belém"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1500&auto=format&fit=crop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white max-w-2xl">
          <h4 className="font-headline-lg text-headline-lg font-bold mb-2">
            Visão Estratégica da Região Metropolitana
          </h4>
          <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-normal">
            Utilizamos Inteligência Artificial para processar imagens de satélite multiespectrais e infravermelhas para detectar estresse hídrico vegetal, identificar clareiras em áreas urbanas de Belém e catalogar vias de alto asfalto que necessitam de intervenção urgente.
          </p>
        </div>
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur z-10 px-3 py-1 rounded-full border border-white/20">
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            SENSING EM TEMPO REAL
          </span>
        </div>
      </div>
    </div>
  );
}
