export interface Ability {
  slot: string;
  displayName: string;
  description: string;
  displayIcon: string;
}

export interface Agent {
  uuid: string;
  displayName: string;
  description: string;
  developerName: string;
  displayIcon: string;
  fullPortrait: string;
  background: string;
  role: {
    displayName: string;
    description: string;
    displayIcon: string;
  };
  abilities: Ability[];
  origin?: string;
  coordinates?: string;
  status?: string;
  scanId?: string;
}
