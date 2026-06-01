import React, { useState } from "react";
import { Bairro } from "../types";
import { INITIAL_BAIRROS } from "../data";
import { Award, AlertTriangle, Search, Filter } from "lucide-react";

interface RankingsSectionProps {
  onBairroSelect: (bairro: Bairro) => void;
  selectedMunicipioId: string;
  bairros?: Bairro[];
}

export default function RankingsSection({
  onBairroSelect,
  selectedMunicipioId,
  bairros,
}: RankingsSectionProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filter bairros first by municipality, then by search name
  const filteredBairros = (bairros || INITIAL_BAIRROS).filter((b) => {
    const matchesMunicipio = selectedMunicipioId === "todos" || b.municipioId === selectedMunicipioId;
    const matchesSearch = b.nome.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMunicipio && matchesSearch;
  });

  // Most Forested (coberturaPct DESC)
  const mostVeg = [...filteredBairros]
    .sort((a, b) => b.coberturaPct - a.coberturaPct)
    .slice(0, 5);

  // Most Critical (coberturaPct ASC)
  const mostCritical = [...filteredBairros]
    .sort((a, b) => a.coberturaPct - b.coberturaPct)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Filters and search layout */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white/80 p-4 rounded-2xl border border-outline-variant/30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por bairro da RMB..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm w-full sm:w-64 placeholder-slate-400 font-medium text-slate-800"
          />
        </div>
        <div className="text-xs font-mono text-slate-500">
          Exibindo {filteredBairros.length} bairros mapeados
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Mais Arborizados */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-800">
                <Award className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary font-bold">
                  Bairros Mais Arborizados
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Zonas com maior biodiversidade e biomassa mapeada
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-outline-variant/30 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 text-center w-12">RANK</th>
                    <th className="pb-3 pl-2">BAIRRO</th>
                    <th className="pb-3 text-right">COBERTURA (%)</th>
                    <th className="pb-3 text-right pr-2">STATUS OMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mostVeg.map((b, index) => {
                    // Tag status
                    let statusLabel = "Excelente";
                    let statusClass = "bg-emerald-100 text-emerald-900 border-emerald-200";
                    if (b.coberturaPct < 30) {
                      statusLabel = "Próximo à Meta";
                      statusClass = "bg-lime-50 text-lime-900 border-lime-100";
                    } else if (b.coberturaPct < 35) {
                      statusLabel = "Bom";
                      statusClass = "bg-emerald-50 text-emerald-800 border-emerald-100";
                    }

                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => onBairroSelect(b)}
                      >
                        <td className="py-3.5 text-center font-bold text-emerald-700 font-mono text-sm">
                          0{index + 1}
                        </td>
                        <td className="py-3.5 pl-2 font-medium text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {b.nome}
                        </td>
                        <td className="py-3.5 text-right font-mono font-bold text-slate-800">
                          {b.coberturaPct.toFixed(1)}%
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {mostVeg.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-slate-400 italic">
                        Nenhum registro encontrado para a busca especificada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Table 2: Mais Críticos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-800">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary font-bold">
                  Bairros Mais Críticos
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Zonas com forte impermeabilização do solo e calor superficial elevado
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-outline-variant/30 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 text-center w-12">RANK</th>
                    <th className="pb-3 pl-2">BAIRRO</th>
                    <th className="pb-3 text-right">COBERTURA (%)</th>
                    <th className="pb-3 text-right pr-2">ESTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mostCritical.map((b, index) => {
                    let statusLabel = "Crítico";
                    let statusClass = "bg-red-50 text-red-900 border-red-100";
                    if (b.coberturaPct > 15) {
                      statusLabel = "Déficit Leve";
                      statusClass = "bg-orange-50 text-orange-900 border-orange-150";
                    } else if (b.coberturaPct > 10) {
                      statusLabel = "Insuficiente";
                      statusClass = "bg-orange-100 text-orange-950 border-orange-200";
                    }

                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        onClick={() => onBairroSelect(b)}
                      >
                        <td className="py-3.5 text-center font-bold text-red-600 font-mono text-sm">
                          0{index + 1}
                        </td>
                        <td className="py-3.5 pl-2 font-medium text-slate-900 group-hover:text-red-700 transition-colors">
                          {b.nome}
                        </td>
                        <td className="py-3.5 text-right font-mono font-bold text-slate-800">
                          {b.coberturaPct.toFixed(1)}%
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {mostCritical.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-slate-400 italic">
                        Nenhum registro crítico encontrado para a busca especificada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
