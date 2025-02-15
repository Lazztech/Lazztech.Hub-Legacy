import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/dal/entity/user.entity';
import { Repository } from 'typeorm';
import { PushNotificationDto } from './dto/pushNotification.dto';
import { InAppNotificationDto } from './dto/inAppNotification.dto';
import { InAppNotification } from 'src/dal/entity/inAppNotification.entity';
import { JoinUserInAppNotifications } from 'src/dal/entity/joinUserInAppNotifications.entity';
import { HttpService, HttpModule } from '@nestjs/common';
import { of } from 'rxjs';
import configuration from 'src/config/configuration';
import { UserDevice } from 'src/dal/entity/userDevice.entity';

describe('NotificationService', () => {
  let service: NotificationService;
  let userRepo: Repository<User>;
  let inAppNotificationRepo: Repository<InAppNotification>;
  let joinUserInAppNotificationRepo: Repository<JoinUserInAppNotifications>;
  let httpService: HttpService;
  let userDeviceRepo: Repository<UserDevice>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
          isGlobal: true,
        }),
        HttpModule,
      ],
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(InAppNotification),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(JoinUserInAppNotifications),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserDevice),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    inAppNotificationRepo = module.get<Repository<InAppNotification>>(
      getRepositoryToken(InAppNotification),
    );
    joinUserInAppNotificationRepo = module.get<
      Repository<JoinUserInAppNotifications>
    >(getRepositoryToken(JoinUserInAppNotifications));
    httpService = module.get(HttpService);
    userDeviceRepo = module.get<Repository<UserDevice>>(
      getRepositoryToken(UserDevice),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should resolve for addUserFcmNotificationToken', async () => {
    // Arrange
    const userId = 1;
    const token = 'asdfasdf';
    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce({
      id: userId,
      userDevices: Promise.resolve([
        {
          fcmPushUserToken: 'otherToken',
        },
      ]),
    } as User);
    const saveCall = jest
      .spyOn(userDeviceRepo, 'save')
      .mockResolvedValueOnce({} as UserDevice);
    // Act
    await service.addUserFcmNotificationToken(userId, token);
    // Assert
    expect(saveCall).toHaveBeenCalled();
  });

  it('should return for getInAppNotifications', async () => {
    // TODO
    // Arrange
    const userId = 1;
    jest.spyOn(joinUserInAppNotificationRepo, 'find').mockResolvedValueOnce([
      {
        userId,
        inAppNotification: Promise.resolve({
          text: 'test',
        }),
      },
      {
        userId,
        inAppNotification: Promise.resolve({
          text: 'test',
        }),
      },
    ] as JoinUserInAppNotifications[]);
    const expectedResult = [
      {
        text: 'test',
      },
      {
        text: 'test',
      },
    ] as InAppNotification[];
    // Act
    const result = await service.getInAppNotifications(userId);
    // Assert
    expect(result).toEqual(expectedResult);
  });

  it('should save for addInAppNotificationForUser', async () => {
    // Arrange
    const userId = 1;
    const details = {
      text: 'text',
      date: Date.now().toString(),
    } as InAppNotificationDto;
    jest
      .spyOn(inAppNotificationRepo, 'create')
      .mockReturnValueOnce(details as InAppNotification);
    const saveCall1 = jest
      .spyOn(inAppNotificationRepo, 'save')
      .mockResolvedValueOnce({
        id: 1,
        text: details.text,
        date: details.date,
      } as InAppNotification);
    jest.spyOn(joinUserInAppNotificationRepo, 'create').mockReturnValueOnce({
      userId,
      inAppNotificationId: 1,
    } as JoinUserInAppNotifications);
    const saveCall2 = jest
      .spyOn(joinUserInAppNotificationRepo, 'save')
      .mockResolvedValueOnce({
        userId,
        inAppNotificationId: 1,
      } as JoinUserInAppNotifications);
    // Act
    await service.addInAppNotificationForUser(userId, details);
    // Assert
    expect(saveCall1).toHaveBeenCalled();
    expect(saveCall2).toHaveBeenCalled();
  });

  it('should resolve for deleteInAppNotification', async () => {
    // Arrange
    const userId = 1;
    const inAppNotificationId = 1;
    jest.spyOn(joinUserInAppNotificationRepo, 'findOne').mockResolvedValueOnce({
      userId,
      inAppNotificationId,
    } as JoinUserInAppNotifications);
    const removeCall = jest
      .spyOn(joinUserInAppNotificationRepo, 'remove')
      .mockResolvedValueOnce({} as JoinUserInAppNotifications);
    // Act
    await service.deleteInAppNotification(userId, inAppNotificationId);
    // Assert
    expect(removeCall).toHaveBeenCalled();
  });

  it('should resolve for deleteAllInAppNotifications', async () => {
    // Arrange
    const userId = 1;
    jest.spyOn(joinUserInAppNotificationRepo, 'find').mockResolvedValueOnce([
      {
        userId,
      },
      {
        userId,
      },
      {
        userId,
      },
    ] as JoinUserInAppNotifications[]);
    const removeCall = jest
      .spyOn(joinUserInAppNotificationRepo, 'remove')
      .mockResolvedValueOnce({} as JoinUserInAppNotifications);
    // Act
    await service.deleteAllInAppNotifications(userId);
    // Assert
    expect(removeCall).toHaveBeenCalled();
  });

  it('sendPushToUser should sendPushNotification to each device fcmToken', async () => {
    // Arrange
    const userId = 1;
    const testNotification = {
      title: 'Test Title',
      body: 'Test Body',
      click_action: '',
    } as PushNotificationDto;
    const testUser = {
      id: userId,
      userDevices: Promise.resolve([
        {
          id: 1,
          fcmPushUserToken: 'token1',
        },
        {
          id: 2,
          fcmPushUserToken: 'token2',
        },
        {
          id: 3,
          fcmPushUserToken: 'token3',
        },
      ]),
    } as User;
    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(testUser);
    const sendPushNotification = jest
      .spyOn(httpService, 'post')
      .mockImplementationOnce(() => of(null));
    // Act
    await service.sendPushToUser(userId, testNotification);
    // Assert
    expect(sendPushNotification).toHaveBeenCalledTimes(3);
  });
});
