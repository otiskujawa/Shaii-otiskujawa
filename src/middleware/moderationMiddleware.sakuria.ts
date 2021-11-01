import Discord from "discord.js";
import {isFreeNitro} from "../moderation/isFreeNitro.sakuria";
import {isBadWord} from "../moderation/isBadWord.sakuria";
import Logger from "../sakuria/Logger.sakuria";

const checks = [
  isFreeNitro,
  isBadWord
];

export default function (message: Discord.Message, next: (message: Discord.Message) => any): void {
  if (message.author.bot) return next(message);
  for (let i = 0; i < checks.length; i++) {
    const checkFn = checks[i];
    const idxString = `[${i + 1}/${checks.length}]`;
    const isFailed = checkFn(message);
    Logger.command.print(`${idxString} Checking ${checkFn.name}`);
    if (isFailed){
      return Logger.command.print(`${idxString} Check ${checkFn.name} failed for ${message.author.username}`);
    }
  }

  return next(message);
}
