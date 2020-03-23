import { UseGuards, Logger } from '@nestjs/common';
import { Mutation, Query, Resolver, Args } from '@nestjs/graphql';
import { UserId } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/guards/authguard.service';
import { QrService } from 'src/services/qr.service';
import { Hub } from '../dal/entity/hub';
import { JoinUserHub } from '../dal/entity/joinUserHub';
import { User } from '../dal/entity/user';
import { Float, Int } from 'type-graphql';
import { FileService } from 'src/services/file.service';
import { HubService } from './hub.service';
import { MicroChat } from 'src/dal/entity/microChat';

@Resolver()
export class HubResolver {
  private logger = new Logger(HubResolver.name, true);

  constructor(
    private qrService: QrService,
    private fileService: FileService,
    private hubService: HubService,
  ) {}

  //@Authorized()
  @UseGuards(AuthGuard)
  @Mutation(() => Hub)
  public async createHub(
    @UserId() userId,
    @Args({ name: 'name', type: () => String }) name: string,
    @Args({ name: 'description', type: () => String }) description: string,
    @Args({ name: 'image', type: () => String }) image: string,
    @Args({ name: 'latitude', type: () => Float }) latitude: number,
    @Args({ name: 'longitude', type: () => Float }) longitude: number,
  ): Promise<Hub> {
    this.logger.log(this.createHub.name);

    const imageUrl = await this.fileService.storePublicImageFromBase64(image);

    // Creates hub with user as owner.
    const hub = Hub.create({
      latitude,
      longitude,
      name,
      description,
      image: imageUrl,
    });
    const result = await hub.save();
    let joinUserHub = await JoinUserHub.create({
      userId: userId,
      hubId: hub.id,
      isOwner: true,
    });
    joinUserHub = await joinUserHub.save();
    return hub;
  }

