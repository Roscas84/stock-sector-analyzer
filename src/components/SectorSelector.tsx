interface Props {
  sectors: string[];
  loading: boolean;
  onSelectSector: (sector: string) => void;
}

export default function SectorSelector({ sectors, loading, onSelectSector }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Selecciona un sector para analizar</h2>
        <p className="text-gray-400 mb-6">
          El sistema analizará todas las empresas del sector y aplicará los criterios de filtrado.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sectors.map((sector) => (
            <button
              key={sector}
              onClick={() => onSelectSector(sector)}
              disabled={loading}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 rounded-lg font-semibold transition"
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-green-500">
          <h3 className="font-semibold text-green-400 mb-2">🟢 Nivel 1: Básico</h3>
          <p className="text-sm text-gray-400">
            5 criterios que filtran el 80% del ruido: Deuda, Rentabilidad, Crecimiento, Liquidez, Valuación
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-yellow-500">
          <h3 className="font-semibold text-yellow-400 mb-2">✨ Nivel 2: Refinado</h3>
          <p className="text-sm text-gray-400">
            4 refinamientos adicionales: ROIC, Margen, FCF, Deuda corto plazo
          </p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="font-semibold mb-3">📊 Cómo funciona</h3>
        <ol className="space-y-2 text-sm text-gray-400">
          <li>1. Selecciona un sector</li>
          <li>2. El sistema cruza datos de ~50-200 empresas del sector</li>
          <li>3. Aplica 5 criterios básicos (Nivel 1)</li>
          <li>4. Muestra tabla con semaforización (🟢🟡🔴)</li>
          <li>5. Clica "Refinar" para aplicar 4 criterios adicionales (Nivel 2)</li>
          <li>6. Selecciona una empresa para análisis profundo (Nivel 3)</li>
        </ol>
      </div>
    </div>
  );
}
