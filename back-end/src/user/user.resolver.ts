import { Logger, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserId } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/guards/authguard.service';
import { User } from '../dal/entity/user.entity';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  private logger = new Logger(UserResolver.name, true);

  constructor(private userService: UserService) {
    this.logger.log('constructor');
  }

  @UseGuards(AuthGuard)
  @Query(() => User, { nullable: true })
  public async me(@UserId() userId): Promise<User> {
    this.logger.log(this.me.name);
    return await this.userService.getUser(userId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User)
  public async editUserDetails(
    @UserId() userId,
    @Args({ name: 'firstName', type: () => String }) firstName: string,
    @Args({ name: 'lastName', type: () => String }) lastName: string,
    @Args({ name: 'description', type: () => String }) description: string,
  ): Promise<User> {
    this.logger.log(this.editUserDetails.name);
    const user = await this.userService.editUserDetails(userId, {
      firstName,
      lastName,
      description,
    });
    return user;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User)
  public async changeEmail(
    @UserId() userId,
    @Args({ name: 'newEmail', type: () => String }) newEmail: string,
  ): Promise<User> {
    this.logger.log(this.changeEmail.name);
    const user = await this.userService.changeEmail(userId, newEmail);
    return user;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => User)
  public async changeUserImage(
    @UserId() userId,
    @Args({ name: 'newImage', type: () => String }) newImage: string,
  ): Promise<User> {
    this.logger.log(this.changeUserImage.name);
    const user = await this.userService.changeUserImage(userId, newImage);
    return user;
  }
}
