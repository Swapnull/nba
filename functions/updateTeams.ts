import { UpdateTeams, permissions, models } from "@teamkeel/sdk";
import axios from "axios";
import { GenericNameAlias, Team } from "../types/sportRadar";

interface SportRadarRankingResponse {
  league: GenericNameAlias;
  season: {
    id: string;
    year: number;
    type: "REG" | "PST";
  };
  conferences: Array<
    GenericNameAlias & {
      divisions: Array<GenericNameAlias & { teams: Array<Team> }>;
    }
  >;
}

async function getTeams(): Promise<SportRadarRankingResponse> {
  const { data } = await axios.get(
    `http://api.sportradar.us/nba/trial/v8/en/seasons/2022/REG/rankings.json?api_key=${process.env.SPORTRADAR_API_KEY}`
  );
  return data;
}

export default UpdateTeams(async (ctx, inputs) => {
  permissions.allow();

  const teams = await getTeams();

  await Promise.all(
    teams.conferences.map((conference) =>
      Promise.all(
        conference.divisions.map((division) =>
          Promise.all(
            division.teams.map(async (team) => {
              const teamData = {
                name: `${team.market} ${team.name}`,
                conference: conference.alias,
                division: division.alias,
              };

              const data = await models.team.findOne({ externalId: team.id });

              if (data) {
                await models.team.update({ externalId: team.id }, teamData);
              } else {
                await models.team.create({
                  externalId: team.id,
                  ...teamData,
                });
              }
            })
          )
        )
      )
    )
  );

  return {};
});
