const Discord = require("discord.js");

module.exports = {
    name: 'announce',
    description: 'Get bot\'s ping',
    usage: 'ping',
    async execute(message, args, client) {
 
    if (!message.member.hasPermission(["ADMINISTRATOR"]))
      return message.channel.send("You don't have premmsions to do that!");

    let inline = true;
    let sayChannel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[0]);
    if (!sayChannel)
      return message.channel.send(
        `<a:cause:659086050802663425> | ${message.author} mention a channel First`
      );
    let sayMsg = args
      .slice(1)
      .join(" ")
      .split(" | ");

    if (!sayMsg[1]) sayMsg[1] == "FF7034";
    if (!sayMsg)
      return message.channel.send(
        `<a:cause:659086050802663425> | Say Some Message To Announce`
      );
    let role = message.member.highestRole;
    let embed = new Discord.MessageEmbed()
      .setColor(sayMsg[1])
      .setDescription(sayMsg[0]);

    message.delete();
    message.channel
      .send(
        `<a:valide:728098615926718480> | successfully Announced Your Message To ${sayChannel}`
      )
      .then(m => m.delete({ timeout: 2000 }));

    sayChannel.send({ embed }).catch(console.error);
  }
};