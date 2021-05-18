<p align="left"><a href="https://www.glue.codes" target="_blank" rel="noopener noreferrer"><img width="100" src="https://github.com/gluecodes/gluecodes-framework/blob/master/mediaFiles/logogithub.png" alt="GlueCodes logo"></a></p>

# @gluecodes/framework

Data flow management library for [SolidJS](http://solidjs.com/) that powers [GlueCodes Studio](https://ide.glue.codes).

See [Documentation](https://www.glue.codes/docs.html).

## Installation

Run:
```bash
yarn add https://ide.glue.codes/repos/df67f7a82cbdc5efffcb31c519a48bf6/core/framework-1.0.1.tar.gz
```
Or:
```bash
npm i https://ide.glue.codes/repos/df67f7a82cbdc5efffcb31c519a48bf6/core/framework-1.0.1.tar.gz --save
```
## Contributing

Feel free to rise issues, open PRs or contact at hello@glue.codes about any ideas/criticism.

## Prerequisites

- Docker

## Installation

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

## Collaborators

- [Chris Czopp](https://github.com/chris-czopp)
- [Przemyslaw Michalak](https://github.com/w-eagle)

## License

[MIT](https://github.com/gluecodes/gluecodes-framework/blob/master/LICENSE)
