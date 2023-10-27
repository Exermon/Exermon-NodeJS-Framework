process.env["SCRIPT"] = "true";

import {app} from "../app/App";

app().start()
  .then(() => sequelizeMgr().sync())
  .then(() => process.exit(0));

import {sequelizeMgr} from "../modules/sequelize/SequelizeManager";