  @UseGuards(AuthGuard)
  @Query(() => JoinUserHub)
  public async hub(
    @UserId() userId,
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<JoinUserHub> {
    this.logger.log(this.hub.name);

    const userHubRelationship = await JoinUserHub.findOne({
      where: {
        hubId: id,
        userId: userId,
      },
      relations: [
        'hub',
        'hub.usersConnection',
        'hub.usersConnection.user',
        'hub.microChats',
      ],
    });
    return userHubRelationship;
  }

  @UseGuards(AuthGuard)
  @Query(() => [JoinUserHub])
  public async usersHubs(@UserId() userId): Promise<JoinUserHub[]> {
    this.logger.log(this.usersHubs.name);

    const userHubRelationships = await JoinUserHub.find({
      where: {
        userId: userId,
      },
      relations: ['hub', 'hub.usersConnection'],
    });
    return userHubRelationships;
  }

  @UseGuards(AuthGuard)
  @Query(() => [JoinUserHub])
  public async commonUsersHubs(
    @UserId() userId,
    @Args({ name: 'otherUsersId', type: () => Int }) otherUsersId: number,
  ) {
    this.logger.log(this.commonUsersHubs.name);

    const userHubRelationships = await JoinUserHub.find({
      where: {
        userId: userId,
      },
      relations: [
        'hub',
        'hub.usersConnection',
        'hub.usersConnection.hub',
        'hub.usersConnection.hub.usersConnection',
      ],
    });

    let commonHubRelationships = [];

    for (let index = 0; index < userHubRelationships.length; index++) {
      const element = userHubRelationships[index];
      if (element.hub.usersConnection.find(x => x.userId == otherUsersId)) {
        commonHubRelationships.push(
          element.hub.usersConnection.find(x => x.userId == otherUsersId),
        );
      }
    }

    return commonHubRelationships;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async inviteUserToHub(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
    @Args({ name: 'inviteesEmail', type: () => String }) inviteesEmail: string,
  ): Promise<boolean> {
    this.logger.log(this.inviteUserToHub.name);

    const userHubRelationship = await JoinUserHub.findOne({
      where: {
        userId: userId,
        hubId: hubId,
        isOwner: true,
      },
      relations: ['hub'],
    });
    if (!userHubRelationship) {
      this.logger.warn(
        `Could not find admin relationship to hubId: ${hubId} for userId: ${userId}.`,
      );
      return false;
    }

    const invitee = await User.findOne({
      where: {
        email: inviteesEmail,
      },
    });
    if (!invitee) {
      this.logger.warn(
        `Did not find user to invite by email address: ${inviteesEmail}`,
      );
      return false;
    }
    if (invitee.id == userId) {
      this.logger.warn(`Cannot invite self to hub.`);
      return false;
    }

    let newRelationship = JoinUserHub.create({
      userId: invitee.id,
      hubId,
      isOwner: false,
    });
    newRelationship = await newRelationship.save();

    return true;
  }

  @UseGuards(AuthGuard)
  @Query(() => [User])
  public async usersPeople(@UserId() userId): Promise<User[]> {
    this.logger.log(this.usersPeople.name);

    //TODO optimize this
    const userHubRelationships = await JoinUserHub.find({
      where: {
        userId: userId,
      },
    });

    const usersHubIds: Array<number> = [];
    for (let index = 0; index < userHubRelationships.length; index++) {
      const element = userHubRelationships[index];
      usersHubIds.push(element.hubId);
    }

    let usersPeople: Array<User> = [];
    for (let index = 0; index < usersHubIds.length; index++) {
      const usersHubId = usersHubIds[index];
      const userHubRelationships = await JoinUserHub.find({
        where: {
          hubId: usersHubId,
        },
        relations: ['user'],
      });

      for (let index = 0; index < userHubRelationships.length; index++) {
        const otherUserId = userHubRelationships[index].userId;

        const user = userHubRelationships[index].user;
        if (usersPeople.find(x => x.id == otherUserId) == undefined) {
          usersPeople.push(user);
        }
      }
    }

    return usersPeople;
  }

  @UseGuards(AuthGuard)
  @Query(() => [Hub])
  public async searchHubByName(
    @UserId() userId,
    @Args({ name: 'search', type: () => String }) search: string,
  ): Promise<Hub[]> {
    this.logger.log(this.searchHubByName.name);

    const userHubRelationship = await JoinUserHub.find({
      where: {
        userId: userId,
      },
      relations: ['hub'],
    });
    search = search.toLowerCase();
    let results: Hub[] = [];
    for (let index = 0; index < userHubRelationship.length; index++) {
      const element = userHubRelationship[index];
      if (element.hub.name.toLowerCase().includes(search)) {
        results.push(element.hub);
      }
    }

    return results;
  }

  //@Authorized()
  @UseGuards(AuthGuard)
  @Query(() => [Hub])
  public async ownedHubs(@UserId() userId): Promise<Hub[]> {
    this.logger.log(this.ownedHubs.name);

    const user = await User.findOne({ id: userId });
    const ownedHubs = await user.ownedHubs();
    return ownedHubs;
  }

  //@Authorized()
  @UseGuards(AuthGuard)
  @Query(() => [Hub])
  public async memberOfHubs(@UserId() userId): Promise<Hub[]> {
    this.logger.log(this.memberOfHubs.name);

    const user = await User.findOne({ id: userId });
    const memberOfHubs = await user.memberOfHubs();
    return memberOfHubs;
  }

  //@Authorized()
  @UseGuards(AuthGuard)
  @Query(() => [Hub])
  public async starredHubs(@UserId() userId) {
    this.logger.log(this.starredHubs.name);

    const userHubRelationships = await JoinUserHub.find({
      where: {
        userId: userId,
        starred: true,
      },
      relations: ['hub'],
    });
    const hubs = [];
    for (let index = 0; index < userHubRelationships.length; index++) {
      const element = userHubRelationships[index];
      // element.starred = element.starred;
      element.starred = true;
      hubs.push(element.hub);
    }
    return hubs;
  }

  //@Authorized()
  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async deleteHub(
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
  ) {
    this.logger.log(this.deleteHub.name);

    const hub = await Hub.findOne({
      where: {
        id: hubId,
      },
      // relations: ["usersConnection"]
    });
    await hub.remove();
    return true;
  }

  //@Authorized()
  @UseGuards(AuthGuard)
  @Mutation(() => Hub)
  public async editHub(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
    @Args({ name: 'name', type: () => String }) name: string,
    @Args({ name: 'description', type: () => String }) description: string,
  ): Promise<Hub> {
    this.logger.log(this.editHub.name);

    const joinUserHubResult = await JoinUserHub.findOne({
      where: {
        userId: userId,
        hubId,
        isOwner: true,
      },
      relations: ['hub'],
    });

    let hub = joinUserHubResult.hub;
    hub.name = name;
    hub.description = description;
    hub = await hub.save();
    return hub;
  }

  //@Authorized()
  @UseGuards(AuthGuard)
  @Mutation(() => Hub)
  public async changeHubImage(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
    @Args({ name: 'newImage', type: () => String }) newImage: string,
  ): Promise<Hub> {
    this.logger.log(this.changeHubImage.name);

    const joinUserHubResult = await JoinUserHub.findOne({
      where: {
        userId: userId,
        hubId,
        isOwner: true,
      },
      relations: ['hub'],
    });

    let hub = joinUserHubResult.hub;

    if (hub.image) {
      await this.fileService.deletePublicImageFromUrl(hub.image);
    }
    const imageUrl = await this.fileService.storePublicImageFromBase64(
      newImage,
    );

    hub.image = imageUrl;
    hub = await hub.save();
    return hub;
  }

  //@Authorized()
  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async joinHub(
    @UserId() userId,
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<boolean> {
    this.logger.log(this.joinHub.name);

    let joinUserHub = await JoinUserHub.create({
      userId: userId,
      hubId: id,
      isOwner: true,
    });
    joinUserHub = await joinUserHub.save();

    return true;
  }

  //@Authorized()
  @UseGuards(AuthGuard)
  @Query(() => Hub)
  public async getHubByQRImage(
    @Args({ name: 'qrImageB64', type: () => String }) qrImageB64: string,
  ): Promise<Hub> {
    this.logger.log(this.getHubByQRImage.name);

    //FIXME: Finish implementing check that user is hub owner.

    const result = await this.qrService.scanQR(qrImageB64);
    if (result) {
      const id = result.id;
      const hub = await Hub.findOne({ id });
      return hub;
    }
  }

  //@Authorized()
  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async setHubStarred(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
  ) {
    this.logger.log(this.setHubStarred.name);

    const hubRelationship = await JoinUserHub.findOne({
      userId: userId,
      hubId: hubId,
    });
    hubRelationship.starred = true;
    await hubRelationship.save();
    return true;
  }

  //@Authorized()
  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async setHubNotStarred(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
  ) {
    this.logger.log(this.setHubNotStarred.name);

    const hubRelationship = await JoinUserHub.findOne({
      userId: userId,
      hubId: hubId,
    });
    hubRelationship.starred = false;
    await hubRelationship.save();
    return true;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async enteredHubGeofence(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
  ): Promise<boolean> {
    this.logger.log(this.enteredHubGeofence.name);

    let hubRelationship = await JoinUserHub.findOne({
      userId,
      hubId,
    });

    if (!hubRelationship)
      throw Error(
        `no corresponding hub relationship found for userId: ${userId} & hubId: ${hubId}`,
      );

    hubRelationship.isPresent = true;
    hubRelationship = await hubRelationship.save();

    return true;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async exitedHubGeofence(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
  ): Promise<boolean> {
    this.logger.log(this.exitedHubGeofence.name);

    let hubRelationship = await JoinUserHub.findOne({
      userId,
      hubId,
    });

    if (!hubRelationship)
      throw Error(
        `no corresponding hub relationship found for userId: ${userId} & hubId: ${hubId}`,
      );

    hubRelationship.isPresent = false;
    hubRelationship = await hubRelationship.save();

    return true;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Hub)
  public async activateHub(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
  ) {
    this.logger.log(this.activateHub.name);

    let hubRelationship = await JoinUserHub.findOne({
      where: {
        userId,
        hubId,
        isOwner: true,
      },
      relations: ['hub'],
    });

    if (!hubRelationship)
      throw Error(
        `no corresponding hub relationship found for userId: ${userId} & hubId: ${hubId}`,
      );

    let hub = hubRelationship.hub;
    hub.active = true;
    hub = await hub.save();

    const hubRelationships = await JoinUserHub.find({
      where: {
        hubId,
      },
      relations: ['hub'],
    });
    await this.hubService.notifyOfHubActivated(hubRelationships);

    return hub;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Hub)
  public async deactivateHub(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
  ) {
    this.logger.log(this.deactivateHub.name);

    let hubRelationship = await JoinUserHub.findOne({
      where: {
        userId,
        hubId,
        isOwner: true,
      },
      relations: ['hub'],
    });

    if (!hubRelationship)
      throw Error(
        `no corresponding hub relationship found for userId: ${userId} & hubId: ${hubId}`,
      );

    let hub = hubRelationship.hub;
    hub.active = false;
    hub = await hub.save();
    return hub;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => MicroChat)
  public async microChatToHub(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
    @Args({ name: 'microChatId', type: () => Int }) microChatId: number,
  ) {
    this.logger.log(this.microChatToHub.name);

    const user = await User.findOne(userId);
    const hub = await Hub.findOne({
      where: {
        id: hubId,
      },
      relations: ['usersConnection', 'usersConnection.user', 'microChats'],
    });
    const microChat = hub.microChats.find(x => x.id === microChatId);
    await this.hubService.microChatToHub(user, hub, microChat);
    return microChat;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => MicroChat)
  public async createMicroChat(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
    @Args({ name: 'microChatText', type: () => String }) microChatText: string,
  ) {
    this.logger.log(this.createMicroChat.name);

    const usersConnection = await JoinUserHub.findOne({
      where: {
        userId,
        hubId,
      },
      relations: ['user', 'hub', 'hub.microChats'],
    });

    if (!usersConnection) {
      this.logger.error(
        'No valid relationship found between user and hub for that action.',
      );
    }

    let microChat = new MicroChat();
    microChat.hubId = hubId;
    microChat.text = microChatText;
    microChat = await microChat.save();

    this.logger.log(
      `createMicroChat(userId: ${userId}, hubId: ${hubId}, microChatText: ${microChatText}) completed successfully.`,
    );

    return microChat;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Boolean)
  public async deleteMicroChat(
    @UserId() userId,
    @Args({ name: 'hubId', type: () => Int }) hubId: number,
    @Args({ name: 'microChatId', type: () => Int }) microChatId: number,
  ) {
    this.logger.log(this.deleteMicroChat.name);

    const usersConnection = await JoinUserHub.findOne({
      where: {
        userId,
        hubId,
      },
      relations: ['user', 'hub', 'hub.microChats'],
    });

    if (!usersConnection) {
      this.logger.error(
        'No valid relationship found between user and hub for that action.',
      );
    }

    const microChat = usersConnection.hub.microChats.find(
      x => x.id == microChatId,
    );
    await microChat.remove();

    this.logger.log(
      `deleteMicroChat(userId: ${userId}, hubId: ${hubId}, microChatId ${microChatId}) completed successfully.`,
    );

    return true;
  }
}
