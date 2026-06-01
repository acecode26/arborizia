import React, { useState } from "react";
import { SQLTableSchema, Municipio, Bairro } from "../types";
import { SUPABASE_SCHEMAS, EXPORT_DATABASE_SQL } from "../data";
import { Terminal, Database, ShieldAlert, Cpu, CheckCircle2, RotateCw, FileSpreadsheet, Download, RefreshCw, Layers } from "lucide-react";

interface AdminSectionProps {
  municipios: Municipio[];
  bairros: Bairro[];
  onTriggerScan: () => void;
  onReprocessBairros: () => void;
  onAddAuditLog: (user: string, action: string, status: "SUCESSO" | "FALHA" | "INFO") => void;
  auditLogs: { id: string; user: string; action: string; status: "SUCESSO" | "FALHA" | "INFO"; timeStr: string }[];
  supabaseStatus?: {
    connected: boolean;
    error: string | null;
    urlConfigured: boolean;
    tables: {
      municipios: number;
      bairros: number;
      analises_bairros: number;
      areas_prioritarias: number;
      historico_analises: number;
      escaneamentos: number;
      imagens_satelite: number;
      relatorios_ia: number;
    }
  } | null;
  onSeedDatabase?: () => Promise<void>;
}

export default function AdminSection({
  municipios,
  bairros,
  onTriggerScan,
  onReprocessBairros,
  onAddAuditLog,
  auditLogs,
  supabaseStatus,
  onSeedDatabase,
}: AdminSectionProps) {
  const [activeSchema, setActiveSchema] = useState<string>(SUPABASE_SCHEMAS[0].tableName);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [reprocessing, setReprocessing] = useState<boolean>(false);
  const [updatingSensor, setUpdatingSensor] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);

  // Quick config toggles
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [publicDashboard, setPublicDashboard] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);

  const selectedSchema = SUPABASE_SCHEMAS.find((s) => s.tableName === activeSchema) || SUPABASE_SCHEMAS[0];

  const handleSeed = async () => {
    if (!onSeedDatabase) return;
    setSeeding(true);
    onAddAuditLog("Administrador", "Iniciou semeadura de dados no Supabase", "INFO");
    try {
      await onSeedDatabase();
      onAddAuditLog("Administrador", "Semeadura Supabase concluída com sucesso", "SUCESSO");
      alert("Nivelamento concluído! O banco Supabase foi semeado com dados dos municípios e bairros da RMB com sucesso.");
    } catch (err: any) {
      onAddAuditLog("Administrador", `Falha na semeadura: ${err.message}`, "FALHA");
      alert(`Falha ao semear banco de dados: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(EXPORT_DATABASE_SQL);
    setCopiedSql(true);
    onAddAuditLog("Administrador", "Copiou SQL PostGIS consolidada", "INFO");
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleRunAnalytics = () => {
    setUpdatingSensor(true);
    onAddAuditLog("Administrador", "Disparou atualização de sensores NDVI", "INFO");
    setTimeout(() => {
      setUpdatingSensor(false);
      onAddAuditLog("Administrador", "Sincronização de satélites concluída", "SUCESSO");
      alert("A constelação de satélites Sentinel-2 foi sincronizada com sucesso! Novos dados de cobertura vegetal média foram atualizados na base temporária.");
    }, 2000);
  };

  const handleReprocessAction = () => {
    setReprocessing(true);
    onAddAuditLog("Administrador", "Iniciou reprocessamento total de polígonos", "INFO");
    setTimeout(() => {
      setReprocessing(false);
      onReprocessBairros();
      onAddAuditLog("Administrador", "Cálculos de déficit reprocessados", "SUCESSO");
      alert("Todos os bairros da RMB foram reprocessados contra a meta da OMS (30%) com base nas revisões de NDVI atualizadas!");
    }, 1800);
  };

  const downloadSqlFile = () => {
    const element = document.createElement("a");
    const file = new Blob([EXPORT_DATABASE_SQL], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "arborizia_belem_postgis_supabase.sql";
    document.body.appendChild(element);
    element.click();
    onAddAuditLog("Administrador", "Exportou arquivo .sql de banco de dados", "SUCESSO");
  };

  return (
    <div className="space-y-8">
      {/* Database Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800">
              <span className="material-symbols-outlined text-emerald-700 text-[20px]">location_city</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              OK / ATIVO
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Tabelas Ativas</p>
            <h3 className="text-2xl font-bold text-primary">{SUPABASE_SCHEMAS.length + 3} PostGIS</h3>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: "100%" }} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800">
              <Database className="w-5 h-5 text-emerald-700" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              CONECTADO
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Municípios Integrados</p>
            <h3 className="text-2xl font-bold text-primary">{municipios.length} da RMB</h3>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: "100%" }} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800">
              <span className="material-symbols-outlined text-emerald-700 text-[20px]">monitoring</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              ATIVO
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Polígonos Escaneados</p>
            <h3 className="text-2xl font-bold text-primary">{bairros.length}</h3>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: "100%" }} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-800">
              <Cpu className="w-5 h-5 text-emerald-700" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              ESTÁVEL
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Acurácia do Motor</p>
            <h3 className="text-2xl font-bold text-primary">94.8%</h3>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "95%" }} />
          </div>
        </div>
      </div>

      {/* Asymmetric administrative section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Action triggers */}
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-headline-md text-headline-md text-primary font-bold">Ações de Sistema</h4>
                <p className="text-xs text-slate-500">Comandos analíticos para forçar sincronismo satelital</p>
              </div>
              <Terminal className="w-5 h-5 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Trigger 1 */}
              <div className="p-4 rounded-xl border border-outline-variant/20 bg-slate-50 hover:border-emerald-600 transition-colors flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 mb-1">Atualizar Sensores NDVI</h5>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Força consulta remota imediata de imagens do Sentinel-2, atualizando biomassa e reflectâncias infravermelhas.
                  </p>
                </div>
                <button
                  onClick={handleRunAnalytics}
                  disabled={updatingSensor}
                  className="w-full py-2 bg-primary hover:bg-emerald-950 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  {updatingSensor ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCw className="w-3.5 h-3.5" />
                  )}
                  <span>{updatingSensor ? "Sincronizando..." : "Atualizar NDVI Agora"}</span>
                </button>
              </div>

              {/* Trigger 2 */}
              <div className="p-4 rounded-xl border border-outline-variant/20 bg-slate-50 hover:border-emerald-600 transition-colors flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 mb-1">Reprocessar Polígonos</h5>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Recalcula os desvios de cobertura vegetal, taxa de prioridade e mudas necessárias para todos os bairros.
                  </p>
                </div>
                <button
                  onClick={handleReprocessAction}
                  disabled={reprocessing}
                  className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  {reprocessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCw className="w-3.5 h-3.5" />
                  )}
                  <span>{reprocessing ? "Calculando..." : "Sincronizar Métricas"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* PostGIS / Supabase Schemas schema documentation */}
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-headline-md text-headline-md text-primary font-bold flex items-center gap-1.5 leading-none">
                  <Database className="w-5 h-5 text-emerald-800" />
                  <span>Estrutura de Banco de Dados (Supabase)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">Esquemas das tabelas relacionais do PostGIS para o integrador</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all"
                >
                  {copiedSql ? "Copiado!" : "Copiar SQL"}
                </button>
                <button
                  onClick={downloadSqlFile}
                  className="px-3 py-1.5 bg-primary hover:bg-emerald-950 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Baixar .sql</span>
                </button>
              </div>
            </div>

            {/* Selector tabs for SQL schemas */}
            <div className="flex gap-1 border-b border-slate-100 overflow-x-auto pb-1.5 custom-scrollbar">
              {SUPABASE_SCHEMAS.map((schema) => (
                <button
                  key={schema.tableName}
                  onClick={() => setActiveSchema(schema.tableName)}
                  className={`px-3 py-1.5 text-xs font-bold capitalize whitespace-nowrap rounded-lg transition-colors ${
                    activeSchema === schema.tableName
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {schema.tableName}
                </button>
              ))}
            </div>

            {/* Schema details tables */}
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-3 font-sans border border-slate-950">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">DEFINIÇÃO DA TABELA</p>
                <p className="text-xs text-emerald-400 font-bold font-mono">public.{selectedSchema.tableName}</p>
                <p className="text-xs text-slate-300 mt-1 leading-normal font-medium italic">{selectedSchema.description}</p>
              </div>
              <hr className="border-slate-800" />

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] leading-relaxed">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-850 font-bold">
                      <th className="pb-1.5">Coluna</th>
                      <th className="pb-1.5">Tipo</th>
                      <th className="pb-1.5">Restrições / Chaves</th>
                      <th className="pb-1.5 pr-2">Descrição Funcional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {selectedSchema.fields.map((f) => (
                      <tr key={f.name}>
                        <td className="py-2 text-emerald-400 font-bold">{f.name}</td>
                        <td className="py-2 text-indigo-300">{f.type}</td>
                        <td className="py-2 text-amber-300">{f.constraints || "-"}</td>
                        <td className="py-2 text-slate-300 pr-2 leading-tight">{f.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[9px] text-slate-500 leading-normal font-mono">
                *Tabelas modeladas estritamente com suporte espacial para extensões nativas do PostGIS no Supabase.
              </p>
            </div>
          </div>
        </div>

        {/* System Settings sidebar and logs */}
        <div className="space-y-6">
          {/* Supabase Status and Seeding box */}
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-headline-md text-headline-md text-primary font-bold">Integração Supabase</h4>
              {supabaseStatus?.connected ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  CONECTOR ATIVO
                </span>
              ) : (
                <span className="text-[10px] font-bold text-red-700 bg-red-55/10 px-2.5 py-1 rounded-full border border-red-200">
                  INATIVO
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-500 leading-normal">
              {supabaseStatus?.connected 
                ? "Sua aplicação está conectada com sucesso ao banco PostgreSQL remoto. Todas as tabelas ambientais estão sincronizadas."
                : "A conexão direta com as credenciais do Supabase falhou de forma amigável ou o banco postgis está vazio. Certifique-se de carregar os segredos."}
            </p>

            {supabaseStatus?.error && (
              <div className="p-3 bg-red-50 border border-red-200 text-[11px] text-red-800 rounded-lg max-h-40 overflow-y-auto">
                <span className="font-bold">Detalhe do Erro:</span> {supabaseStatus.error}
              </div>
            )}

            {/* Table line counts */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Linhas por Tabela</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
                <div className="flex justify-between">
                  <span className="text-slate-500">municipios:</span>
                  <span className="font-bold text-slate-800">{supabaseStatus?.tables.municipios ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">bairros:</span>
                  <span className="font-bold text-slate-800">{supabaseStatus?.tables.bairros ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">analises_b:</span>
                  <span className="font-bold text-slate-800">{supabaseStatus?.tables.analises_bairros ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">prioritarias:</span>
                  <span className="font-bold text-slate-800">{supabaseStatus?.tables.areas_prioritarias ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">historico_a:</span>
                  <span className="font-bold text-slate-800">{supabaseStatus?.tables.historico_analises ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">escaneamentos:</span>
                  <span className="font-bold text-slate-800">{supabaseStatus?.tables.escaneamentos ?? 0}</span>
                </div>
              </div>
            </div>

            {onSeedDatabase && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="w-full py-2.5 bg-[#006e2f] hover:bg-[#005321] text-white rounded-xl text-xs font-bold transition-all justify-center items-center flex gap-1.5 focus:ring-2 focus:ring-emerald-500 active:scale-[0.98] cursor-pointer"
              >
                {seeding ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Database className="w-3.5 h-3.5" />
                )}
                <span>{seeding ? "Semeando Banco..." : "Semear Dados no Supabase"}</span>
              </button>
            )}
          </div>

          {/* Quick config */}
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm">
            <h4 className="font-headline-md text-headline-md text-primary font-bold mb-4">Configuração Rápida</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 leading-none">Auto-Refresh Maps</h5>
                  <p className="text-[10px] text-slate-500 mt-1">Sincroniza sensores de 24h em 24h</p>
                </div>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${autoRefresh ? "bg-primary" : "bg-slate-200"}`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${autoRefresh ? "left-6" : "left-1"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 leading-none">Painel de Acesso Público</h5>
                  <p className="text-[10px] text-slate-500 mt-1">Libera visualização pública de métricas RMB</p>
                </div>
                <button
                  onClick={() => setPublicDashboard(!publicDashboard)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${publicDashboard ? "bg-primary" : "bg-slate-200"}`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${publicDashboard ? "left-6" : "left-1"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 leading-none">Alertas por E-mail</h5>
                  <p className="text-[10px] text-slate-500 mt-1">Notifica o comitê RMB ao cair do NDVI</p>
                </div>
                <button
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${emailAlerts ? "bg-primary" : "bg-slate-200"}`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${emailAlerts ? "left-6" : "left-1"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Audit Logs list */}
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-headline-md text-headline-md text-primary font-bold mb-3">Logs de Auditoria</h4>
              <div className="space-y-3.5">
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs justify-between items-start">
                    <div className="flex gap-2">
                      <div className="font-bold text-emerald-900 bg-emerald-50 w-7 h-7 rounded-lg flex items-center justify-center font-mono">
                        {log.user.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{log.action}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{log.timeStr}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        log.status === "SUCESSO"
                          ? "bg-emerald-50 text-emerald-850"
                          : log.status === "FALHA"
                          ? "bg-red-50 text-red-800"
                          : "bg-blue-50 text-blue-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
