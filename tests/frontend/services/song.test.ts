import { getSongService } from "@/services/song";
import { mockSong, mockSongAPI, mockSongNoKey } from "../fixtures";

test("all and fetch", async () => {
  const all = vi.fn(async () => [mockSong]);
  const service = getSongService(mockSongAPI({ all }));

  expect(await service.fetch()).toBeUndefined();
  expect(await service.fetch()).toBeUndefined();
  expect(all).toBeCalledTimes(1);
  expect(service.all.value).toStrictEqual([mockSong]);
});

test("get", async () => {
  const all = async () => [mockSong];
  const service = getSongService(mockSongAPI({ all }));
  await service.fetch();

  expect(service.get(mockSong.key)).toStrictEqual(mockSong);
  expect(service.get("whatever")).toBeUndefined();
});

describe("add", () => {
  test("passes", async () => {
    const add = vi.fn(async () => ({ value: mockSong }));
    const service = getSongService(mockSongAPI({ add }));
    const result = await service.add(mockSongNoKey);

    expect(result).toStrictEqual(mockSong);
    expect(add).toHaveCalls([mockSongNoKey]);
    expect(service.all.value).toStrictEqual([mockSong]);
  });

  test("fails", async () => {
    const service = getSongService(mockSongAPI({ add: async () => undefined }));
    const result = await service.add(mockSongNoKey);

    expect(result).toBeUndefined();
    expect(service.all.value).toStrictEqual([]);
  });
});

describe("update", () => {
  test("passes", async () => {
    const update = vi.fn(async () => ({ value: mockSong }));
    const service = getSongService(mockSongAPI({ update }));
    const result = await service.update(mockSong);

    expect(result).toStrictEqual(mockSong);
    expect(update).toHaveCalls([mockSong.key, mockSong]);
    expect(service.all.value).toStrictEqual([mockSong]);
  });

  test("fails", async () => {
    const service = getSongService(
      mockSongAPI({ update: async () => undefined })
    );
    const result = await service.update(mockSong);

    expect(result).toBeUndefined();
    expect(service.all.value).toStrictEqual([]);
  });
});

describe("delete", () => {
  const add = async () => ({ value: mockSong });

  test.each([true, false])("passes", async (createSong) => {
    const deleteSong = vi.fn(async () => ({ value: undefined }));
    const service = getSongService(mockSongAPI({ add, delete: deleteSong }));
    if (createSong) await service.add(mockSongNoKey);
    const result = await service.delete(mockSong.key);

    expect(result).toBeTruthy();
    expect(deleteSong).toHaveCalls([mockSong.key]);
    expect(service.all.value).toStrictEqual([]);
  });

  test("fails", async () => {
    const service = getSongService(
      mockSongAPI({ add, delete: async () => undefined })
    );
    await service.add(mockSongNoKey);
    const result = await service.delete(mockSong.key);

    expect(result).toBeFalsy();
    expect(service.all.value).toStrictEqual([mockSong]);
  });
});
