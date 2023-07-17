import { GetPlayersOnTeam, permissions, models, Player } from "@teamkeel/sdk";

export default GetPlayersOnTeam(async (ctx, inputs) => {
  permissions.allow();

  const playerTeams = await models.playerTeam.findMany({
    where: { teamId: inputs.teamId },
  });

  const players = (await Promise.all(
    playerTeams.map(async (playerTeam) => {
      return models.player.findOne({ id: playerTeam.playerId });
    })
  )) as Player[];

  return { players };
});
