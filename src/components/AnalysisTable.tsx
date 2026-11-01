import { Company } from '../types/index';

interface Props {
  companies: Company[];
  level: 1 | 2;
}

export default function AnalysisTable({ companies, level }: Props) {
  const getSemaforEmoji = (semafor: string) => {
    switch (semafor) {
      case 'green':
        return '🟢';
      case 'yellow':
        return '🟡';
      case 'red':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getSemaforColor = (semafor: string) => {
    switch (semafor) {
      case 'green':
        return 'text-green-400 bg-green-900/20';
      case 'yellow':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'red':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400';
    }
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    const scoreA = level === 1 ? a.level1Score : (b.level2Score || 0);
    const scoreB = level === 1 ? b.level1Score : (b.level2Score || 0);
    return scoreB - scoreA;
  });

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-900">
            <th className="px-4 py-3 text-left font-semibold text-gray-300">
              {getSemaforEmoji('green')} Empresa
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-300">Score</th>
            {level === 1 && (
              <>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 text-xs">
                  D/E
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 text-xs">
                  Margin
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 text-xs">
                  Growth
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 text-xs">
                  Liquidez
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 text-xs">
                  P/E
                </th>
              </>
            )}
            {level === 2 && (
              <>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 text-xs">
                  ROIC
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 text-xs">
                  Op. Margin
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 text-xs">
                  FCF
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-300 text-xs">
                  ST Debt
                </th>
              </>
            )}
            <th className="px-4 py-3 text-center font-semibold text-gray-300">Estado</th>
          </tr>
        </thead>
        <tbody>
          {sortedCompanies.map((company, idx) => (
            <tr
              key={`${company.ticker}_${idx}`}
              className="border-b border-gray-700 hover:bg-gray-700/50 transition"
            >
              <td className="px-4 py-3 font-semibold">
                <div>
                  <div className="text-white">{company.ticker}</div>
                  <div className="text-xs text-gray-400">{company.name}</div>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="font-bold text-lg">
                  {level === 1 ? company.level1Score : company.level2Score || '-'}
                </div>
              </td>
              {level === 1 && (
                <>
                  <td className="px-4 py-3 text-center text-xs">
                    {company.debtToEquity ? company.debtToEquity.toFixed(2) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {company.netProfitMargin
                      ? company.netProfitMargin.toFixed(1) + '%'
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {company.revenueGrowthYoY
                      ? company.revenueGrowthYoY.toFixed(1) + '%'
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {company.currentRatio ? company.currentRatio.toFixed(2) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {company.peRatio ? company.peRatio.toFixed(1) : '-'}
                  </td>
                </>
              )}
              {level === 2 && (
                <>
                  <td className="px-4 py-3 text-center text-xs">
                    {company.roic ? company.roic.toFixed(1) + '%' : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {company.operatingMarginTrend || '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {company.freeCashFlow
                      ? (company.freeCashFlow / 1e9).toFixed(1) + 'B'
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {company.shortTermDebtRatio
                      ? company.shortTermDebtRatio.toFixed(1) + '%'
                      : '-'}
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-center">
                <span className={`px-3 py-1 rounded-full font-semibold ${getSemaforColor(company.semafor)}`}>
                  {getSemaforEmoji(company.semafor)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
