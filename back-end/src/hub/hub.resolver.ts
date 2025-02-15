import { Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Invite } from 'src/dal/entity/invite.entity';
import { MicroChat } from 'src/dal/entity/microChat.entity';
import { UserId } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/guards/authguard.service';
import { UserService } from 'src/user/user.service';
import { Float, ID } from 'type-graphql';
import { Hub } from '../dal/entity/hub.entity';
import { JoinUserHub } from '../dal/entity/joinUserHub.entity';
import { User } from '../dal/entity/user.entity';
import { HubActivityService } from './hub-activity/hub-activity.service';
import { HubGeofenceService } from './hub-geofence/hub-geofence.service';
import { HubInviteService } from './hub-invite/hub-invite.service';
import { HubMicroChatService } from './hub-micro-chat/hub-micro-chat.service';
import { HubService } from './hub.service';

@Resolver()
export class HubResolver {
  private logger = new Logger(HubResolver.name, true);

  constructor(
    private hubService: HubService,
    private hubActivityService: HubActivityService,
    private hubGeofenceService: HubGeofenceService,
    private hubMicroChatService: HubMicroChatService,
    private hubInviteService: HubInviteService,
    private userService: UserService,
  ) {}

  @UseGuards(AuthGuard)
  @Mutation(() => JoinUserHub)
  public async createHub(
    @UserId() userId,
    @Args({ name: 'name', type: () => String }) name: string,
    @Args({ name: 'description', type: () => String }) description: string,
    @Args({ name: 'image', type: () => String }) image: string,
    @Args({ name: 'latitude', type: () => Float }) latitude: number,
    @Args({ name: 'longitude', type: () => Float }) longitude: number,
  ): Promise<JoinUserHub> {
    this.logger.log(this.createHub.name);
    const hub = await this.hubService.createHub(userId, {
      name,
      description,
      image,
      latitude,
      longitude,
    } as Hub);
    return hub;
  }

  @UseGuards(AuthGuard)
  @Query(() => JoinUserHub)
  public async hub(
    @UserId() userId,
    @Args({ name: 'id', type: () => ID }) id: number,
  ): Promise<JoinUserHub> {
    this.logger.log(this.hub.name);
    const result = await this.hubService.getOneUserHub(userId, id);
    return result;
  }

  @UseGuards(AuthGuard)
  @Query(() => [JoinUserHub])
  public async usersHubs(@UserId() userId): Promise<JoinUserHub[]> {
    this.logger.log(this.usersHubs.name);
    const result = await this.hubService.getUserHubs(userId);
    return result;
  }

  @UseGuards(AuthGuard)
  @Query(() => [JoinUserHub])
  public async commonUsersHubs(
    @UserId() userId,
    @Args({ name: 'otherUsersId', type: () => ID }) otherUsersId: number,
  ) {
    this.logger.log(this.commonUsersHubs.name);
    const result = await this.hubService.commonUsersHubs(userId, otherUsersId);
    return result;
  }

