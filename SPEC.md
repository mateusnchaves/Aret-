# Areté — Especificação

> *Areté* (ἀρετή): a excelência alcançada pela prática constante.

App fitness pessoal (PWA) para acompanhar **progressão de carga**, **cardio** e **alimentação**. Projeto pessoal e de portfólio no GitHub.

---

## 1. Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite + TypeScript |
| PWA | vite-plugin-pwa (instalável, cache offline de leitura) |
| UI | Tailwind CSS + shadcn/ui |
| Dados no cliente | TanStack Query |
| Gráficos | Recharts |
| Navegação | React Router |
| Backend | Supabase (Postgres, RLS, Auth, Edge Functions) |
| Deploy | Vercel |
| Testes | Vitest (regras de cálculo) |
| CI | GitHub Actions: lint, typecheck, testes |

## 2. Princípios gerais

- **Cadastro aberto**, login com **Google** ou **e-mail/senha** (Supabase Auth).
- Dados isolados por usuário via **RLS**.
- **Online-only** para gravar; o PWA mantém em cache telas e últimos dados para **consulta** sem sinal.
- Interface em **PT-BR**; código, nomes e commits em inglês; README bilíngue (PT/EN).
- Unidade de carga: **kg** com decimais (ex.: 1,25 / 2,5). Sem libras.
- Semana começa na **segunda-feira** (fuso local).

## 3. Perfil e onboarding

- Onboarding **obrigatório** após o primeiro login (3–4 telas): peso, altura, data de nascimento, sexo, nível de atividade, objetivo (cutting / manutenção / bulking). Ao final mostra a meta calculada.
- Cardio e Alimentação ficam bloqueados até o onboarding ser concluído.
- **Histórico de peso** (registros com data); os cálculos usam o mais recente; gráfico de evolução.
- Tudo editável depois no Perfil.
- Perfil também contém: unidade da meta de cardio, limite de estagnação, refeições do dia, **Exportar meus dados (JSON)** e **Excluir minha conta** (apaga tudo).

## 4. Navegação

Barra inferior: **Início · Treino · Cardio · Alimentação · Perfil**.

**Início** (painel do dia): próximo treino sugerido, alertas de estagnação, progresso semanal de cardio, kcal/macros de hoje.

---

## 5. Fase 1: Treino

### Modelo
- **Fichas** nomeadas e ordenadas (ex.: "Treino A – Peito/Tríceps").
- Cada ficha tem uma lista **ordenada** de exercícios, cada um com **séries×reps** alvo e **carga atual**.
- **Exercícios**: catálogo do usuário, criado a partir de uma lista inicial de ~50 exercícios comuns em PT-BR (nome + grupo muscular). O usuário pode criar os seus.
- **Histórico de carga global por exercício**: o mesmo exercício em fichas diferentes compartilha o histórico. Para treinos pesado/leve, cadastrar exercícios distintos.
- Fichas antigas são **arquivadas** (somem da lista, mantêm o histórico), não apagadas.

### Registro
- O usuário **não** registra séries nem sessões detalhadas.
- Só cria um registro quando **muda a carga ou o esquema séries×reps**. Cada registro guarda: data, carga, séries, reps.
- Qualquer mudança (carga **ou** reps/séries) conta como progressão e zera o contador.
- **Check-in** de um toque: "✅ Fiz o Treino A hoje" (registra a frequência).

### Regras
- **Próximo treino**: sequência das fichas após o último check-in (A→B→C→A), com troca manual.
- **"Parado há"**: dias **e** número de check-ins de fichas que contêm o exercício desde a última mudança.
- **Alerta de estagnação**: badge depois de **6 treinos** sem evoluir (configurável); sem check-ins, usa 4 semanas.

### Telas
- Lista de exercícios por ficha: carga atual, "há X dias / Y treinos", seta de tendência.
- Detalhe do exercício: gráfico de carga × tempo (reps no detalhe), histórico editável.

---

## 6. Fase 2: Cardio

- Registro: **tipo** (esteira, bike, elíptico, escada, corrida, natação, outro), **duração** (min), **intensidade** (leve / moderada / intensa), **distância** (opcional), data.
- **Calorias** = MET(tipo, intensidade) × peso atual (kg) × horas. Override manual permitido.
- **Meta semanal** em minutos ou kcal (escolha no perfil; padrão **150 min**).
- Visão **hoje / semana** com barra ou anel de progresso.
- O cardio **não** soma na meta de calorias da alimentação (opção futura no perfil, desligada por padrão).

