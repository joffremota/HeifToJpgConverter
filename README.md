# HEIF to JPG Converter

Conversor web open source para transformar imagens `.heic` e `.heif` em JPG no
proprio navegador.

## Acesso rapido

- App publicado no GitHub Pages:
  `https://joffremota.github.io/HeifToJpgConverter/`
- Repositorio:
  `https://github.com/joffremota/HeifToJpgConverter`

## Objetivo

O projeto substitui a versao antiga em Windows Forms por uma aplicacao web
estatica. A conversao acontece localmente no navegador, sem backend e sem envio
das imagens para um servidor.

## Funcionalidades atuais

- selecao de multiplos arquivos `.heic` e `.heif`
- suporte a arrastar e soltar arquivos
- ajuste de qualidade do JPG
- preview do resultado convertido
- download individual ou em lote dos JPGs gerados
- publicacao automatica no GitHub Pages

## Como usar no navegador

1. Acesse `https://joffremota.github.io/HeifToJpgConverter/`
2. Selecione ou arraste arquivos `.heic` ou `.heif`
3. Ajuste a qualidade do JPG se necessario
4. Clique em `Converter pendentes`
5. Baixe os arquivos convertidos

## Desenvolvimento local

### Requisitos

- Node.js 20+
- npm 10+

### Rodar em modo de desenvolvimento

```bash
npm install
npm run dev
```

### Gerar build de producao

```bash
npm run build
```

### Executar testes

```bash
npm run test
```

## Publicacao

O projeto inclui workflow em `.github/workflows/deploy.yml` para publicar no
GitHub Pages via GitHub Actions.

Configuracao esperada no GitHub:

- `Settings > Pages`
- `Source: GitHub Actions`

Cada push na branch `main` deve gerar um novo deploy.

## Licenca

Este projeto esta licenciado conforme o arquivo [LICENSE](./LICENSE).
