<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Creation

```bash
npm install -g @nestjs/cli
nest new ac-back-nest
npm install --save @nestjs/swagger
npm install @prisma/client
npm install -D prisma
npx prisma init

npm install class-validator class-transformer
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt

npx nest g module prisma
npx nest g service prisma

npx nest g module users
npx nest g controller users
npx nest g service users

npx nest g module auth
npx nest g service auth
npx nest g controller auth

npx nest generate 
npm i -D ts-node typescript @types/node

```

#### Prisma ORM

```bash
# usar o shadow database
npx prisma migrate dev --name migration_name

# Puxar dados existentes do banco para o schema.prisma
npx prisma db pull

# Sincroniza seu esquema Prisma com o banco de dados sem criar uma migração
npx prisma db push

# Abre o Prisma Studio, uma interface visual para gerenciar os dados do banco de dados
npx prisma studio

# Aplica todas as migrações pendentes no banco de dados
npx prisma migrate deploy

# Gera o cliente Prisma baseado no esquema Prisma
npx prisma generate

# Executa uma nova migração baseada no esquema atual do Prisma e aplica ao banco de dados
npx prisma migrate dev

# Executa o script de seed para popular o banco de dados com valores padrão
npx prisma db seed
```

#### Routes

| Type | Route                            | Description          |
| ---- | -------------------------------- | -------------------- |
| Get  | http://localhost:3000/           | test api             |
| Get  | http://localhost:3000/api        | access swagger       |
| Get  | http://localhost:3000/users      | lista all users      |
| Post | http://localhost:3000/users      | create a new user    |
| Post | http://localhost:3000/auth/login | authenticate an user |

https://www.prisma.io/blog/nestjs-prisma-authentication-7D056s1s0k3l#implement-authentication-in-your-rest-api

#### Achtecture

```md
ac-back-nest
├── prisma
│ ├── migrations
│ └── schema.prisma
├── src/
│ ├── app.module.ts
│ ├── main.ts
│ ├── prisma/
│ │ ├── prisma.module.ts
│ │ └── prisma.service.ts
│ └── users/
│ ├── dto/
│ │ └── create-user.dto.ts
│ ├── interfaces/
│ │ └── user.interface.ts
│ ├── users.controller.ts
│ ├── users.module.ts
│ └── users.service.ts
├── test/
│ ├── app.e2e-spec
│ └── jest-e2e.json
├── .env
├──.eslintrc.js
├── .gitignore
├── .prettierrc
├── nest-cli.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.build.json
├── tsconfig
└── Readme.md
```
