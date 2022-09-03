import SongInfoTextSections from "@/components/SongInfoTextSections.vue";
import { mount } from "@vue/test-utils";
import { dataTestId } from "../utils";

test("SongInfoTextSections.vue", () => {
  const sections = [
    { name: "1 section", rows: ["1", "2", "3"] },
    { name: "2 section", rows: ["4", "5", "6"] },
    { name: "3 section", rows: ["7", "8", "9"] },
  ];
  const wrapper = mount(SongInfoTextSections, { props: { sections } });

  const result = wrapper.findAll(dataTestId("section")).map((section) => ({
    name: section.getByTestId("name").text(),
    rows: section.findAll(dataTestId("row")).map((row) => row.text()),
  }));
  expect(result).toStrictEqual(sections);
});
