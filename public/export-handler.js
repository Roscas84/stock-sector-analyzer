/**
 * EXPORT-HANDLER.JS - Exportar análisis a CSV y TXT
 * Mejora #6
 */

window.exportToCSV = function(filename = 'analisis.csv') {
    if (!displayedCompanies || displayedCompanies.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    // Encabezados
    const headers = ['Ticker', 'Empresa', 'Precio USD', 'Nivel 1 Score', 'Nivel 2 Score', 'D/E', 'Margen %', 'Crecimiento %', 'PEG', 'Valuación'];
    
    // Datos
    const rows = displayedCompanies.map(c => {
        const peg = getPEGRatio(c);
        const valuation = getValuationStatus(peg);
        return [
            c.ticker,
            c.name,
            c.price.toFixed(2),
            c.level1Score || '-',
            c.level2Score || '-',
            c.debtToEquity.toFixed(2),
            c.netProfitMargin.toFixed(1),
            c.revenueGrowthYoY.toFixed(1),
            peg.toFixed(2),
            valuation
        ];
    });

    // Crear CSV
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => {
            // Escapar comillas en textos
            if (typeof cell === 'string' && cell.includes(',')) {
                return `"${cell}"`;
            }
            return cell;
        }).join(',') + '\n';
    });

    // Descargar
    downloadFile(csv, filename, 'text/csv');
};

window.exportToTXT = function(filename = 'analisis.txt') {
    if (!displayedCompanies || displayedCompanies.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    let txt = `STOCK ANALYZER - INFORME DE ANÁLISIS\n`;
    txt += `Mercado: ${currentMarket}\n`;
    txt += `Fecha: ${new Date().toLocaleString('es-ES')}\n`;
    txt += `Empresas: ${displayedCompanies.length}\n`;
    txt += `\n${'='.repeat(120)}\n\n`;

    displayedCompanies.forEach((c, idx) => {
        const peg = getPEGRatio(c);
        const valuation = getValuationStatus(peg);
        
        txt += `${idx + 1}. ${c.ticker} - ${c.name}\n`;
        txt += `   Precio: $${c.price.toFixed(2)} USD\n`;
        txt += `   Sector: ${c.sector}\n`;
        txt += `   \n`;
        txt += `   NIVEL 1 (Criterios Básicos):\n`;
        txt += `   - Score: ${c.level1Score || '-'}%\n`;
        txt += `   - Deuda/Equity: ${c.debtToEquity.toFixed(2)}\n`;
        txt += `   - Net Profit Margin: ${c.netProfitMargin.toFixed(1)}%\n`;
        txt += `   - Revenue Growth: ${c.revenueGrowthYoY.toFixed(1)}%\n`;
        txt += `   - P/E Ratio: ${c.peRatio.toFixed(1)}\n`;
        txt += `   \n`;
        txt += `   NIVEL 2 (Criterios Avanzados):\n`;
        txt += `   - Score: ${c.level2Score || '-'}%\n`;
        txt += `   - ROE: ${c.roic.toFixed(1)}%\n`;
        txt += `   - Free Cash Flow: $${(c.freeCashFlow / 1e9).toFixed(1)}B\n`;
        txt += `   - Quick Ratio: ${c.quickRatio ? c.quickRatio.toFixed(2) : '-'}\n`;
        txt += `   \n`;
        txt += `   VALUACIÓN:\n`;
        txt += `   - PEG Ratio: ${peg.toFixed(2)}\n`;
        txt += `   - Estado: ${valuation}\n`;
        txt += `\n${'='.repeat(120)}\n\n`;
    });

    downloadFile(txt, filename, 'text/plain');
};

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

window.exportToPDF = function(filename = 'analisis.pdf') {
    if (!displayedCompanies || displayedCompanies.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    // Usar jsPDF desde CDN
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(5, 150, 105);
    doc.text('STOCK SECTOR ANALYZER', 20, yPosition);

    // Info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    yPosition += 8;
    doc.text(`Mercado: ${currentMarket}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Empresas analizadas: ${displayedCompanies.length}`, 20, yPosition);
    yPosition += 12;

    // Tabla
    const tableData = displayedCompanies.slice(0, 50).map(c => {
        const peg = getPEGRatio(c);
        const valuation = getValuationStatus(peg);
        return [
            c.ticker,
            c.name.substring(0, 20),
            `$${c.price.toFixed(0)}`,
            `${c.level1Score || '-'}%`,
            `${c.level2Score || '-'}%`,
            c.debtToEquity.toFixed(1),
            `${c.netProfitMargin.toFixed(0)}%`,
            valuation
        ];
    });

    doc.autoTable({
        head: [['Ticker', 'Empresa', 'Precio', 'Nv1', 'Nv2', 'D/E', 'Margen', 'Estado']],
        body: tableData,
        startY: yPosition,
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        headStyles: {
            fillColor: [5, 150, 105],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [0, 0, 0]
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        didDrawPage: (data) => {
            // Footer
            const pageCount = doc.internal.getPages().length;
            const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Página ${currentPage} de ${pageCount}`,
                pageWidth - 30,
                pageHeight - 10
            );
        }
    });

    // Notas finales
    const finalY = doc.lastAutoTable?.finalY || yPosition + 50;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    if (finalY + 20 < pageHeight) {
        doc.text('Análisis generado por Stock Sector Analyzer', 20, finalY + 15);
    }

    doc.save(filename);
};

window.getExportButtons = function() {
    return `
        <div style="margin: 20px 0; border-top: 1px solid #334155; padding-top: 20px;">
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 10px;">📥 Descargar análisis</p>
            <button onclick="exportToCSV('${currentMarket}-${new Date().toISOString().split('T')[0]}.csv')" style="background: #10b981; margin-right: 10px;">📋 CSV</button>
            <button onclick="exportToTXT('${currentMarket}-${new Date().toISOString().split('T')[0]}.txt')" style="background: #60a5fa; margin-right: 10px;">📄 TXT</button>
            <button onclick="exportToPDF('${currentMarket}-${new Date().toISOString().split('T')[0]}.pdf')" style="background: #f59e0b;">📑 PDF</button>
        </div>
    `;
};