  @UseGuards(AuthGuard)
  @Query(() => [Invite])
  public async invitesByHub(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
  ): Promise<Invite[]> {
    this.logger.log(this.invitesByHub.name);
    return await this.hubInviteService.getInvitesByHub(userId, hubId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Invite)
  public async inviteUserToHub(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
    @Args({ name: 'inviteesEmail', type: () => String }) inviteesEmail: string,
  ): Promise<Invite> {
    this.logger.log(this.inviteUserToHub.name);
    const invite: Invite = await this.hubInviteService.inviteUserToHub(
      userId,
      hubId,
      inviteesEmail,
    );
    return invite;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => JoinUserHub)
  public async respondToHubInvite(
    @UserId() userId,
    @Args({ name: 'invitersId', type: () => ID }) invitersId: number,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
    @Args({ name: 'accepted', type: () => Boolean }) accepted: boolean,
  ): Promise<JoinUserHub> {
    this.logger.log(this.respondToHubInvite.name);
    const result = await this.hubInviteService.respondToHubInvite(
      userId,
      invitersId,
      hubId,
      accepted,
    );
    return result;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async deleteInvite(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
    @Args({ name: 'inviteId', type: () => ID }) inviteId: number,
  ): Promise<boolean> {
    await this.hubInviteService.deleteInvite(userId, hubId, inviteId);
    return true;
  }

  @UseGuards(AuthGuard)
  @Query(() => [User])
  public async usersPeople(@UserId() userId): Promise<User[]> {
    this.logger.log(this.usersPeople.name);
    const result = await this.hubService.usersPeople(userId);
    return result;
  }

  @UseGuards(AuthGuard)
  @Query(() => [Hub])
  public async searchHubByName(
    @UserId() userId,
    @Args({ name: 'search', type: () => String }) search: string,
  ): Promise<Hub[]> {
    this.logger.log(this.searchHubByName.name);
    const results = await this.hubService.searchHubByName(userId, search);
    return results;
  }

  @UseGuards(AuthGuard)
  @Query(() => [Hub])
  public async ownedHubs(@UserId() userId): Promise<Hub[]> {
    this.logger.log(this.ownedHubs.name);
    const ownedHubs = await this.userService.getUsersOwnedHubs(userId);
    return ownedHubs;
  }

  @UseGuards(AuthGuard)
  @Query(() => [Hub])
  public async memberOfHubs(@UserId() userId): Promise<Hub[]> {
    this.logger.log(this.memberOfHubs.name);
    const memberOfHubs = await this.userService.memberOfHubs(userId);
    return memberOfHubs;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async deleteHub(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
  ) {
    this.logger.log(this.deleteHub.name);
    await this.hubService.deleteHub(userId, hubId);
    return true;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Hub)
  public async editHub(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
    @Args({ name: 'name', type: () => String }) name: string,
    @Args({ name: 'description', type: () => String }) description: string,
  ): Promise<Hub> {
    this.logger.log(this.editHub.name);
    const result = await this.hubService.editHub(
      userId,
      hubId,
      name,
      description,
    );
    return result;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Hub)
  public async changeHubImage(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
    @Args({ name: 'newImage', type: () => String }) newImage: string,
  ): Promise<Hub> {
    this.logger.log(this.changeHubImage.name);
    const result = await this.hubService.changeHubImage(
      userId,
      hubId,
      newImage,
    );
    return result;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async joinHub(
    @UserId() userId,
    @Args({ name: 'id', type: () => ID }) id: number,
  ): Promise<boolean> {
    this.logger.log(this.joinHub.name);
    await this.hubService.joinHub(userId, id);
    return true;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async setHubStarred(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
  ) {
    this.logger.log(this.setHubStarred.name);
    await this.hubService.setHubStarred(userId, hubId);
    return true;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async setHubNotStarred(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
  ) {
    this.logger.log(this.setHubNotStarred.name);
    await this.setHubNotStarred(userId, hubId);
    return true;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async enteredHubGeofence(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
  ): Promise<boolean> {
    this.logger.log(this.enteredHubGeofence.name);
    await this.hubGeofenceService.enteredHubGeofence(userId, hubId);
    return true;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async exitedHubGeofence(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
  ): Promise<boolean> {
    this.logger.log(this.exitedHubGeofence.name);
    await this.hubGeofenceService.exitedHubGeofence(userId, hubId);
    return true;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Hub)
  public async activateHub(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
  ) {
    this.logger.log(this.activateHub.name);
    const result = await this.hubActivityService.activateHub(userId, hubId);
    return result;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Hub)
  public async deactivateHub(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
  ) {
    this.logger.log(this.deactivateHub.name);
    const result = await this.hubActivityService.deactivateHub(userId, hubId);
    return result;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async microChatToHub(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
    @Args({ name: 'microChatId', type: () => ID }) microChatId: number,
  ) {
    this.logger.log(this.microChatToHub.name);
    await this.hubMicroChatService.microChatToHub(userId, hubId, microChatId);
    return true;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => MicroChat)
  public async createMicroChat(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
    @Args({ name: 'microChatText', type: () => String }) microChatText: string,
  ) {
    this.logger.log(this.createMicroChat.name);
    const microChat = await this.hubMicroChatService.createMicroChat(
      userId,
      hubId,
      microChatText,
    );
    return microChat;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async deleteMicroChat(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => ID }) hubId: number,
    @Args({ name: 'microChatId', type: () => ID }) microChatId: number,
  ) {
    this.logger.log(this.deleteMicroChat.name);
    await this.hubMicroChatService.deleteMicroChat(userId, hubId, microChatId);
    return true;
  }
}
