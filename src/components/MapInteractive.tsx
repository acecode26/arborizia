import React, { useState, useRef, useEffect } from "react";
import { Bairro } from "../types";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Compass, Edit3, Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { municipiosGeojson } from "../data/municipiosGeojson";

const MUNICIPIOS_MARKERS = [
  { id: "belem", nome: "Belém", coords: { lat: -1.4558, lng: -48.4902 }, zoom: 12 },
  { id: "ananindeua", nome: "Ananindeua", coords: { lat: -1.3656, lng: -48.3722 }, zoom: 13 },
  { id: "marituba", nome: "Marituba", coords: { lat: -1.3600, lng: -48.3417 }, zoom: 13 },
  { id: "benevides", nome: "Benevides", coords: { lat: -1.3614, lng: -48.2447 }, zoom: 13 }
];

/**
 * Decodes EWKB / WKB hex points & polygons into standard GeoJSON coordinates.
 * This handles Little and Big Endian byte orders, SRIDs, and basic geometries.
 */
function parseEWKB(hex: string): any {
  if (typeof hex !== "string") return null;
  const cleanHex = hex.trim().toUpperCase().replace(/^0X/, "");
  if (!/^[0-9A-F]+$/.test(cleanHex)) return null;

  let pos = 0;
  
  function readByte(): number {
    if (pos >= cleanHex.length) return 0;
    const val = parseInt(cleanHex.substring(pos, pos + 2), 16);
    pos += 2;
    return val;
  }
  
  function readUInt32(littleEndian: boolean): number {
    const bytes = [readByte(), readByte(), readByte(), readByte()];
    if (littleEndian) {
      return bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
    } else {
      return (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    }
  }
  
  function readDouble(littleEndian: boolean): number {
    const bytes = [];
    for (let i = 0; i < 8; i++) {
       bytes.push(readByte());
    }
    if (!littleEndian) {
      bytes.reverse();
    }
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    for (let i = 0; i < 8; i++) {
      view.setUint8(i, bytes[i]);
    }
    return view.getFloat64(0, true);
  }

  try {
    const byteOrder = readByte(); // 1 = Little Endian, 0 = Big Endian
    const littleEndian = (byteOrder === 1);
    
    const rawType = readUInt32(littleEndian);
    const hasSRID = !!(rawType & 0x20000000);
    const type = rawType & 0x0FFFFFFF;
    
    if (hasSRID) {
      readUInt32(littleEndian); // Skip SRID
    }
    
    if (type === 1) { // POINT
      const x = readDouble(littleEndian);
      const y = readDouble(littleEndian);
      return { type: "Point", coordinates: [x, y] };
    } else if (type === 2) { // LINESTRING
      const numPoints = readUInt32(littleEndian);
      const coords = [];
      for (let i = 0; i < numPoints; i++) {
        const x = readDouble(littleEndian);
        const y = readDouble(littleEndian);
        coords.push([x, y]);
      }
      return { type: "LineString", coordinates: coords };
    } else if (type === 3) { // POLYGON
      const numRings = readUInt32(littleEndian);
      if (numRings === 0) return null;
      const rings = [];
      for (let r = 0; r < numRings; r++) {
        const numPoints = readUInt32(littleEndian);
        const coords = [];
        for (let p = 0; p < numPoints; p++) {
          const x = readDouble(littleEndian);
          const y = readDouble(littleEndian);
          coords.push([x, y]);
        }
        rings.push(coords);
      }
      return { type: "Polygon", coordinates: rings };
    }
  } catch (error) {
    console.error("Erro decodificando EWKB do PostGIS:", error);
  }
  
  return null;
}

/**
 * Converte dados espaciais PostGIS em objeto GeoJSON válido.
 * Suporta GeoJSON nativo, strings formatadas (WKT), JSON stringificado ou EWKB/WKB Hexadecimal.
 */
function convertPostGISToGeoJSON(geom: any): any {
  if (!geom) return null;

  // 1. Objeto GeoJSON correto
  if (typeof geom === "object") {
    if (geom.type && geom.coordinates) {
      return geom;
    }
    if (geom.geom && typeof geom.geom === "object") {
      return convertPostGISToGeoJSON(geom.geom);
    }
    return null;
  }

  if (typeof geom === "string") {
    const trimmed = geom.trim();
    
    // 2. GeoJSON Stringificado
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return convertPostGISToGeoJSON(parsed);
      } catch (e) {
        // Ignorar erro e tentar próximos formatos
      }
    }

    // 3. WKT (Well-Known Text) Polygon
    if (/polygon/i.test(trimmed)) {
      const isMulti = /multipolygon/i.test(trimmed);
      if (isMulti) {
        const coordinateGroups = trimmed.match(/\(\s*\(([^()]+)\)\s*\)/g);
        if (coordinateGroups) {
          const polys = coordinateGroups.map(grp => {
            const pairs = grp.replace(/[()]/g, "").trim().split(/\s*,\s*/);
            return [
              pairs.map(pair => {
                const parts = pair.trim().split(/\s+/);
                return [Number(parts[0]), Number(parts[1])];
              })
            ];
          });
          return { type: "MultiPolygon", coordinates: polys };
        }
      } else {
        const coordinateGroups = trimmed.match(/\(([^()]+)\)/g);
        if (coordinateGroups) {
          const rings = coordinateGroups.map(grp => {
            const pairs = grp.replace(/[()]/g, "").trim().split(/\s*,\s*/);
            return pairs.map(pair => {
              const parts = pair.trim().split(/\s+/);
              return [Number(parts[0]), Number(parts[1])];
            });
          });
          return { type: "Polygon", coordinates: rings };
        }
      }
    }

    // 4. EWKB/WKB Hex
    if (/^[0-9A-Fa-f]+$/.test(trimmed)) {
      return parseEWKB(trimmed);
    }
  }

  return null;
}

