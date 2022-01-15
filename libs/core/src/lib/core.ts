import { RegionService } from './regions';

export interface ShautMessage {
  text: string;
  origin: Coordinate;
  radius: number;
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
  updateUser(user: ShautUser): Promise<void>;
}

export class ShautService {
  constructor(
    private messageService: ShautMessageService,
    private userService: ShautUserService,
    private regionService: RegionService = new RegionService()
  ) {}

  async shautMessage(message: ShautMessage): Promise<void> {
    const regions = this.regionService.getRegionsForShaut(
      message.origin,
      message.radius
    );
    const users = await this.userService.getUsersForRegions(regions);
    await this.messageService.sendMessageToUsers(message, users);
  }

  async updateUser(user: ShautUser): Promise<void> {
    await this.userService.updateUser(user);
  }
}
