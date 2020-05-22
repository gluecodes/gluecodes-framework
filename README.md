# @gluecodes/framework (Beta)

Non-trivial framework based on trivial principles.

[![IMAGE ALT TEXT HERE](http://img.youtube.com/vi/CJ451ccca2M/0.jpg)](http://www.youtube.com/watch?v=CJ451ccca2M)

Read more about [GlueCodes Platform](https://www.glue.codes)

## Goals

- It should allow to develop fast loading websites.
- It should let us build reactive UIs.
- It should be minimalistic and simplistic.
- It should let us build apps that scale.
- It should let us build a boilerplate that can be easily generated with common tools.

## Dev experience

- Build UI from pure functions which return an instance of Virtual DOM.
- Have a central store which keeps results of all actions.
- Stop worrying about naming data and access data via action names.
- Keep actions pure.
- Have UI split into layout and sections where only the latter have access to the store and actions.
- Have actions which can feed UI with live data.

## Key concepts

### Vocabulary

- command - an action triggered by a user e.g. via DOM event
- component - a pure function which returns an instance of Virtual DOM and can be reused across multiple projects
- layout - a function which the only role is to lay down slots, hence it does not have access to the store, nor commands
- provider - an action executed prior rendering which provide initial data and make those actions pipe the store through
- reusable slot - a piece of UI to be reused across pages within an app which has read access to the store and, may trigger commands
- slot - a logically separated UI section which have read access to the store and, may trigger commands
- store - a central app state

### App state flow

There is a uni-directional app state flow which populates a single store. See example below.

1. The app is bootstrapping.
2. Providers are triggered piping through the store. Each of them writes to the store by resolving or returning. (result of `getTodos` is passed to `getFilteredTodos`).
3. Last Provider in the pipeline (`getFilteredTodos`) stores its result and triggers rendering.
4. Rendering layer passes the store as `actionResults` and Commands as `actions`.
5. User types in a filter string which triggers a Command (`filterTodos`).
6. Command: `filterTodos` writes to the store and triggers rendering.
7. Core Command: `reload` re-triggers whole cycle.

![alt text](https://github.com/gluecodes/gluecodes-framework/blob/master/framework.png "Schema")

### Rendering

Every time a Command is triggered, Virtual DOM performs full-page re-render to give all Slots read access to the Command result via Store.
 
There is a core 'reload' Command to re-trigger Providers and then perform re-rendering. 
It's meant to be called right after the Command handling particular app event resolved (usually it happens in DOM event handler).
Since Providers pipe through the store, after 'reload', they may access result of the Command.  

### Components

Slots are not Components. Components are pure functions which receive immutable, non-app specific props.

## Installation

Run:
```bash
yarn add http://gluecodes-components.s3-website-eu-west-1.amazonaws.com/framework-3.0.15.tar.gz
```
Or:
```bash
npm i http://gluecodes-components.s3-website-eu-west-1.amazonaws.com/framework-3.0.15.tar.gz
```

## Usage

Explore [TodoMVC app](https://github.com/gluecodes/gluecodes-todomvc) to get an idea of how the framework may be used.

## Contributing

Feel free to rise issues, open PRs or contact at hello@glue.codes about any ideas/criticism.

### Prerequisites

- Docker

### Installation

- Run:
```bash  
cp .env_template .env 
```
- Run: 
```bash 
docker-compose up 
```

### Scripts

Build:
```bash 
docker exec -it gluecodes_framework npm run build
 ```
 
Test (remember to run Build script before):
 ```bash 
 docker exec -it gluecodes_framework npm run test
 ```

Lint:
```bash  
docker exec -it gluecodes_framework npm run lint
```

## Documentation

WIP

## Collaborators

- [Chris Czopp](https://github.com/chris-czopp)
- [Przemyslaw Michalak](https://github.com/w-eagle)
- [Sam House](https://github.com/house92)

## License

[MIT](https://github.com/gluecodes/gluecodes-framework/blob/master/LICENSE)
