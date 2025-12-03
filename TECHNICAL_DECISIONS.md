# Documentação Técnica - FleetLink

## Stack Tecnológica

| Tecnologia | Motivo da Escolha |
| **Vite** | Build tool moderna e extremamente rápida, melhorando a experiência de desenvolvimento (HMR instantâneo). |
| **React Hook Form + Yup** | Controle de formulários performático (uncontrolled components) e validação de schema declarativa. |
| **Shadcn UI (Radix + Tailwind)** | Acessibilidade garantida (Radix) com estilização total via Tailwind. O código é nosso, não uma "caixa preta". |
| **Turf.js** | Biblioteca para cálculos geográficos complexos no frontend. |

## Arquitetura do Projeto

Optei por uma arquitetura baseada em **Features** (`src/features/`), em vez da separação tradicional por tipos (`components/`, `hooks/`, `pages/`).

*   **`src/features/`**: Cada módulo de negócio (Auth, Trucks, Drivers, Loads) é autocontido, possuindo seus próprios componentes, hooks e serviços. Isso facilita a manutenção e escalabilidade.
*   **`src/components/ui/`**: Componentes visuais genéricos e reutilizáveis (Design System), desacoplados da lógica de negócio.
*   **`src/lib/`**: Configurações de infraestrutura (Firebase, utils).
*   **`src/types/`**: Definições de tipos compartilhados (Domain Models).

Essa estrutura evita o "spaghetti code" e deixa claro onde cada responsabilidade reside.

## Decisões de Design e Regras de Negócio

### 1. Integridade de Dados e Transações (Firestore)
Como o Firestore é um banco NoSQL sem chaves estrangeiras nativas, a integridade referencial foi garantida via **Transações**.
*   **Problema:** Se atualizássemos o motorista e o caminhão em chamadas separadas e a internet caísse no meio, teríamos inconsistência (ex: motorista vinculado a um caminhão que continua "livre").
*   **Solução:** Todas as operações de vínculo (ex: `updateDriver`) ocorrem dentro de uma transação atômica. O Firestore garante que ou tudo é salvo, ou nada é salvo. Além disso, a transação protege contra condições de corrida (concorrência) se dois usuários tentarem editar o mesmo registro simultaneamente.

### 2. Fonte Única da Verdade (Single Source of Truth)
Para simplificar a lógica de vínculos, adotei a regra de que **"A relação Motorista-Caminhão é gerenciada pelo Motorista"**.
*   Só é possível vincular/desvincular caminhões através da tela de Motoristas.
*   Isso evita duplicidade de lógica e conflitos que poderiam surgir se permitíssemos a edição pelos dois lados (Drivers e Trucks).

### 3. Validações de Negócio
Implementei travas de segurança para manter a consistência da frota:
*   **Capacidade:** O sistema impede vincular uma carga a um caminhão que não suporta o peso.
*   **Bloqueio de Edição em Rota:** Não é permitido trocar o caminhão de um motorista se ele estiver com uma carga "Em Rota" (`in-route`). Isso evita que o histórico da viagem fique inconsistente.
*   **Liberação Pós-Entrega:** Assim que a carga é marcada como "Entregue", o motorista e o caminhão ficam livres para novos vínculos, mantendo o histórico da carga original intacto.
*   **Não alteração de cargas Pós-Entrega:**  Não é permitido alterar uma carga que já foi entregue. E caso o motorista ou caminhão tenha sido alterado, em Loads, permanece o histórico original.
*   **Não permite alterar o status de uma carga para "In Route" se o caminhão estiver em Manutenção:**  Isso evita inconsistência de dados e risco de segurança. Por exemplo: se o caminhão está com problema nos freios, não faz sentido deixar ele rodar com uma carga.
*   **Permitir remover o vinculo de um motorista com um caminhão mesmo que eles estejam com uma carga (PLANEJADA OU ENTREGUE):**  Deixa livre o motorista e o caminhão para novos vínculos, porém na tela de Loads, o analista irá ver que a carga não possui mais um caminhão vinculado. No formulário de loads, o campo de Truck (With Driver) fica vazio e ficando vazio, não permite salvar a edição da carga.

