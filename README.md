# tanks
Browser action game project

#### Please, note that project is under heavy development now
This repository should not be treated as a real finished game for now. Some features listed in this readme are likely being refactored and doesn't work right now. (For example, you should have an HTTP server to access the map editor. Ugh)

However, you can contribute and help make this game more and more awesome `:)`

### Features

- The game uses high-performance WebGL for graphics
- Client-server architecture allows you to play with your friends
- Convinient server console
- Realistic spread and reflection of blast waves
- Convinient map editor
- Low traffic consumption
- Uses TypeScript for both server and client.
- Custom build system which allows to use the same files both in client and in server build for convinience

# Installing the game

*Please, note that Node 14 is required*

1. Clone the repo
```
git clone https://github.com/JakMobius/tanks/
```
2. Navigate to project folder
```
cd tanks
```
3. Install dependencies
```
npm install
```

# Building & running the server
- To build server from sources, type the following command:
  ```
  npm run build-server
  ```
  This command will rebuild the entire project. This may take time the first time you run it, but subsequent builds will be much faster due to the build cache
- To start server with default settings, simply type
  ```
  node dist/server
  ```
### Server command line arguments
- `-script <script name>`

  This flag is used for running scripts as soon as server starts. Server scripts are located under `src/server/scripts` directory.

  This flag can also be used with `-s` alias.

- `-preference-string <key>=<value>`

  This flag is used for setting up your server preferences right before server starts. For example, if your database is located at a new address, you should use this flag as following:
  ```
  -preference-string database.url=mongodb://new-database-host:27017
  ```

  This flag can also be used with`-ps` alias.

  You should only use this flag when you want to overwrite a string. If you want to set up a port or something else that is not a string, use one of the flags listed below
- `-preference-number <key>=<value>`

  Use this flag to overwrite setting with a number

  This flag can also be used with`-pn` alias.

- `-preference-boolean <key>=<value>`

  Use this flag to overwrite setting with a boolean

  Value can either be:
    - `yes`, `true` or `1` mean `true`
    - `no`, `false` or `0` mean `false`

  This flag can also be used with`-pb` alias.

### Configuring the server
- To configure the server port and database credentials, edit the `dist/server/server-preferences.json` file. If this file does not exist, start the server once. The default configuration file will be created.

  **Note: your custom preferences file is listed in .gitignore, so your, database password and other confidential data will not be shared**
- By default, the server only binds the port specified in the configuration. To start the game room and enter the game, you must first start the corresponding server modules using the `service` command. In the future this feature will help to create distributed systems where the hub and the game server can be located on different servers. For now it is enough to enter `service on` command to start the web-server and the game socket. After that you can use the `room create` command to create a game room. Then you will be able to go to `localhost:port/game` and play the game.

  **Note: If you use the `-s autorun` flag when starting the server, or run the `run autorun` command in the server console, the server will automatically start all necessary modules and create several game rooms.**