# tanks
Browser action game project

**Table of Contents**

[TOC]

### Features

- The game uses high-performance WebGL for graphics
- Client-server architecture allows you to play with your friends
- Convinient server console
- Simulation of blast waves spreading
- Realistic spread and reflection of blast waves
- Convinient map editor
- Low traffic consumption
- Uses JavaScript for both server and client

# Installing the game

*Please, note that Node 17.0 is required*

1. Clone the repo
`git clone https://github.com/JakMobius/tanks/`
2. Navigate to project folder
`cd tanks`
3. Install dependencies
`npm install`

# Starting the server
- To start server with default settings, simply type
      npm run start-server
   By default, this command forces server to run script called `autorun`. This script is stored as `src/sever/scripts/autorun.script`.
- To provide some custom command line arguments, run the following command:
      node src/server/main.js (your arguments)
### Server command line arguments
  - For now, there is only `-s (script name)` command line flag, which is used for running scripts as soon as server starts. Server scripts are located under `src/server/scripts` directory.

# Building the client
- To build the client, run the following command:
      cd build/actions;
      node commit-client.js (target directory)
Your build will be located in "game" subdirectory

# Building the map editor
- To build the map editor, run the following command:
      cd build/actions;
      node commit-map-editor.js (target directory)
Your build will be located in "map-editor" subdirectory

Please, note: If you want to build both game client and map editor, it's recommended to pass the same command line arguments to `commit-client` and `commit-map-editor`
