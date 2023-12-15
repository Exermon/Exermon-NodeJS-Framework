#!/usr/bin/env node

console.log("Start App Here!");

import {app} from "./app/App";
app().start().then(() => app().ready());

