import { UpdatePlayersOnTeam, permissions, models } from "@teamkeel/sdk";
import axios from "axios";
import { DateTime } from "luxon";
import {
  Venue,
  GenericNameAlias,
  Coach,
  TeamColour,
  Player,
} from "../types/sportRadar";

interface SportRadarProfileResponse {
  id: string;
  name: string;
  market: string;
  alias: string;
  founded: number;
  sr_id: string;
  reference: string;
  venue: Venue;
  league: GenericNameAlias;
  conference: GenericNameAlias;
  division: GenericNameAlias;
  coaches: Array<Coach>;
  team_colors: Array<TeamColour>;
  players: Array<Player>;
}

async function getRoster(
  teamId: string
): Promise<SportRadarProfileResponse | null> {
  try {
    const { data } = await axios.get(
      `http://api.sportradar.us/nba/trial/v8/en/teams/${teamId}/profile.json?api_key=${process.env.SPORTRADAR_API_KEY}`
    );
    return data;
  } catch (e) {
    console.log(e.message, e.response.data);
    return null;
  }
}

export default UpdatePlayersOnTeam(async (ctx, inputs) => {
  permissions.allow();

  const lastUpdate = await models.lastUpdate.findMany({
    where: { model: "PlayerTeam", info: inputs.teamId },
  });
  if (
    lastUpdate?.[0]?.lastUpdate > DateTime.now().toJSDate() ||
    inputs.overrideDateProtection
  ) {
    const team = await models.team.findOne({ id: inputs.teamId });

    if (!team) throw new Error("Team not found");

    const roster = await getRoster(team.externalId);

    if (!roster) throw new Error("Roster not found");

    if (!team.alias) {
      await models.team.update({ id: team.id }, { alias: roster.alias });
    }

    return Promise.all(
      roster.players.map(async (player) => {
        const existingPlayer = await models.player.findOne({
          externalId: player.id,
        });
        const playerData = {
          externalId: player.id,
          firstName: player.first_name,
          lastName: player.last_name,
          position: player.primary_position,
          height: player.height,
          weight: player.weight,
          jersey: player.jersey_number,
          birthDate: DateTime.fromISO(player.birthdate).toJSDate(),
          highSchool: player.high_school,
          college: player.college,
          status: player.status,
        };

        if (existingPlayer) {
          await models.player.update({ id: existingPlayer.id }, playerData);
        } else {
          const newPlayer = await models.player.create(playerData);
          await models.playerTeam.create({
            playerId: newPlayer.id,
            teamId: team.id,
            joined: new Date(),
          });
          if (player.draft.year) {
            await models.playerDraft.create({
              teamId: team.id,
              playerId: newPlayer.id,
              year: player.draft.year,
              round: parseInt(player.draft.round),
              pick: parseInt(player.draft.pick),
            });
          }
        }

        return player.full_name;
      })
    );
  }
  return {};
});
