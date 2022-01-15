export interface ShautMessage {
  text: string;
  origin: Coordinate;
}

export interface ShautUser {
  id: string;
  region: Coordinate;
}

export interface Coordinate {
  lat: number;
  long: number;
}

export interface ShautMessageService {
  sendMessageToUsers(message: ShautMessage, users: ShautUser[]): Promise<void>;
}

export interface ShautUserService {
  getUsersForRegions(regions: Coordinate[]): Promise<ShautUser[]>;
}
