// @ts-ignore
import cron from "node-cron";

export function schedule(expr, log: boolean = true) {
  return (obj, key, desc) => {
    if (IsScriptMode) return;
    cron.schedule(expr, async () => {
      try {
        if (log) console.log("[Schedule Start]", obj, key);
        await desc.value();
        if (log) console.log("[Schedule Finish]", obj, key);
      } catch (e) {
        console.log("[Schedule Error]", obj, key, e);
      }
    })
  }
}

export function scheduleTask(expr, task: Function, log: boolean = true) {
  if (IsScriptMode) return;
  cron.schedule(expr, async () => {
    try {
      if (log) console.log("[Schedule Start]", task.arguments);
      await task();
      if (log) console.log("[Schedule Finish]", task.arguments);
    } catch (e) {
      console.log("[Schedule Error]", task.arguments, e);
    }
  })
}

import {IsScriptMode} from "../app/App";
