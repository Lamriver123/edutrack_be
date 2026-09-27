import { UsersService } from './users.service';
import { UserSchema } from './schemas/user.schema';

jest.mock('@nestjs/config', () => ({ ConfigService: class {} }));

const USER_ID = '68cf00000000000000000001';
const subscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/device-token',
  keys: { p256dh: 'B'.repeat(87), auth: 'A'.repeat(22) },
};

function createService() {
  const exec = jest.fn().mockResolvedValue({ matchedCount: 1 });
  const readExec = jest
    .fn()
    .mockResolvedValue({ pushSubscriptions: [subscription] });
  const select = jest.fn().mockReturnValue({ exec: readExec });
  const model = {
    updateOne: jest.fn().mockReturnValue({ exec }),
    findById: jest.fn().mockReturnValue({ select }),
  };
  return {
    service: new UsersService(
      model as never,
      {} as never,
      {} as never,
      {} as never,
    ),
    model,
    select,
    exec,
    readExec,
  };
}

describe('UsersService push subscription persistence', () => {
  it('explicitly selects hidden push subscriptions without selecting auth secrets', async () => {
    const { service, model, select } = createService();
    expect(UserSchema.path('pushSubscriptions').options.select).toBe(false);
    await expect(service.getPushSubscriptions(USER_ID)).resolves.toEqual([
      subscription,
    ]);
    expect(model.findById).toHaveBeenCalledWith(USER_ID);
    expect(select).toHaveBeenCalledWith('_id +pushSubscriptions');
  });

  it('upserts a device with an atomic replacement pipeline so renewed keys persist', async () => {
    const { service, model } = createService();
    await expect(
      service.addPushSubscription(USER_ID, subscription),
    ).resolves.toEqual({ success: true });
    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: USER_ID },
      [
        {
          $set: {
            pushSubscriptions: {
              $concatArrays: [
                {
                  $filter: {
                    input: { $ifNull: ['$pushSubscriptions', []] },
                    as: 'subscription',
                    cond: {
                      $ne: ['$$subscription.endpoint', subscription.endpoint],
                    },
                  },
                },
                { $literal: [subscription] },
              ],
            },
          },
        },
      ],
      { updatePipeline: true },
    );
    expect(model.findById).not.toHaveBeenCalled();
  });

  it('removes only one owned endpoint atomically, preserving other devices', async () => {
    const { service, model } = createService();
    await expect(
      service.removePushSubscription(USER_ID, subscription.endpoint),
    ).resolves.toEqual({ success: true });
    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: USER_ID },
      { $pull: { pushSubscriptions: { endpoint: subscription.endpoint } } },
    );
    expect(model.findById).not.toHaveBeenCalled();
  });

  it('returns not found when the authenticated account no longer exists', async () => {
    const { service, exec, readExec } = createService();
    exec.mockResolvedValue({ matchedCount: 0 });
    readExec.mockResolvedValue(null);
    await expect(
      service.addPushSubscription(USER_ID, subscription),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      service.removePushSubscription(USER_ID, subscription.endpoint),
    ).rejects.toMatchObject({ status: 404 });
    await expect(service.getPushSubscriptions(USER_ID)).rejects.toMatchObject({
      status: 404,
    });
  });
});
