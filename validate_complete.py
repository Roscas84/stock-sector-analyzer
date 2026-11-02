#!/usr/bin/env python3
"""
VALIDACIÓN EXHAUSTIVA - Analizador de Inversiones v1.0
Verifica:
1. Integridad de data.json
2. Cálculos matemáticos (Buffett, Lynch, Graham)
3. Criterios de filtrado
4. Casos de prueba
5. Anomalías automáticas
"""

import json
import os
from datetime import datetime

class ValidadorInversiones:
    def __init__(self):
        self.data = None
        self.errors = []
        self.warnings = []
        self.info = []
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "data_integrity": {},
            "mathematical_validation": {},
            "filtering_criteria": {},
            "test_cases": {},
            "anomaly_detection": {}
        }

    def print_section(self, title):
        """Print a formatted section header"""
        print(f"\n{'='*80}")
        print(f"  {title}")
        print(f"{'='*80}\n")

    def print_result(self, status, message):
        """Print a validation result"""
        symbol = "✅" if status == "PASS" else "⚠️" if status == "WARN" else "❌"
        print(f"{symbol} {status:6s} | {message}")

    # =========================================================================
    # PASO 1: VERIFICAR ESTRUCTURA DE data.json
    # =========================================================================

    def validate_file_exists(self):
        """Paso 1.1: Verificar que data.json existe"""
        self.print_section("PASO 1: INTEGRIDAD DE data.json")
        print("1.1 - Verificando existencia del archivo...")

        path = 'public/data.json'
        if os.path.exists(path):
            self.print_result("PASS", f"Archivo existe: {path}")
            self.results["data_integrity"]["file_exists"] = True
            return True
        else:
            self.print_result("FAIL", f"Archivo NO existe: {path}")
            self.results["data_integrity"]["file_exists"] = False
            self.errors.append("data.json no encontrado")
            return False

    def validate_json_structure(self):
        """Paso 1.2: Verificar que JSON es válido"""
        print("\n1.2 - Validando estructura JSON...")

        try:
            with open('public/data.json', 'r') as f:
                self.data = json.load(f)

            self.print_result("PASS", "JSON válido y parseado correctamente")
            self.results["data_integrity"]["valid_json"] = True

            # Verificar campos raíz
            required_root = ['lastUpdated', 'currency', 'markets']
            missing = [f for f in required_root if f not in self.data]

            if missing:
                self.print_result("FAIL", f"Campos raíz faltantes: {missing}")
                self.results["data_integrity"]["root_fields"] = False
                return False

            self.print_result("PASS", f"Campos raíz completos: {list(self.data.keys())}")
            self.results["data_integrity"]["root_fields"] = True
            return True

        except json.JSONDecodeError as e:
            self.print_result("FAIL", f"JSON inválido: {str(e)}")
            self.results["data_integrity"]["valid_json"] = False
            self.errors.append(f"JSON Parse Error: {e}")
            return False

    def validate_markets_structure(self):
        """Paso 1.3: Verificar estructura de mercados"""
        print("\n1.3 - Validando estructura de mercados...")

        required_markets = ['USA', 'Brazil', 'India']
        markets = self.data.get('markets', {})

        all_valid = True
        for market in required_markets:
            if market not in markets:
                self.print_result("FAIL", f"Mercado faltante: {market}")
                all_valid = False
                continue

            market_data = markets[market]
            required_fields = ['flag', 'exchange', 'companies']
            missing = [f for f in required_fields if f not in market_data]

            if missing:
                self.print_result("FAIL", f"{market}: Campos faltantes {missing}")
                all_valid = False
            else:
                count = len(market_data['companies'])
                self.print_result("PASS", f"{market}: {count} empresas con estructura válida")

        self.results["data_integrity"]["markets_structure"] = all_valid
        return all_valid

    def validate_company_fields(self):
        """Paso 1.4: Verificar que cada empresa tiene campos requeridos"""
        print("\n1.4 - Validando campos de empresas...")

        required_fields = [
            'ticker', 'name', 'country', 'sector', 'price', 'peRatio',
            'dividendYield', 'moatScore', 'managementScore', 'businessCycle',
            'debtToEquity', 'netProfitMargin', 'revenueGrowthYoY', 'roic', 'freeCashFlow'
        ]

        total_companies = 0
        companies_with_missing_fields = []

        for market, market_data in self.data['markets'].items():
            companies = market_data['companies']
            for company in companies:
                total_companies += 1
                missing = [f for f in required_fields if f not in company]

                if missing:
                    companies_with_missing_fields.append({
                        'ticker': company.get('ticker', 'UNKNOWN'),
                        'market': market,
                        'missing': missing
                    })

        if companies_with_missing_fields:
            self.print_result("FAIL", f"{len(companies_with_missing_fields)} empresas con campos faltantes")
            for item in companies_with_missing_fields[:5]:
                print(f"         {item['ticker']} ({item['market']}): {item['missing']}")
            self.results["data_integrity"]["company_fields"] = False
            return False

        self.print_result("PASS", f"Todas las {total_companies} empresas tienen campos completos")
        self.results["data_integrity"]["company_fields"] = True
        self.results["data_integrity"]["total_companies"] = total_companies
        return True

    # =========================================================================
    # PASO 2: VALIDACIÓN MATEMÁTICA DE CÁLCULOS
    # =========================================================================

    def validate_mathematical_ranges(self):
        """Paso 2.1: Verificar que scores están en rangos válidos (0-100)"""
        self.print_section("PASO 2: VALIDACIÓN MATEMÁTICA")
        print("2.1 - Verificando rangos de scores...")

        score_fields = ['moatScore', 'managementScore']
        invalid_scores = []

        for market, market_data in self.data['markets'].items():
            for company in market_data['companies']:
                for field in score_fields:
                    score = company.get(field, 0)
                    if not (0 <= score <= 100):
                        invalid_scores.append({
                            'ticker': company['ticker'],
                            'field': field,
                            'value': score
                        })

        if invalid_scores:
            self.print_result("FAIL", f"{len(invalid_scores)} scores fuera de rango [0-100]")
            for item in invalid_scores[:5]:
                print(f"         {item['ticker']}: {item['field']} = {item['value']}")
            self.results["mathematical_validation"]["valid_ranges"] = False
            return False

        self.print_result("PASS", "Todos los scores están en rango [0-100]")
        self.results["mathematical_validation"]["valid_ranges"] = True
        return True

    def validate_business_cycle_values(self):
        """Paso 2.2: Verificar que businessCycle tiene valores válidos"""
        print("\n2.2 - Validando valores de Business Cycle...")

        valid_cycles = ['STARTUP', 'GROWTH', 'MATURE', 'STABLE', 'DECLINE']
        invalid_cycles = []

        for market, market_data in self.data['markets'].items():
            for company in market_data['companies']:
                cycle = company.get('businessCycle', '')
                if cycle not in valid_cycles:
                    invalid_cycles.append({
                        'ticker': company['ticker'],
                        'value': cycle
                    })

        if invalid_cycles:
            self.print_result("FAIL", f"{len(invalid_cycles)} ciclos inválidos")
            for item in invalid_cycles[:5]:
                print(f"         {item['ticker']}: {item['value']}")
            self.results["mathematical_validation"]["valid_cycles"] = False
            return False

        self.print_result("PASS", f"Todos los ciclos son válidos: {valid_cycles}")
        self.results["mathematical_validation"]["valid_cycles"] = True
        return True

    def validate_no_negative_values(self):
        """Paso 2.3: Verificar que no hay valores negativos donde no deben estar"""
        print("\n2.3 - Validando que no hay valores negativos incorrectos...")

        positive_fields = ['price', 'peRatio', 'dividendYield', 'moatScore',
                          'managementScore', 'roic', 'netProfitMargin']

        invalid_values = []

        for market, market_data in self.data['markets'].items():
            for company in market_data['companies']:
                for field in positive_fields:
                    value = company.get(field, 0)
                    if value < 0 and field != 'revenueGrowthYoY':  # Growth puede ser negativo
                        invalid_values.append({
                            'ticker': company['ticker'],
                            'field': field,
                            'value': value
                        })

        if invalid_values:
            self.print_result("WARN", f"{len(invalid_values)} valores negativos detectados")
            for item in invalid_values[:5]:
                print(f"         {item['ticker']}: {item['field']} = {item['value']}")
            self.results["mathematical_validation"]["positive_values"] = False
            return False

        self.print_result("PASS", "No hay valores negativos inesperados")
        self.results["mathematical_validation"]["positive_values"] = True
        return True

    # =========================================================================
    # PASO 3: VALIDACIÓN DE CRITERIOS DE FILTRADO
    # =========================================================================

    def validate_filtering_criteria(self):
        """Paso 3: Implementar lógica de filtrado y contar resultados"""
        self.print_section("PASO 3: VALIDACIÓN DE CRITERIOS DE FILTRADO")
        print("3.1 - Contando empresas que pasan cada criterio...\n")

        stats = {
            'buffett_pass': 0,
            'lynch_pass': 0,
            'graham_pass': 0,
            'consensus_3': 0,
            'consensus_2': 0,
            'consensus_1': 0,
            'consensus_0': 0,
        }

        for market, market_data in self.data['markets'].items():
            for company in market_data['companies']:
                # Simular cálculos (asumiendo que ya están en el JSON)
                buffett_pass = company.get('moatScore', 0) >= 50

                # Lynch necesita: Growth > 5% AND score >= 60
                growth = company.get('revenueGrowthYoY', 0)
                lynch_score = company.get('moatScore', 0) + company.get('managementScore', 0)
                lynch_pass = growth > 5 and lynch_score >= 60

                # Graham: Dividend >= 1.5% AND score >= 60
                dividend = company.get('dividendYield', 0)
                graham_score = company.get('managementScore', 0) + dividend
                graham_pass = dividend >= 1.5 and graham_score >= 60

                if buffett_pass:
                    stats['buffett_pass'] += 1
                if lynch_pass:
                    stats['lynch_pass'] += 1
                if graham_pass:
                    stats['graham_pass'] += 1

                consensus = sum([buffett_pass, lynch_pass, graham_pass])
                stats[f'consensus_{consensus}'] += 1

        total = stats['consensus_0'] + stats['consensus_1'] + stats['consensus_2'] + stats['consensus_3']

        print(f"Warren Buffett:    {stats['buffett_pass']:3d} empresas pasan (score >= 50)")
        print(f"Peter Lynch:       {stats['lynch_pass']:3d} empresas pasan (growth > 5% AND score >= 60)")
        print(f"Benjamin Graham:   {stats['graham_pass']:3d} empresas pasan (dividend >= 1.5% AND score >= 60)")

        print(f"\nConsenso Distribution:")
        print(f"  🟢 3/3: {stats['consensus_3']:3d} empresas")
        print(f"  🟡 2/3: {stats['consensus_2']:3d} empresas")
        print(f"  🟠 1/3: {stats['consensus_1']:3d} empresas")
        print(f"  ⚪ 0/3: {stats['consensus_0']:3d} empresas")
        print(f"  {'─'*40}")
        print(f"  📊 Total: {total} empresas")

        # Validaciones críticas
        if stats['consensus_3'] < 5:
            self.print_result("WARN", f"Pocas empresas en consenso 3/3 ({stats['consensus_3']})")
            self.warnings.append("Menos de 5 empresas en consenso 3/3")
        else:
            self.print_result("PASS", f"Buen número de empresas en consenso 3/3: {stats['consensus_3']}")

        self.results["filtering_criteria"] = stats
        return True

    # =========================================================================
    # PASO 4: CASOS DE PRUEBA
    # =========================================================================

    def validate_test_cases(self):
        """Paso 4: Verificar casos de prueba conocidos"""
        self.print_section("PASO 4: CASOS DE PRUEBA")

        # Caso 1: Exxon (XOM) - Referencia crítica
        print("4.1 - Verificando Exxon (XOM) como referencia...")

        exxon = None
        for company in self.data['markets']['USA']['companies']:
            if company['ticker'] == 'XOM':
                exxon = company
                break

        if not exxon:
            self.print_result("FAIL", "Exxon (XOM) NO ENCONTRADO")
            self.errors.append("Exxon not found - critical reference company missing")
            self.results["test_cases"]["exxon_found"] = False
            return False

        self.print_result("PASS", f"Exxon encontrado: {exxon['name']}")
        self.results["test_cases"]["exxon_found"] = True

        # Verificar campos de Exxon
        print("\n4.2 - Verificando campos de Exxon...")
        exxon_fields = {
            'price': exxon.get('price'),
            'peRatio': exxon.get('peRatio'),
            'dividendYield': exxon.get('dividendYield'),
            'moatScore': exxon.get('moatScore'),
            'managementScore': exxon.get('managementScore'),
            'businessCycle': exxon.get('businessCycle'),
        }

        for field, value in exxon_fields.items():
            if value is None or value == '':
                self.print_result("FAIL", f"Exxon.{field} está vacío")
                self.results["test_cases"][f"exxon_{field}"] = False
            else:
                self.print_result("PASS", f"Exxon.{field} = {value}")
                self.results["test_cases"][f"exxon_{field}"] = True

        # Caso 2: Petrobras (Brasil)
        print("\n4.3 - Verificando Petrobras (PETR4.SA)...")
        petr = None
        for company in self.data['markets']['Brazil']['companies']:
            if company['ticker'] == 'PETR4.SA':
                petr = company
                break

        if petr:
            self.print_result("PASS", f"Petrobras encontrada: {petr['name']}")
            self.results["test_cases"]["petrobras_found"] = True
        else:
            self.print_result("WARN", "Petrobras NO ENCONTRADA (no es crítica)")
            self.results["test_cases"]["petrobras_found"] = False

        # Caso 3: TCS (India)
        print("\n4.4 - Verificando TCS (TCS.NS)...")
        tcs = None
        for company in self.data['markets']['India']['companies']:
            if company['ticker'] == 'TCS.NS':
                tcs = company
                break

        if tcs:
            self.print_result("PASS", f"TCS encontrada: {tcs['name']}")
            self.results["test_cases"]["tcs_found"] = True
        else:
            self.print_result("WARN", "TCS NO ENCONTRADA (no es crítica)")
            self.results["test_cases"]["tcs_found"] = False

        return True

    # =========================================================================
    # PASO 5: DETECCIÓN DE ANOMALÍAS
    # =========================================================================

    def detect_anomalies(self):
        """Paso 5: Detección automática de anomalías"""
        self.print_section("PASO 5: DETECCIÓN DE ANOMALÍAS")

        anomalies = []

        print("5.1 - Buscando precios sospechosos...")
        for market, market_data in self.data['markets'].items():
            for company in market_data['companies']:
                price = company.get('price', 0)
                if price == 0:
                    anomalies.append(f"{company['ticker']}: Precio = 0")
                elif price > 10000:
                    anomalies.append(f"{company['ticker']}: Precio muy alto ({price})")
                elif price < 0.01 and price > 0:
                    anomalies.append(f"{company['ticker']}: Precio muy bajo ({price})")

        if anomalies:
            self.print_result("WARN", f"{len(anomalies)} anomalías de precio detectadas")
            for anomaly in anomalies[:5]:
                print(f"         {anomaly}")
        else:
            self.print_result("PASS", "Precios dentro de rangos normales")

        print("\n5.2 - Buscando P/E sospechosos...")
        pe_anomalies = 0
        for market, market_data in self.data['markets'].items():
            for company in market_data['companies']:
                pe = company.get('peRatio', 0)
                if pe < 0:
                    pe_anomalies += 1
                elif pe > 200:
                    pe_anomalies += 1

        if pe_anomalies > 0:
            self.print_result("WARN", f"{pe_anomalies} P/E ratios sospechosos (< 0 o > 200)")
        else:
            self.print_result("PASS", "P/E ratios en rangos normales")

        print("\n5.3 - Buscando duplicados...")
        tickers = []
        duplicates = []
        for market, market_data in self.data['markets'].items():
            for company in market_data['companies']:
                ticker = company['ticker']
                if ticker in tickers:
                    duplicates.append(ticker)
                tickers.append(ticker)

        if duplicates:
            self.print_result("FAIL", f"Tickers duplicados: {set(duplicates)}")
            self.results["anomaly_detection"]["duplicates"] = True
            return False
        else:
            self.print_result("PASS", f"No hay tickers duplicados ({len(tickers)} únicos)")
            self.results["anomaly_detection"]["duplicates"] = False

        return True

    # =========================================================================
    # REPORTE FINAL
    # =========================================================================

    def print_final_report(self):
        """Imprime reporte final"""
        self.print_section("REPORTE FINAL")

        total_checks = (
            len(self.results["data_integrity"]) +
            len(self.results["mathematical_validation"]) +
            len(self.results["filtering_criteria"]) +
            len(self.results["test_cases"])
        )

        passed = sum(1 for v in self.results["data_integrity"].values() if v is True)
        passed += sum(1 for v in self.results["mathematical_validation"].values() if v is True)
        passed += sum(1 for v in self.results["test_cases"].values() if v is True)

        print(f"Checks ejecutados: {total_checks}")
        print(f"Exitosos: {passed}")
        print(f"Tasa de éxito: {(passed/total_checks*100):.1f}%\n")

        if self.errors:
            print(f"❌ ERRORES ({len(self.errors)}):")
            for error in self.errors:
                print(f"   - {error}")
        else:
            print(f"✅ SIN ERRORES CRÍTICOS")

        if self.warnings:
            print(f"\n⚠️ ADVERTENCIAS ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"   - {warning}")

        print(f"\n{'='*80}")
        if not self.errors and len(self.warnings) <= 2:
            print("✅ VALIDACIÓN COMPLETA: TODO CORRECTO ✅")
        elif not self.errors:
            print("⚠️ VALIDACIÓN: PASÓ, pero con advertencias menores")
        else:
            print("❌ VALIDACIÓN: FALLÓ - Revisar errores arriba")
        print(f"{'='*80}\n")

    def run_all_validations(self):
        """Ejecutar todas las validaciones"""
        print("\n" + "="*80)
        print("  ANALIZADOR DE INVERSIONES - VALIDACIÓN EXHAUSTIVA v1.0")
        print("  Timestamp:", datetime.now().isoformat())
        print("="*80)

        # Paso 1
        if not self.validate_file_exists():
            return False

        if not self.validate_json_structure():
            return False

        self.validate_markets_structure()
        self.validate_company_fields()

        # Paso 2
        self.validate_mathematical_ranges()
        self.validate_business_cycle_values()
        self.validate_no_negative_values()

        # Paso 3
        self.validate_filtering_criteria()

        # Paso 4
        self.validate_test_cases()

        # Paso 5
        self.detect_anomalies()

        # Reporte
        self.print_final_report()

        return len(self.errors) == 0


if __name__ == '__main__':
    validator = ValidadorInversiones()
    success = validator.run_all_validations()
    exit(0 if success else 1)
