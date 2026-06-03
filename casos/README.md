# Casos de teste da calculadora (JSON)

Preenche **casos reais** em JSON — o que o contribuinte mete (`input`) e o que a
nota de liquidação da AT mostra (`esperado`) — e confirma que o motor bate certo,
**sem mexer na UI**. Cada caso é validado de duas formas:

- **`npm run casos`** — corre todos os casos e imprime uma *tabela de
  reconciliação* por caso (campo / esperado / calculado / Δ / ✓✗). Ideal para
  meter a nota da AT lado a lado com o cálculo.
- **`npm test`** — os mesmos ficheiros entram na suite Vitest (regressão em CI).

```bash
npm run casos                      # corre tudo em casos/*.json
npm run casos -- casos/cobertura.json  # só um ficheiro
npm run casos -- /caminho/outra-pasta  # uma pasta inteira
```

O comando sai com código `1` se algum caso falhar.

Ficheiros nesta pasta:

- **`cobertura.json`** (versionado) — varre as features do motor (tributação conjunta, reembolso, coleta zero, cat. F a 15% / retenção / englobamento, cat. B+F, taxa média, anos 2024 e 2025). Números sintéticos, sem dados pessoais.
- **`exemplos.json`** (local, **ignorado** pelo Git) — casos reais a partir de notas de liquidação da AT. Como contém valores reais de contribuintes, **não é versionado** (ver `.gitignore`); fica só na tua máquina. Cria-o tu com as tuas notas.

Cria mais ficheiros `*.json` à vontade — todos são apanhados. Para casos com dados reais, mantém-nos fora do repositório (acrescenta ao `.gitignore`).

## Formato

Um ficheiro é um array de casos **ou** um objeto `{ "casos": [...] }`. Com
`"$schema": "./casos.schema.json"` no topo, o editor dá autocomplete e validação.

```jsonc
{
  "$schema": "./casos.schema.json",
  "casos": [
    {
      "nome": "Nota AT 2024 — só salário",      // rótulo no relatório
      "ano": 2025,                                // ano dos rendimentos (2024/2025/2026)
      "fonte": "Nota de liquidação nº …",        // opcional, proveniência
      "notas": "…",                               // opcional
      "tolerancia": 0.01,                          // opcional, € (default 0.01)
      "input": { "rendimentoBruto": 14381.99 },   // ver campos abaixo
      "esperado": {                                // caminho-no-resultado → valor
        "abatimentoMinimoExistencia": 641.34,
        "abatimentoMinimoExistenciaDetalhe.alinea": "c"
      }
    }
  ]
}
```

**Comparação:** números batem dentro de `tolerancia` (default 1 cêntimo);
strings e booleanos têm de ser exatos. Em `esperado` só pões os campos que te
interessam — não é preciso listar o resultado todo.

## Campos do `input`

`rendimentoBruto` é obrigatório (mete `0` se usares os campos por categoria).
Todos os outros são opcionais.

| Campo | Significado |
| --- | --- |
| `rendimentoBruto` | Bruto cat. A/H total (ignorado se usares os campos por categoria). |
| `rendimentoTrabalho` / `contribuicoesTrabalho` | Bruto cat. A + contribuições (dedução por categoria). |
| `rendimentoPensoes` | Bruto cat. H (pensões). |
| `rendasBrutas` / `despesasCatF` | Rendas cat. F + despesas `{ imi, condominio, conservacao }`. |
| `duracaoCatF` | `padrao` (25%) · `duracao5a10` (15%) · `duracao10a20` (10%) · `duracao20mais` (5%). |
| `retencaoCatF` · `englobarCatF` | Retenção sobre rendas · optar pelo englobamento (art. 22.º). |
| `imputacaoCatB` · `retencaoCatB` · `pagamentosContaCatB` | Anexo D (transparência fiscal, art. 20.º). |
| `deducaoEspecifica` | Override da dedução específica (só no caminho de rendimento único). |
| `deducoesColeta` · `beneficioMunicipalPct` · `retencaoFonte` | Deduções à coleta · % município (0–0.05) · retenção na fonte. |
| `quocienteFamiliar` | `1` individual · `2` conjunta. |

## Caminhos úteis para o `esperado`

Qualquer campo do resultado é acessível por dot-path. Os mais comuns:

| Caminho | Linha da nota |
| --- | --- |
| `rendimentoBruto` | Rendimento bruto (linha 01). |
| `deducaoEspecifica` | Dedução específica. |
| `abatimentoMinimoExistencia` | Abatimento mínimo de existência (linha 04). |
| `abatimentoMinimoExistenciaDetalhe.alinea` | Que alínea do art. 70.º disparou (`a`/`b`/`c`). |
| `rendimentoColetavel` | Rendimento coletável (linha 05). |
| `coleta.escalao.numero` | Nº do escalão atingido. |
| `coletaTotal` | Coleta total. |
| `deducoesColeta` · `beneficioMunicipal` · `coletaLiquida` | Deduções à coleta · benefício município · coleta líquida. |
| `catF.coletaAutonoma` · `catF.taxa` · `catF.englobada` | Sub-resultado cat. F. |
| `catB.imputacao` | Sub-resultado cat. B (Anexo D). |
| `impostoTotal` · `pagamentosConta` · `retencaoFonte` | Imposto total · pagamentos por conta (linha 23) · retenções (linha 24). |
| `impostoApurado` | Imposto apurado (linha 25) — **negativo = reembolso**. |
| `taxaMediaEfetiva` | Taxa média efetiva (0–1). |

> O contrato completo está em [`LiquidacaoInput` / `LiquidacaoResult`](../src/engine/liquidacao.ts).

## Como adicionar um caso real

1. Tira os valores de uma nota de liquidação da AT.
2. Acrescenta um objeto a `exemplos.json` (ou cria um novo `*.json` nesta pasta).
3. `npm run casos` — vê a tabela; ajusta até dar tudo ✓.
4. Fica automaticamente coberto por `npm test`.
