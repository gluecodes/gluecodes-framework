<p align="center"><a href="https://www.glue.codes" target="_blank" rel="noopener noreferrer"><img width="100" src="https://github.com/gluecodes/gluecodes-framework/blob/master/mediaFiles/logogithub.png" alt="GlueCodes logo"></a></p>

<h2 align="center">@gluecodes/framework (Beta)</h2>

<p align="center">There are many brilliant JS frameworks out there. For wtf reason would we build another one?</p>

<p align="center">Because it is the first framework built with the IDE in mind</p>

<p align="center"><img width="100%" src="https://github.com/gluecodes/gluecodes-framework/blob/master/mediaFiles/ide.jpg" alt="GlueCodes IDE"></p>

<h2 align="center">Demo</h2>

<p align="center">Bear in mind it's a prototype which still requires a lot of work. Play around with this <a href="http://gluecodes-demo.s3-website.eu-west-2.amazonaws.com/ide.html?appId=1&edit=page&id=index">demo</a> and enjoy the <a href="http://gluecodes-demo.s3-website.eu-west-2.amazonaws.com/previewPage.html?appId=1&pageId=index"> live preview.</a></p>

<p align="center"><a href="http://gluecodes-demo.s3-website.eu-west-2.amazonaws.com/ide.html?appId=1&edit=page&id=index" target="_blank" rel="noopener noreferrer"><img width="100%" src="https://github.com/gluecodes/gluecodes-framework/blob/master/mediaFiles/liveDemo.gif" alt="GlueCodes live demo"></a></p>

<h2 align="center">Goals</h2>

<p align="center"><img width="100%" src="https://github.com/gluecodes/gluecodes-framework/blob/master/mediaFiles/goldenGoals.gif" alt="Golden Goals"></p>

<p align="center"><img width="100%" src="https://github.com/gluecodes/gluecodes-framework/blob/master/mediaFiles/silverGoals.gif" alt="Silver Goals"></p>

<h2 align="center">Dev experience</h2>

<p align="center"><img width="100%" src="https://github.com/gluecodes/gluecodes-framework/blob/master/mediaFiles/experience.png" alt="Dev Experience"></p>

<p align="center"><img width="100" src="https://github.com/gluecodes/gluecodes-framework/blob/master/mediaFiles/dictionary.png" alt="Vocabulary"></p>

<h2 align="center">Vocabulary</h2>

- __command__ - an action triggered by a user e.g. via DOM event
- __component__ - a pure function which returns an instance of Virtual DOM and can be reused across multiple projects
- __layout__ - a function which the only role is to lay down slots, hence it does not have access to the store, nor commands
- __provider__ - an action executed prior rendering which provide initial data and make those actions pipe the store through
- __reusable slot__ - a piece of UI to be reused across pages within an app which has read access to the store and, may trigger commands
- __slot__ - a logically separated UI section which have read access to the store and, may trigger commands
- __store__ - a central app state

<h2 align="center">App state flow</h2>

There is a uni-directional app state flow which populates a single store. See example below.

1. The app is bootstrapping.
2. Providers are triggered piping through the store. Each of them writes to the store by resolving or returning. (result of `getTodos` is passed to `getFilteredTodos`).
3. Last Provider in the pipeline (`getFilteredTodos`) stores its result and triggers rendering.
4. Rendering layer passes the store as `actionResults` and Commands as `actions`.
5. User types in a filter string which triggers a Command (`filterTodos`).
6. Command: `filterTodos` writes to the store and triggers rendering.
7. Core Command: `reload` re-triggers whole cycle.

![alt text](https://github.com/gluecodes/gluecodes-framework/blob/master/framework.png "Schema")

<p align="center"><a href="http://www.youtube.com/watch?v=CJ451ccca2M"><img alt="Schema" src="http://img.youtube.com/vi/CJ451ccca2M/0.jpg"/></a></p>

<h2 align="center">Rendering</h2>

Every time a Command is triggered, Virtual DOM performs full-page re-render to give all Slots read access to the Command result via Store.
 
There is a core 'reload' Command to re-trigger Providers and then perform re-rendering. 
It's meant to be called right after the Command handling particular app event resolved (usually it happens in DOM event handler).
Since Providers pipe through the store, after 'reload', they may access result of the Command.  

<h2 align="center">Components</h2>

Slots are not Components. Components are pure functions which receive immutable, non-app specific props.

<h2 align="center">Installation</h2>

Run:
```bash
yarn add http://gluecodes-components.s3-website-eu-west-1.amazonaws.com/framework-3.0.20.tar.gz
```
Or:
```bash
npm i http://gluecodes-components.s3-website-eu-west-1.amazonaws.com/framework-3.0.20.tar.gz
```

<h2 align="center">Usage</h2>

Explore [TodoMVC app](https://github.com/gluecodes/gluecodes-todomvc) to get an idea of how the framework may be used.


<h2 align="center">Contributing</h2>

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

- [Chris Czopp](https://github.com/chris-czopp) <a href="https://twitter.com/ChrisCzopp?ref_src=twsrc%5Etfw" target="_blank" rel="noopener noreferrer"><img width="50" src="https://github.com/gluecodes/gluecodes-framework/blob/master/follow.png" alt="Chris follow Twitter"></a>
- [Przemyslaw Michalak](https://github.com/w-eagle) <a href="https://twitter.com/PrzemyslawMic10?ref_src=twsrc%5Etfw" target="_blank" rel="noopener noreferrer"><img width="50" src="https://github.com/gluecodes/gluecodes-framework/blob/master/follow.png" alt="Przemek follow Twitter"></a>
- [Sam House](https://github.com/house92)

## License

[MIT](https://github.com/gluecodes/gluecodes-framework/blob/master/LICENSE)