### 4. Atualizações em Tempo Real (Real-time)
A combinação de **Firestore `onSnapshot`** com **React Query** foi a estratégia escolhida para garantir que o Dashboard esteja sempre atualizado.
*  Utilizei um socket persistente para receber as atualizações em tempo real.
*   Quando o banco muda, o React Query recebe os novos dados instantaneamente via `queryClient.setQueryData`.
*   Isso elimina a necessidade do usuário recarregar a página para ver novos status de cargas.

## Otimizações de Performance

### Lazy Loading (Code Splitting)
Bibliotecas pesadas não devem bloquear o carregamento inicial.
*   **Mapbox:** O componente de mapa (`LoadMapModal`) é carregado via `React.lazy`. O usuário só baixa o código do mapa se clicar para ver os detalhes (na tela de Dashboard - tabela de Recent Loads, ou pelo ícone de mapa na tela de Loads).

### Memoização
*   **Rotas:** O cálculo de rotas é cacheado localmente. Se o usuário simular uma rota "SP -> RJ", mudar para "MG" e voltar para "SP -> RJ", o resultado é instantâneo, economizando chamadas de API.

### Debounce em Buscas
*   **Autocomplete:** Utilizei um hook customizado `useDebounce` no componente de busca de endereços.
*   **Benefício:** Evita que uma requisição seja feita a cada tecla digitada pelo usuário. O sistema aguarda o usuário parar de digitar por alguns milissegundos antes de chamar a API do Mapbox, economizando quota e reduzindo tráfego de rede.

## Trade-offs e Limitações

1.  **Shadcn UI (Componentes Copiáveis) vs Libs de Componentes (MUI/Chakra)**:
    *   *Decisão:* Adotei o padrão do **Shadcn UI**, onde os componentes (baseados em Radix UI) são copiados para o projeto em vez de instalados como dependência.
    *   *Motivo:* Isso garante **posse total do código** (Ownership). Se precisarmos mudar o comportamento de um Modal, alteramos o código dele diretamente (`src/components/ui/dialog.tsx`), sem depender de APIs restritas de bibliotecas de terceiros ou "brigar" com estilos globais.

2.  **Simulação de Rotas**:
    *   *Decisão:* A animação do caminhão é uma interpolação visual no frontend.
    *   *Trade-off:* Serve para demonstração e UX, mas não reflete dados de telemetria real (GPS).
    *   *Limitação:* A simulação de rotas não reflete dados de telemetria real (GPS).
    * *Cálculo de rotas*: O cálculo de rotas é feito via API do Mapbox.
    * Utilizado o turf para calcular a distância entre dois pontos e a duração da rota.

3.  **Testes**:
    *   *Decisão:* Foco em testes unitários de componentes críticos (`LoadForm`).
    *   *Trade-off:* Testes E2E não foram implementados devido ao escopo de tempo.

## Trabalhos Futuros

Para evoluir o projeto para um cenário de produção em larga escala, os seguintes pontos seriam priorizados:

1.  **UX/UI:**
    *   Adicionar ordenação e filtros avançados nas tabelas (ex: filtrar motoristas sem caminhão).
    *   Máscaras de input para Telefone, CNH e Placa.

2.  **Backend e Segurança:**
    *   **Isolamento de Dados (Multi-tenancy):** Implementar regras de segurança no Firestore para que cada usuário veja apenas os dados da sua própria empresa/frota.
    *   **Upload:** Limitar o tamanho de arquivos no Storage.
    *   **Auditoria:** Salvar o ID do usuário que criou/editou cada registro (`createdBy`).

3.  **Escalabilidade:**
    *   **Paginação:** Implementar paginação no nível do banco de dados (cursores do Firestore) para suportar milhares de registros sem travar o navegador.
    *   **Desnormalização:** Caso quisesse mostrar se um motorista ou caminhão tem uma carga ativa na tabela deles,  daria para armazenar flags como `hasActiveLoad` diretamente no documento do motorista/caminhão para evitar leituras excessivas em tempo de execução.

4. **Segurança em Produção:**
    *  Em produção, as regras de negócio críticas (como "não pode editar carga entregue") devem ser replicadas nas Security Rules do Firestore. O Frontend é apenas a primeira barreira.