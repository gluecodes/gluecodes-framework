# @gluecodes/framework

Non-trivial framework based on trivial principles. 

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
- Have actions executed prior rendering which provide initial data and make those actions pipe the store through (Providers).
- Have actions triggered by a user e.g. via DOM event (Commands).
- Let Providers and Commands write to a single store and reload Providers with results of Commands.
- Have UI split into layout and sections where only the latter have access to the store and Commands (Layout and Slots).
- Have Providers which can feed UI with live data.

## Usage

Explore [TodoMVC app](https://github.com/gluecodes/gluecodes-todomvc) to get an idea of how the framework may be used.

## App state flow

1. App bootstraps.
2. Providers are triggered, each writes to the store their returned values and passes it through (result of `getTodos` is passed to `getFilteredTodos`).
3. Last Provider in the pipeline (`getFilteredTodos`) stores its result and triggers rendering .
4. Rendering layer passes the store as `actionResults` and Commands as `actions`.
5. User types in a filter string which triggers a Command (`filterTodos`).
6. Command: `filterTodos` writes to the store and triggers rendering.
7. Core Command: `reload` re-triggers whole cycle.

![alt text](https://github.com/gluecodes/gluecodes-framework/blob/master/framework.png "Schema")

## Contributing

Feel free to rise issues, open PRs or contact at hello@glue.codes about any ideas/criticism.

### Prerequisites

Docker

### Steps

- Run:
```bash  
cp .env_template .env 
```
- Run: 
```bash 
docker-compose up 
```

## Scripts

Build:
```bash 
docker exec -it gluecodes_todomvc npm run build
 ```

Lint:
```bash  
docker exec -it gluecodes_todomvc npm run lint
```

## Tests

WIP

## Documentation

WIP

## License

[MIT](https://github.com/gluecodes/gluecodes-framework/blob/master/LICENSE)