/**
 * Retorna a cor de colorização de acordo com o intervalo ou prioridade da cobertura vegetal.
 */
function getPolygonColor(coberturaPct: number, prioridade?: string): string {
  if (prioridade === "Crítica" || coberturaPct < 15) {
    return "#ef4444"; // Vermelho - Crítica
  } else if (prioridade === "Alta" || coberturaPct < 20) {
    return "#f97316"; // Laranja - Baixa
  } else if (prioridade === "Regular" || coberturaPct < 30) {
    return "#eab308"; // Amarelo - Regular
  } else {
    return "#10b981"; // Verde - Excelente
  }
}

interface MapInteractiveProps {
  onBairroSelect: (bairro: Bairro) => void;
  onMunicipioSelect?: (municipioId: string) => void;
  selectedBairro: Bairro | null;
  activeLayers: {
    coberturaVegetal: boolean;
    areasUrbanizadas: boolean;
    pracas: boolean;
    canteirosCentrais: boolean;
    terrenosVazios: boolean;
    areasPrioritarias: boolean;
    indiceNDVI: boolean;
    arborizacaoRecomendada: boolean;
    historicoAnalises: boolean;
  };
  scanning: boolean;
  scanProgress: number;
  scanRegion: string;
  onDrawComplete?: (simulatedArea: number, estimatedTrees: number, estimatedImpact: number) => void;
  bairros?: Bairro[];
  municipios?: any[];
  selectedMunicipioId?: string;
}

