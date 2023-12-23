#!/usr/bin/env node

console.log("Start App Here!");

import {app} from "./app/App";
import {sequelizeMgr} from "./modules/sequelize/SequelizeManager";

app().start()
  // .then(() => sequelizeMgr().sync())
  .then(() => app().ready());

