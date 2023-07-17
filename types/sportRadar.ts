export interface Venue {
  id: string;
  name: string;
  capacity: number;
  address: string;
  city: string;
  state: string;
  country: string;
  sr_id: string;
  location: {
    lat: string;
    lng: string;
  };
}

export interface GenericNameAlias {
  id: string;
  name: string;
  alias: string;
}

export interface Coach {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  position: string;
  experience: string;
  reference: string;
}

export interface TeamColour {
  type: "primary" | "secondary";
  hexColor: string;
  rgb_color: {
    red: number;
    green: number;
    blue: number;
  };
}

export interface Player {
  id: string;
  status: "ACT" | "TWO_WAY";
  full_name: string;
  first_name: string;
  last_name: string;
  abbr_name: string;
  jersey_number?: string;
  high_school?: string;
  college?: string;
  height: number;
  weight: number;
  position: string;
  primary_position: string;
  experience: string;
  birth_place: string;
  birthdate: string;
  updated: string;
  sr_id: string;
  rookie_year: number;
  reference: string;
  draft: Draft;
}

export interface Draft {
  team_id: string;
  year: number;
  round: string;
  pick: string;
}

export interface Team {
  id: string;
  name: string;
  market: string;
  sr_id: string;
  reference: string;
}
