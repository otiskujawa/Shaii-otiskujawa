import Discord from "discord.js";
import packageJson from "../../../package.json" assert { type: 'json' };
import { LINUX_LOGO, SHAII_LOGO, WINDOWS_LOGO } from "../../constants";
import { msToTime } from "../../logic/logic";
import { CommandExecuteResponse } from "../../types";
import AbstractCommand, { CommandData } from '../AbstractCommand';
import command from '../../decorators/command';
import si from "systeminformation";

@command()
class Env extends AbstractCommand {
  private startTime = Date.now();
  private systemInfo: si.Systeminformation.StaticData | null = null;

  private async getSystemInfo(): Promise<si.Systeminformation.StaticData> {
    if (!this.systemInfo) {
      this.systemInfo  = await si.getStaticData();
    }
    return this.systemInfo;
  }

  async execute(): Promise<CommandExecuteResponse> {
    const systemInfo = await this.getSystemInfo()

    // Leave these in here because systeminfo takes 10 hours to fetch data
    // and putting these out there will cause it to be undefined
    const { distro, platform, release } = systemInfo.os;
    const { manufacturer: cpuManufacturer, cores, brand } = systemInfo.cpu;
    const { manufacturer: moboManufacturer, model } = systemInfo.system;
    const gpuModel = systemInfo.graphics.controllers?.[0]?.model;
    const vram = systemInfo.graphics.controllers?.[0]?.vram;
    const totalRam = systemInfo.memLayout.reduce((acc, mem) => acc + mem.size, 0);

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: `Naoko v${packageJson.version}`, iconURL: SHAII_LOGO })
      .setColor("#FF00B6")
      .setThumbnail(platform === "win32" || platform === "win64" ? WINDOWS_LOGO : LINUX_LOGO)
      .addFields(
        { name: "OS", value: `${distro} ${release}` },
        { name: "CPU", value: `x${cores} ${cpuManufacturer} ${brand}` },
        { name: "RAM", value: `${~~(totalRam / 1024 / 1024 / 1024)}GB` },
        { name: "Motherboard", value: `${moboManufacturer} ${model}` },
        { name: "Uptime", value: msToTime(Date.now() - this.startTime) },
      );

    gpuModel && vram && embed.addFields({ name: "GPU", value: `${gpuModel} ${vram}MB` });

    return { embeds: [embed] };
  }

  getCommandData(): CommandData {
    return {
      name: "environment",
      category: "UTILITY",
      aliases: ["env"],
      usage: "env",
      description: "Show environment details",

    }
  }
}