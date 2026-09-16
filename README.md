# Appoena Educational: Datadog Labs

Repositório oficial de laboratórios práticos dos cursos de Datadog da **Appoena**.

Este projeto reúne ambientes, aplicações de demonstração, arquivos de configuração, consultas e exercícios utilizados durante os treinamentos. O objetivo é permitir que cada aluno reproduza os cenários apresentados nas aulas e pratique os principais recursos da plataforma Datadog em um ambiente controlado.

> Os laboratórios têm finalidade exclusivamente educacional. Não utilize dados, credenciais ou ambientes de produção durante os exercícios.

## Conteúdos disponíveis

Os laboratórios podem abordar diferentes áreas da plataforma, incluindo:

- fundamentos do Datadog;
- Infrastructure Monitoring;
- Container Monitoring e Kubernetes Monitoring;
- Log Management;
- Application Performance Monitoring — APM;
- Real User Monitoring — RUM;
- Synthetic Monitoring e Continuous Testing;
- dashboards e notebooks;
- monitors, alertas e SLOs;
- integrações, APIs e automação;
- OpenTelemetry e correlação entre sinais.

A disponibilidade dos conteúdos depende dos cursos e módulos já publicados pela Appoena.

## Organização do repositório

Abaixo uma estrutura semelhante da organização atual dos arquivos para os laboratórios:

```text
.
├── appoena-educational/
│   ├── nome-do-curso/
│   │   ├── README.md
│   │   ├── lab-01-nome-do-laboratorio/
│   │   │   ├── README.md
│   │   │   ├── docker-compose.yml
│   │   │   ├── .env.example
│   │   │   └── src/
│   │   └── lab-02-nome-do-laboratorio/
|   ├── outro-curso/
│   └── README.md (arquivo atual)
```

Cada laboratório possui um `README.md` próprio com objetivo, arquitetura, pré-requisitos, instruções de execução, validação e limpeza do ambiente.

## Pré-requisitos

Os requisitos podem variar entre os laboratórios. De modo geral, é recomendado ter:

- uma conta Datadog com acesso aos produtos utilizados no exercício;
- Git instalado;
- Docker e Docker Compose;
- acesso a um terminal;
- navegador atualizado;
- permissões para criar API Keys e Application Keys, quando necessário;
- Node.js, Python, Terraform ou Kubernetes apenas nos laboratórios que exigirem essas ferramentas.

Consulte sempre o `README.md` do laboratório antes de iniciar.