---

## 7. Fase 3: Alimentação

### Meta
- **TMB**: Mifflin-St Jeor (peso, altura, idade, sexo) × fator de atividade = gasto diário.
- Objetivo: cutting **−20%**, manutenção, bulking **+10%**.
- Macros: proteína **2 g/kg**, gordura **0,8 g/kg**, carboidrato com o restante.
- **Override manual** de kcal e de cada macro (ex.: valores da nutricionista).

### Base de alimentos
- **TACO** (Tabela Brasileira de Composição de Alimentos, Unicamp), carregada via seed no Supabase.
- **Alimentos personalizados** do usuário (valores do rótulo).
- Quantidade em **gramas** + **medidas caseiras** por alimento (unidade, colher, fatia, concha), com conversão para gramas. Comuns pré-cadastradas; o usuário pode criar as suas.

### Dietas modelo
- Várias dietas salvas (ex.: dia de treino / descanso, cutting / bulking), **uma ativa**.
- Montadas no app: refeições → alimentos + quantidades.

### Diário
- Refeições **configuráveis** (padrão: Café, Lanche da manhã, Almoço, Lanche da tarde, Jantar, Ceia), compartilhadas entre a dieta e o diário.
- **"✅ Comi o Almoço da dieta"** lança uma **cópia** dos itens no dia, editável só naquele dia; a dieta modelo não muda.
- **Lançamento livre**: busca → alimento → quantidade, na refeição correspondente.
- Atalhos: **recentes**, **favoritos**, **combos salvos** (ex.: "Meu pré-treino").
- Tela do dia: anéis ou barras de kcal, proteína, carbo, gordura (consumido / meta / restante); refeições com subtotal e itens expansíveis; navegação para dias anteriores; ✓ quando dentro de **±10%** da meta.

---

## 8. Fase 4: IA (Gemini, tier gratuito)

- **Texto livre**: "2 ovos mexidos, 1 pão francês e café com leite" → itens, quantidades estimadas e cruzamento com a TACO → revisão do usuário → salvar.
- **Importar dieta** por texto ou PDF → dieta modelo para revisar.
- Chamadas apenas via **Supabase Edge Function** (chave como segredo no servidor, nunca no frontend).
- **Limite diário por usuário** (ex.: 20 chamadas).
- Aviso de privacidade: o texto é processado pelo Google (no tier gratuito pode ser usado para treinar modelos).

---

## 9. Identidade visual

- **Direção**: grego clássico reinterpretado (cerâmica de figuras negras).
- **Paleta**:
  - Fundo obsidiana quente `#141210`, superfícies um pouco mais claras.
  - Destaque **terracota** `#C8643B` (botões, anéis, gráficos).
  - **Bronze / ouro velho** apenas em conquistas (PR, meta semanal).
  - Texto off-white "mármore".
  - Macros em três tons terrosos distintos e legíveis.
- **Tipografia**: **Fraunces** (display e números, algarismos tabulares) + **Inter** (interface).
- **Elementos**: logo Α (alfa) estilizado ou louros minimalistas; meandro grego fino em divisores e header; **coroa de louros** ao bater PR ou meta. Telas do dia a dia limpas.
- **Tom**: navegação e botões em PT-BR claro; sabor grego só em estados vazios e conquistas (*"Areté se constrói um treino por vez."*).
- **Tema**: escuro por padrão; cores em **tokens** desde o início; tema claro "mármore" numa fase posterior.
- **Movimento**: animações curtas e sóbrias (anéis enchendo, louros no PR); vibração ao salvar (só Android). Sem confete.
- **Mockup** de Início, Progressão de exercício e Dia da alimentação, aprovado **antes** da fase 1.

## 10. Repositório

- Migrations do Supabase versionadas (Supabase CLI); schema e seed da TACO reproduzíveis.
- Vitest nas regras: TMB, macros, MET, contadores de estagnação e próximo treino.
- GitHub Actions: lint + typecheck + testes em todo push.
- **Conventional commits**, **sem coautoria do Claude**.
- Uma tag de release por fase.
- README bilíngue com screenshots, GIF, link da Vercel e instruções de setup local.

## 11. Backlog (fora do escopo atual)

Medidas corporais · tema claro · código de barras (Open Food Facts) · troca automática de dieta por dia de treino · água · sono · fotos de progresso · smartwatch / Google Fit · notificações push · social.
