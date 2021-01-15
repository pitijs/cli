# PitiJS CLI

## Install

**NPM**

```bash
$ npm i -g @pitijs/cli
```

**Yarn**

```bash
$ yarn global add @pitijs/cli
```

## Create a project

```bash
$ piti new myCliApp
```

## Create command via cli

```bash
$ cd myCliApp
$ piti create command add-user
```

The above command will create a command into src/commands directory named `AddUserCommand`

Add command to `src/index.ts`

```ts
Piti.run({
  scriptName: 'myCliApp',
  commands: [AddUserCommand],
});
```

And test your commands:

```bash
$ ./myCliApp add-user
```

Go to framework documentation: https://github.com/pitijs/piti
