import { getUserService } from "@/services/user";
import { mockUser, mockUserAdd, mockUserAPI } from "../fixtures";

test("all and fetch", async () => {
  const all = vi.fn(async () => ({ value: [mockUser] }));
  const service = getUserService(mockUserAPI({ all }));

  expect(await service.fetch()).toBeUndefined();
  expect(await service.fetch()).toBeUndefined();
  expect(all).toHaveBeenCalledOnce();
  expect(service.all.value).toStrictEqual([mockUser]);
});

describe("add", () => {
  test("passes", async () => {
    const add = vi.fn(async () => ({ value: mockUser }));
    const service = getUserService(mockUserAPI({ add }));
    const result = await service.add(mockUserAdd);

    expect(result).toStrictEqual(mockUser);
    expect(add).toHaveCalls([mockUserAdd]);
    expect(service.all.value).toStrictEqual([mockUser]);
  });

  test("fails", async () => {
    const service = getUserService(mockUserAPI({ add: async () => undefined }));
    const result = await service.add(mockUserAdd);

    expect(result).toBeUndefined();
    expect(service.all.value).toStrictEqual([]);
  });
});

describe("delete", () => {
  const add = async () => ({ value: mockUser });

  test.each([true, false])("passes", async (createUser) => {
    const deleteSong = vi.fn(async () => ({ value: undefined }));
    const service = getUserService(mockUserAPI({ add, delete: deleteSong }));
    if (createUser) await service.add(mockUserAdd);
    const result = await service.delete(mockUser.username);

    expect(result).toBeTruthy();
    expect(deleteSong).toHaveCalls([mockUser.username]);
    expect(service.all.value).toStrictEqual([]);
  });

  test("fails", async () => {
    const service = getUserService(
      mockUserAPI({ add, delete: async () => undefined })
    );
    await service.add(mockUserAdd);
    const result = await service.delete(mockUser.username);

    expect(result).toBeFalsy();
    expect(service.all.value).toStrictEqual([mockUser]);
  });
});

describe("updatePassword", () => {
  test("passes", async () => {
    const updatePassword = vi.fn(async () => ({ value: mockUser }));
    const service = getUserService(mockUserAPI({ updatePassword }));
    const result = await service.updatePassword(
      mockUser.username,
      mockUserAdd.password
    );

    expect(result).toStrictEqual(mockUser);
    expect(updatePassword).toHaveCalls([
      mockUser.username,
      { password: mockUserAdd.password },
    ]);
    expect(service.all.value).toStrictEqual([mockUser]);
  });

  test("fails", async () => {
    const service = getUserService(
      mockUserAPI({ updatePassword: async () => undefined })
    );
    const result = await service.updatePassword(
      mockUser.username,
      mockUserAdd.password
    );

    expect(result).toBeUndefined();
    expect(service.all.value).toStrictEqual([]);
  });
});