## Como começar

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_REPOSITORIO>
```

### 2. Escolha o curso e o laboratório

```bash
cd <nome-do-curso>/<nome-do-laboratorio>
```

### 3. Leia as instruções específicas

Antes de executar qualquer comando, consulte o `README.md` presente na pasta do laboratório.

### 4. Configure as variáveis de ambiente

Quando existir um arquivo `.env.example`, crie uma cópia local:

```bash
cp .env.example .env
```

Em seguida, preencha somente as variáveis exigidas pelo exercício. Exemplo:

```dotenv
DD_API_KEY=sua_api_key
DD_SITE=datadoghq.com
DD_ENV=lab
DD_SERVICE=appoena-lab
DD_VERSION=1.0.0
```

O site da sua organização pode ser diferente de `datadoghq.com`. Utilize o valor correspondente à região da sua conta Datadog.

### 5. Inicie o ambiente

Nos laboratórios baseados em Docker Compose, normalmente será utilizado:

```bash
docker compose up -d --build
```

Os comandos exatos podem variar. Siga sempre as orientações do laboratório selecionado.

### 6. Valide o resultado

Cada laboratório apresenta critérios de conclusão, como:

- aplicação acessível localmente;
- Agent conectado à organização;
- logs chegando ao Log Explorer;
- traces disponíveis no APM Explorer;
- sessões aparecendo no RUM Explorer;
- métricas disponíveis no Metrics Explorer;
- monitor ou dashboard criado corretamente.

### 7. Encerre o laboratório

Ao finalizar, remova os recursos locais e, quando indicado, os recursos criados no Datadog:

```bash
docker compose down --volumes
```

Essa etapa ajuda a evitar consumo desnecessário de recursos e possíveis cobranças.

## Padrão dos laboratórios

Para facilitar o aprendizado, os laboratórios seguem, sempre que possível, a seguinte estrutura:

1. **Objetivo:** resultado esperado ao final do exercício.
2. **Cenário:** contexto técnico ou problema que será simulado.
3. **Arquitetura:** componentes utilizados e comunicação entre eles.
4. **Pré-requisitos:** ferramentas, permissões e produtos necessários.
5. **Preparação:** configuração inicial do ambiente.
6. **Execução:** instruções passo a passo.
7. **Validação:** como confirmar que o laboratório funcionou.
8. **Desafios adicionais:** atividades opcionais para aprofundamento.
9. **Troubleshooting:** problemas conhecidos e possíveis soluções.
10. **Limpeza:** remoção dos recursos criados.

## Segurança e credenciais

Nunca adicione credenciais reais ao repositório.

- Não faça commit de arquivos `.env`.
- Não publique API Keys ou Application Keys.
- Não utilize dados pessoais ou dados reais de clientes.
- Dê preferência a contas e ambientes exclusivos para treinamento.
- Conceda apenas as permissões necessárias para cada exercício.
- Revogue ou rotacione credenciais utilizadas temporariamente.
- Verifique os recursos criados antes e depois de cada laboratório.

Os arquivos `.env.example` devem conter apenas nomes de variáveis e valores fictícios.

## Custos e consumo

Alguns laboratórios podem gerar ingestão de logs, métricas, traces, sessões RUM ou execuções de testes Synthetic. Dependendo do plano utilizado, esses dados podem afetar o consumo da organização.

Antes de executar um laboratório:

- confirme quais produtos serão utilizados;
- verifique os limites da sua conta;
- evite executar geradores de carga por períodos prolongados;
- siga as instruções de limpeza;
- remova monitores, testes, dashboards e métricas de laboratório que não serão mais utilizados.

## Solução de problemas

Se um laboratório não funcionar como esperado, verifique inicialmente:

1. se todas as variáveis obrigatórias foram preenchidas;
2. se a API Key pertence à organização correta;
3. se o valor de `DD_SITE` corresponde à região da conta;
4. se os containers estão em execução;
5. se as portas utilizadas estão disponíveis;
6. se o Agent apresenta erros nos logs;
7. se o intervalo de tempo selecionado no Datadog inclui a execução do teste;
8. se os filtros de ambiente, serviço e versão estão corretos.

Para ambientes Docker, os comandos abaixo podem ajudar na investigação:

```bash
docker compose ps
docker compose logs
docker compose logs <nome-do-servico>
```

Consulte também a seção de troubleshooting existente no laboratório.

## Contribuições

Para manter consistência entre os materiais:

1. crie uma branch para a alteração;
2. siga o padrão de diretórios e documentação deste repositório;
3. não inclua credenciais, dados pessoais ou arquivos desnecessários;
4. valide o laboratório do início ao fim em um ambiente limpo;
5. atualize o `README.md` correspondente;
6. abra um Pull Request descrevendo a mudança e como ela foi testada.

Ao criar um novo laboratório, utilize nomes de diretórios em letras minúsculas, sem espaços e separados por hífen, por exemplo:

```text
lab-03-correlacao-rum-apm
```

## Suporte

Em caso de dúvida sobre o conteúdo ou a execução de um laboratório, utilize o canal de suporte informado no curso correspondente. Ao solicitar ajuda, envie:

- nome do curso e do laboratório;
- etapa em que o problema ocorreu;
- mensagem de erro completa;
- sistema operacional utilizado;
- versões das ferramentas envolvidas;
- logs relevantes, removendo previamente qualquer credencial ou dado sensível.

## Avisos legais

Datadog é uma marca registrada de seus respectivos proprietários. Este repositório é mantido pela Appoena para fins educacionais e não substitui a documentação oficial da plataforma.

O uso dos materiais deve respeitar os termos, políticas e a licença definidos pela Appoena e pelo próprio repositório.

---

Desenvolvido pela **Appoena** para transformar conceitos de observabilidade em experiências práticas de aprendizagem.