export default function MapInteractive({
  onBairroSelect,
  onMunicipioSelect,
  selectedBairro,
  activeLayers,
  scanning,
  scanProgress,
  scanRegion,
  onDrawComplete,
  bairros,
  municipios,
  selectedMunicipioId: selectedMunicipioIdProp,
}: MapInteractiveProps) {
  // Map parameters
  const [zoom, setZoom] = useState<number>(11.5);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: -1.382, lng: -48.375 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedMunicipioId, setSelectedMunicipioId] = useState<string>("belem");

  // Coordinates HUD display
  const [hudCoords, setHudCoords] = useState<{ lat: number; lng: number }>({ lat: -1.382, lng: -48.375 });
  const [hudZoom, setHudZoom] = useState<number>(11.5);

  // Local drawing simulator
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<L.LatLng[]>([]);

  // Debug stats for Supabase GIS monitoring
  const [debugStats, setDebugStats] = useState<{
    loadedCount: number;
    renderedCount: number;
    emptyGeomList: string[];
    conversionErrors: string[];
  }>({
    loadedCount: 0,
    renderedCount: 0,
    emptyGeomList: [],
    conversionErrors: [],
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const initialFitBoundsRef = useRef<boolean>(false);

  // Sync selectedBairro parent municipality to local state
  useEffect(() => {
    if (selectedBairro) {
      setSelectedMunicipioId(selectedBairro.municipioId);
    }
  }, [selectedBairro]);

  // Sync page-level selectedMunicipioId to local state
  useEffect(() => {
    if (selectedMunicipioIdProp !== undefined) {
      setSelectedMunicipioId(selectedMunicipioIdProp);
    }
  }, [selectedMunicipioIdProp]);

  // Leaflet map initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Build map instance
    const map = L.map(mapContainerRef.current, {
      center: [-1.382, -48.375],
      zoom: 11.5,
      zoomControl: false,
      attributionControl: false,
    });

    // Elegant Light-Colored CartoDB Positron / OSM tiles for beautiful styling
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Track move/zoom updates for HUD display
    const onMove = () => {
      const currentCenter = map.getCenter();
      setHudCoords({ lat: currentCenter.lat, lng: currentCenter.lng });
    };

    const onZoom = () => {
      setHudZoom(map.getZoom());
    };

    map.on("move", onMove);
    map.on("zoomend", onZoom);

    // Initial state trigger
    onMove();
    onZoom();

    return () => {
      map.off("move", onMove);
      map.off("zoomend", onZoom);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync externally triggered camera changes (reset or clicking municipalities)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom]);

  // Dynamic Layer/Marker Updater effect
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Layer group representing all reactive overlays
    const overlaysGroup = L.layerGroup().addTo(map);

    // 1. Render primary polygons for the key municipalities from the database (municipios)
    const activeMunicipios = municipios && municipios.length > 0 ? municipios : [];
    const showMunicipios = selectedMunicipioId === "todos";

    // Debugging info trackers
    const loadedCount = activeMunicipios.length;
    let renderedCount = 0;
    const emptyGeomList: string[] = [];
    const conversionErrors: string[] = [];

    console.log(`[DEPURAÇÃO ARBORIZIA] 1. Quantidade de registros retornados da view municipios_geojson:`, loadedCount);

    if (showMunicipios) {
      // Adjust map zoom/center to fit db municipios polygons the first time they load
      if (activeMunicipios.length > 0 && !initialFitBoundsRef.current) {
        try {
          const tempGeojsonGroup: any[] = [];
          activeMunicipios.forEach((m) => {
            let geomGeoJSON = null;
            if (m.geometry) {
              if (typeof m.geometry === "object") {
                geomGeoJSON = m.geometry;
              } else if (typeof m.geometry === "string") {
                try {
                  geomGeoJSON = JSON.parse(m.geometry);
                } catch (e) {
                  // ignore parsing error for bounds fallback
                }
              }
            }
            if (!geomGeoJSON) {
              // local geojson fallback for bounds
              const fallbackFeature = municipiosGeojson.features.find((f: any) => {
                const nameA = f.properties?.nome?.toLowerCase()?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "") || "";
                const nameB = m.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
                return nameA === nameB || nameA.includes(nameB) || nameB.includes(nameA);
              });
              if (fallbackFeature) {
                geomGeoJSON = fallbackFeature.geometry;
              }
            }
            if (geomGeoJSON) {
              tempGeojsonGroup.push({
                type: "Feature",
                geometry: geomGeoJSON,
                properties: {}
              });
            }
          });

          if (tempGeojsonGroup.length > 0) {
            const geoLayer = L.geoJSON({
              type: "FeatureCollection",
              features: tempGeojsonGroup
            } as any);
            const bounds = geoLayer.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [12, 12] });
              if (map.getZoom() < 11.5) {
                map.setZoom(11.5);
              }
            }
            initialFitBoundsRef.current = true;
          }
        } catch (err) {
          console.error("Erro ao aplicar fitBounds dinâmico:", err);
        }
      }

      activeMunicipios.forEach((m: any) => {
        const mId = m.id;
        const nome = m.nome;

        let geomGeoJSON = null;

        // 1. Try reading the view geometry first (either in object or string format)
        if (m.geometry) {
          try {
            if (typeof m.geometry === "object") {
              geomGeoJSON = m.geometry;
            } else if (typeof m.geometry === "string") {
              geomGeoJSON = JSON.parse(m.geometry);
            }
            if (geomGeoJSON) {
              console.log(`[DEPURAÇÃO ARBORIZIA] 3. Resultado de geometry para "${nome}":`, JSON.stringify(geomGeoJSON));
            }
          } catch (err: any) {
            const fullErrorMsg = `Município "${nome}": Falha ao processar geometry de view. Erro: ${err.message || err}`;
            conversionErrors.push(fullErrorMsg);
            console.error(`[DEPURAÇÃO ARBORIZIA] 6. ERRO COMPLETO DE PROCESSAMENTO DE GEOMETRIA para "${nome}":`, err);
          }
        }

        // 2. Try local fallback if view geometry wasn't present or failed to parse
        if (!geomGeoJSON) {
          const fallbackFeature = municipiosGeojson.features.find((f: any) => {
            const nameA = f.properties?.nome?.toLowerCase()?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "") || "";
            const nameB = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
            return nameA === nameB || nameA.includes(nameB) || nameB.includes(nameA);
          });
          if (fallbackFeature) {
            geomGeoJSON = fallbackFeature.geometry;
            console.log(`[DEPURAÇÃO ARBORIZIA] Utilizou geometria de fallback do GeoJSON local para "${nome}".`);
          }
        }

        // 3. Only if STILL no geometry, we log an actual error
        if (!geomGeoJSON) {
          const errorMsg = `Município "${nome}": nenhuma geometria encontrada (BD vazio e sem fallback local).`;
          emptyGeomList.push(errorMsg);
          console.error(`[DEPURAÇÃO ARBORIZIA] 5. ERRO: Geometria vazia para ${nome}`);
          return;
        }

        renderedCount++;

        const matchObj = bairros?.find((item) => item.id === mId || item.nome.toLowerCase() === nome.toLowerCase());

        // Get stats for coverage
        const coberturaPct = m.coberturaVegetalPct || (matchObj ? matchObj.coberturaPct : 25.0);
        const prioridade = matchObj ? matchObj.prioridade : "Regular";

        const isSelected =
          selectedMunicipioId === mId ||
          (selectedBairro && (selectedBairro.municipioId === mId || selectedBairro.id === mId));

        const fillColor = getPolygonColor(coberturaPct, prioridade);

        // Draw the municipality boundary polygon from GeoJSON!
        const geojsonFeature = {
          type: "Feature",
          properties: {
            nome: nome,
            area_km2: m.areaKm2
          },
          geometry: geomGeoJSON
        };

        const geojsonLayer = L.geoJSON(geojsonFeature as any, {
          style: () => ({
            color: isSelected ? "#0ea5e9" : "#cbd5e1", // destaque no selecionado, contorno leve para os outros
            weight: isSelected ? 5.0 : 1.2,           // borda bem mais forte no selecionado
            opacity: isSelected ? 1.0 : 0.40,
            fillColor: fillColor,
            fillOpacity: isSelected ? 0.20 : 0.08,     // opacidade menor para enxergar o mapa perfeitamente
          })
        });
        geojsonLayer.addTo(overlaysGroup);

        // Mouse interactive enhancements
        geojsonLayer.on({
          click: () => {
            handleMunicipioClick(mId);
          },
          mouseover: (e) => {
            const layer = e.target;
            layer.setStyle({
              weight: isSelected ? 5.5 : 2.5,
              fillOpacity: isSelected ? 0.30 : 0.15,
            });
          },
          mouseout: (e) => {
            const layer = e.target;
            layer.setStyle({
              weight: isSelected ? 5.0 : 1.2,
              fillOpacity: isSelected ? 0.20 : 0.08,
            });
          }
        });

        // Show refined textual name label inside the polygon
        const coordsCoords = MUNICIPIOS_MARKERS.find(x => x.id === mId || x.nome.toLowerCase() === nome.toLowerCase())?.coords || { lat: m.coordenadas?.[0] || -1.4558, lng: m.coordenadas?.[1] || -48.4902 };

        const markerHtml = `
          <div class="relative flex flex-col items-center justify-center cursor-pointer" style="width: 140px; height: 40px; margin-top: -20px; margin-left: -70px;">
            <div class="px-2.5 py-1 bg-slate-950/90 text-white rounded-md border ${
              isSelected
                ? "border-[#0ea5e9] text-[#0ea5e9] scale-105 shadow-lg shadow-sky-950/60"
                : "border-slate-800 text-slate-100 hover:border-slate-400"
            } flex flex-col items-center justify-center transition-all">
              <span class="text-[9px] font-extrabold tracking-wide text-white uppercase">${nome}</span>
              <span class="text-[8px] font-semibold text-emerald-300">Cobertura: ${coberturaPct}%</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: "custom-leaflet-marker",
          iconSize: [140, 40],
          iconAnchor: [70, 20],
        });

        const labelMarker = L.marker([coordsCoords.lat, coordsCoords.lng], { icon: customIcon });
        labelMarker.addTo(overlaysGroup);

        // On click the label, trigger polygon logic
        labelMarker.on("click", () => {
          handleMunicipioClick(mId);
        });
      });
    }

    // 2. Render neighbourhood sub-bairros (either as Polygons if geom exists, or fallback markers)
    const list = bairros || [];
    list.forEach((b) => {
      // Exclude main parent municipalities
      if (b.id === "belem" || b.id === "ananindeua" || b.id === "marituba" || b.id === "benevides") {
        return;
      }

      // ONLY render neighborhoods if a specific municipality is selected AND the neighborhood belongs to it
      if (selectedMunicipioId === "todos") {
        return;
      }

      const bMunIdNorm = b.municipioId?.toLowerCase() || "";
      const selMunIdNorm = selectedMunicipioId?.toLowerCase() || "";
      const isMatch = bMunIdNorm === selMunIdNorm || 
                      (bMunIdNorm.includes("bel") && selMunIdNorm.includes("bel")) ||
                      (bMunIdNorm.includes("anan") && selMunIdNorm.includes("anan")) ||
                      (bMunIdNorm.includes("mari") && selMunIdNorm.includes("mari")) ||
                      (bMunIdNorm.includes("bene") && selMunIdNorm.includes("bene"));

      if (!isMatch) {
        return;
      }

      const isSelected = selectedBairro?.id === b.id;
      const geomGeoJSON = convertPostGISToGeoJSON(b.geom);

      if (geomGeoJSON) {
        // Render beautiful colored GeoJSON polygon!
        const color = getPolygonColor(b.coberturaPct, b.prioridade);

        const geojsonLayer = L.geoJSON(geomGeoJSON, {
          style: () => ({
            color: isSelected ? "#0ea5e9" : "#cbd5e1", // destacar o contorno do polígono (sky-500 if active, light gray standard)
            weight: isSelected ? 4.5 : 1.0,           // borda forte no selecionado
            opacity: isSelected ? 1.0 : 0.35,
            fillColor: color,
            fillOpacity: isSelected ? 0.25 : 0.08,     // opacidade menor para poder ler o mapa perfeitamente
          })
        });

        // Add to layer group
        geojsonLayer.addTo(overlaysGroup);

        // Interactive click, selection and hover highlight animations
        geojsonLayer.on({
          click: () => {
            onBairroSelect(b);
          },
          mouseover: (e) => {
            const layer = e.target;
            layer.setStyle({
              weight: isSelected ? 5.5 : 2.0,
              fillOpacity: isSelected ? 0.35 : 0.15,
            });
          },
          mouseout: (e) => {
            const layer = e.target;
            layer.setStyle({
              weight: isSelected ? 4.5 : 1.0,
              fillOpacity: isSelected ? 0.25 : 0.08,
            });
          }
        });

        // Still show a smaller textual name label inside the polygon so it is clean & legible
        const labelHtml = `
          <div class="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span class="px-1.5 py-0.5 bg-slate-950/85 text-white text-[8px] font-bold tracking-tight rounded border border-slate-700/80 whitespace-nowrap capitalize shadow">
              ${b.nome} (${b.coberturaPct}%)
            </span>
          </div>
        `;

        const labelIcon = L.divIcon({
          html: labelHtml,
          className: "custom-leaflet-marker",
          iconSize: [1, 1],
        });

        L.marker([b.coordenadas.lat, b.coordenadas.lng], { icon: labelIcon }).addTo(overlaysGroup);

      } else {
        // Geom is empty or invalid, fallback to the original beautiful circular markers
        let borderClass = "border-emerald-500 text-emerald-400";
        let bgClass = "bg-emerald-950/95";
        let ringClass = "";

        if (b.prioridade === "Crítica") {
          borderClass = "border-red-500 text-red-400";
          bgClass = "bg-red-950/95";
        } else if (b.prioridade === "Alta") {
          borderClass = "border-orange-500 text-orange-400";
          bgClass = "bg-orange-950/95";
        } else if (b.prioridade === "Regular") {
          borderClass = "border-yellow-500 text-yellow-400";
          bgClass = "bg-yellow-950/95";
        }

        if (isSelected) {
          ringClass = "ring-4 ring-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.6)]";
        }

        const bHtml = `
          <div class="relative flex items-center justify-center transition-all" style="width: 48px; height: 48px; margin-top: -24px; margin-left: -24px;">
            <div class="w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center transition-all ${bgClass} ${borderClass} ${ringClass} shadow-md overflow-hidden">
              <span class="text-[9.5px] font-extrabold tracking-tighter">
                ${b.coberturaPct}%
              </span>
            </div>
            <div class="absolute -bottom-4 px-1.5 py-0.5 bg-slate-900 text-white text-[8px] font-bold tracking-wide rounded border border-slate-700 whitespace-nowrap capitalize shadow">
              ${b.nome}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: bHtml,
          className: "custom-leaflet-marker",
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        const marker = L.marker([b.coordenadas.lat, b.coordenadas.lng], { icon: customIcon }).addTo(overlaysGroup);
        marker.on("click", () => {
          onBairroSelect(b);
        });
      }
    });

    // 3. Highlight hot centers as Heat layers if priority layers is enabled
    if (activeLayers.areasPrioritarias) {
      // Batista Campos Heat Area
      L.circle([-1.4589, -48.4912], {
        color: "#f87171",
        fillColor: "#ef4444",
        fillOpacity: 0.15,
        radius: 350,
        weight: 1.5
      }).addTo(overlaysGroup);

      // Guamá critical heat core
      L.circle([-1.4682, -48.4651], {
        color: "#f87171",
        fillColor: "#dc2626",
        fillOpacity: 0.22,
        radius: 550,
        weight: 1.5
      }).addTo(overlaysGroup);
    }

    // 4. Parks and Squares layer
    if (activeLayers.pracas) {
      const pracas = [
        { coords: [-1.4589, -48.4912], name: "Batista Campos" },
        { coords: [-1.4532, -48.4845], name: "Praça República" }
      ];

      pracas.forEach((p) => {
        const html = `
          <div class="flex items-center gap-1 bg-emerald-950 border border-emerald-400 text-emerald-100 text-[8.5px] font-bold px-2 py-1 rounded shadow whitespace-nowrap">
            <span class="material-symbols-outlined text-[11px] text-emerald-400">forest</span>
            ${p.name}
          </div>
        `;
        const icon = L.divIcon({
          html,
          className: "custom-leaflet-marker",
          iconSize: [110, 24]
        });
        L.marker([p.coords[0], p.coords[1]], { icon }).addTo(overlaysGroup);
      });
    }

    // 5. Idle/Vacant Lots Layers
    if (activeLayers.terrenosVazios) {
      const lotes = [
        { coords: [-1.4480, -48.4720], name: "Lote Ocioso" },
        { coords: [-1.4510, -48.4590], name: "Lote Ocioso" }
      ];

      lotes.forEach((l) => {
        const html = `
          <div class="flex items-center gap-1 bg-amber-950 border border-amber-500 text-amber-300 text-[8.5px] font-bold px-2 py-1 rounded shadow whitespace-nowrap animate-bounce">
            <span class="material-symbols-outlined text-[11px]">location_on</span>
            ${l.name}
          </div>
        `;
        const icon = L.divIcon({
          html,
          className: "custom-leaflet-marker",
          iconSize: [95, 24]
        });
        L.marker([l.coords[0], l.coords[1]], { icon }).addTo(overlaysGroup);
      });
    }

    // 6. Recommended Arborization Layers
    if (activeLayers.arborizacaoRecomendada) {
      const html = `
        <div class="flex items-center gap-1.5 bg-emerald-500 text-slate-950 text-[8.5px] font-extrabold px-2 py-1 rounded-full shadow border border-white whitespace-nowrap animate-pulse">
          <span class="material-symbols-outlined text-[11px]">local_florist</span>
          Plantio Ideal
        </div>
      `;
      const icon = L.divIcon({
        html,
        className: "custom-leaflet-marker",
        iconSize: [90, 24]
      });
      L.marker([-1.4398, -48.4599], { icon }).addTo(overlaysGroup);
    }

    // 4. Mostrar quantos polígonos o Leaflet está tentando renderizar
    console.log(`[DEPURAÇÃO ARBORIZIA] 4. Quantidade de polígonos que o Leaflet está tentando renderizar:`, renderedCount);

    setDebugStats((prev) => {
      // Prevents infinite render loops by returning identical reference if unchanged
      if (
        prev.loadedCount === loadedCount &&
        prev.renderedCount === renderedCount &&
        JSON.stringify(prev.emptyGeomList) === JSON.stringify(emptyGeomList) &&
        JSON.stringify(prev.conversionErrors) === JSON.stringify(conversionErrors)
      ) {
        return prev;
      }
      return {
        loadedCount,
        renderedCount,
        emptyGeomList,
        conversionErrors,
      };
    });

    return () => {
      overlaysGroup.remove();
    };
  }, [selectedMunicipioId, selectedBairro, activeLayers, bairros, municipios]);

  // Leaflet Drawing handler click recorder
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isDrawing) {
      const handleMapClick = (e: L.LeafletMouseEvent) => {
        setDrawnPoints((prev) => [...prev, e.latlng]);
      };
      map.on("click", handleMapClick);
      return () => {
        map.off("click", handleMapClick);
      };
    }
  }, [isDrawing]);

  // Drawing Path Polygon/Polyline/Anchors rendering layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const drawingLayerGroup = L.layerGroup().addTo(map);

    if (drawnPoints.length > 0) {
      const latlngs = drawnPoints.map((pt) => [pt.lat, pt.lng] as [number, number]);

      if (drawnPoints.length >= 3) {
        L.polygon(latlngs, {
          color: "#10b981",
          weight: 3,
          fillColor: "#10b981",
          fillOpacity: 0.25,
        }).addTo(drawingLayerGroup);
      } else {
        L.polyline(latlngs, {
          color: "#10b981",
          weight: 3,
        }).addTo(drawingLayerGroup);
      }

      // Render vertex dots
      drawnPoints.forEach((pt) => {
        const nodeHtml = '<div class="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow"></div>';
        const nodeIcon = L.divIcon({
          html: nodeHtml,
          className: "custom-leaflet-marker",
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
        L.marker([pt.lat, pt.lng], { icon: nodeIcon }).addTo(drawingLayerGroup);
      });
    }

    return () => {
      drawingLayerGroup.remove();
    };
  }, [drawnPoints]);

  // Trigger focus resets and selection math
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 1, 18));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 1, 8));

  const handleResetView = () => {
    setZoom(11);
    setCenter({ lat: -1.4558, lng: -48.4902 });
    setSelectedMunicipioId("todos");
    setDrawnPoints([]);
    setIsDrawing(false);
    onMunicipioSelect?.("todos");
  };

  const handleMunicipioClick = (mId: string) => {
    setSelectedMunicipioId(mId);
    onMunicipioSelect?.(mId);

    const targetMun = MUNICIPIOS_MARKERS.find((m) => m.id === mId);
    if (targetMun) {
      setCenter(targetMun.coords);
      setZoom(targetMun.zoom);
    }

    const list = bairros || [];
    const mainBairro = list.find((b) => b.id === mId || b.nome.toLowerCase() === mId);
    if (mainBairro) {
      onBairroSelect(mainBairro);
      return;
    }

    const munBairros = list.filter((b) => b.municipioId === mId);
    if (munBairros.length > 0) {
      const worstB = munBairros.reduce(
        (acc, curr) => (curr.coberturaPct < acc.coberturaPct ? curr : acc),
        munBairros[0]
      );
      onBairroSelect(worstB);
    }
  };

  const handleToggleDrawing = () => {
    if (isDrawing) {
      // Finish polygon math calculations
      if (drawnPoints.length > 2) {
        const simArea = Math.round(drawnPoints.length * 3650);
        const trees = Math.round(simArea / 40);
        const impact = parseFloat((trees * 0.002).toFixed(2));
        if (onDrawComplete) {
          onDrawComplete(simArea, trees, impact);
        }
      }
      setIsDrawing(false);
    } else {
      setDrawnPoints([]);
      setIsDrawing(true);
    }
  };

  const handleCancelDrawing = () => {
    setDrawnPoints([]);
    setIsDrawing(false);
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-slate-200/50 flex-1 h-[480px] md:h-[620px] bg-slate-100 transition-all ${
        isFullscreen ? "fixed inset-4 z-50 h-[calc(100vh-32px)]" : ""
      }`}
    >
      {/* Stylesheet injector for custom marker resets */}
      <style>{`
        .custom-leaflet-marker {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>

      {/* Leaflet container mount element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Dynamic Coordinates HUD telemetry details */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none font-mono text-[10px] text-slate-700 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-200/50 shadow-md">
        <div className="flex gap-4">
          <span>LAT: {hudCoords.lat.toFixed(5)}° S</span>
          <span>LNG: {hudCoords.lng.toFixed(5)}° RG</span>
          <span>ZOOM: {hudZoom}</span>
        </div>
      </div>

      {/* Database GIS Debugger float HUD */}
      <div className="absolute top-4 left-4 z-20 max-w-[280px] sm:max-w-xs bg-slate-900/90 text-white rounded-xl border border-teal-500/30 p-3 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <h3 className="text-xs font-bold font-mono tracking-wider text-teal-400 uppercase">
            Depurador de Polígonos
          </h3>
        </div>
        
        <div className="space-y-1 font-mono text-[10.5px] text-slate-300">
          <div className="flex justify-between gap-4">
            <span>Municípios carregados:</span>
            <span className="font-bold text-emerald-400">{debugStats.loadedCount}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Polígonos renderizados:</span>
            <span className="font-bold text-sky-400">{debugStats.renderedCount}</span>
          </div>
        </div>

        {/* Geometry Empty Errors list */}
        {debugStats.emptyGeomList.length > 0 && (
          <div className="mt-2.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[9.5px] text-amber-300 space-y-1">
            <span className="font-bold block text-amber-400">⚠️ Erros de Geometria Vazia:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              {debugStats.emptyGeomList.map((err, idx) => (
                <li key={idx} className="leading-tight">{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Geometry conversion errors with traceback */}
        {debugStats.conversionErrors.length > 0 && (
          <div className="mt-2.5 p-2 bg-red-500/15 border border-red-500/25 rounded-lg text-[9.5px] text-red-300 space-y-1">
            <span className="font-bold block text-red-400">🚨 Erros de Conversão GeoJSON:</span>
            <ul className="list-disc pl-4 space-y-0.5 max-h-[100px] overflow-y-auto">
              {debugStats.conversionErrors.map((err, idx) => (
                <li key={idx} className="leading-tight font-mono break-all">{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Map Scanning HUD Loading Overlay with simulated laser */}
      {scanning && (
        <div className="absolute inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px] flex flex-col justify-center items-center p-8">
          <div className="w-full max-w-md bg-slate-900/95 rounded-2xl p-6 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-bounce" />

            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-emerald-400 animate-spin">sync</span>
              <h3 className="font-bold tracking-wide text-white uppercase text-sm">
                ESCANEAMENTO MULTIESPECTRAL
              </h3>
            </div>

            <p className="text-sm text-emerald-100 mb-2 font-medium">
              Analisando cobertura espectral NDVI do Sentinel-2...
            </p>
            <p className="text-xs text-emerald-400 font-mono mb-4 animate-pulse uppercase">
              {scanRegion}
            </p>

            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-emerald-500/30">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-slate-400 font-mono">MAP CLUSTERS SATELLITE</span>
              <span className="text-xs text-emerald-400 font-bold font-mono">{scanProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom controllers dashboard overlay */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
        <div className="flex flex-col bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-md overflow-hidden">
          <button
            title="Aumentar Zoom"
            onClick={handleZoomIn}
            className="p-3 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            title="Diminuir Zoom"
            onClick={handleZoomOut}
            className="p-3 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            title="Redefinir Filtros / Foco"
            onClick={handleResetView}
            className="p-3 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 transition-colors border-t border-slate-150"
          >
            <Compass className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Tree simulation drawing toggle */}
        <div className="flex flex-col bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-md p-1.5 gap-1.5">
          <button
            onClick={handleToggleDrawing}
            className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              isDrawing
                ? "bg-secondary text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Edit3 className="w-4 h-4 shrink-0" />
            <span>{isDrawing ? "Concluir" : "Desenhar Área"}</span>
          </button>
          {isDrawing && (
            <button
              onClick={handleCancelDrawing}
              className="text-[10px] text-red-500 font-extrabold hover:bg-red-50 py-1 rounded text-center transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-3 bg-white/95 hover:bg-slate-50 rounded-xl border border-slate-200 shadow-md text-slate-600 flex items-center justify-center transition-transform hover:scale-103"
          title="Modo Tela Cheia"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating hints HUD when drawing */}
      {isDrawing && (
        <div className="absolute bottom-16 left-4 z-20 bg-slate-900/95 text-white p-3 rounded-lg border border-slate-700 text-xs shadow-xl max-w-xs animate-pulse">
          <p className="font-bold text-emerald-400 mb-1">Simulador de Plantio Ativo</p>
          <p className="text-[10.5px] leading-relaxed text-slate-300">
            Clique em múltiplos pontos no mapa para desenhar um polígono e calcular o potencial de arborização urbana estimado.
          </p>
        </div>
      )}
    </div>
  );
}
