import type {
  ArrayLocale,
  BooleanLocale,
  DateLocale,
  LocaleObject,
  MixedLocale,
  NumberLocale,
  ObjectLocale,
  StringLocale,
} from "yup/lib/locale";
import type { ChordsSection } from "./client";

export const sectionsTranslations: Record<ChordsSection.name, string> = {
  Acapella: "Акапелла",
  Breakdown: "Брейкдаун",
  Bridge: "Бридж",
  "Bridge 1": "Бридж 1",
  "Bridge 2": "Бридж 2",
  "Bridge 3": "Бридж 3",
  "Bridge 4": "Бридж 4",
  Chorus: "Припев",
  "Chorus 1": "Припев 1",
  "Chorus 2": "Припев 2",
  "Chorus 3": "Припев 3",
  "Chorus 4": "Припев 4",
  Ending: "Концовка",
  Exhortation: "Увещевание",
  Instrumental: "Инструментал",
  Interlude: "Интерлюдия",
  Intro: "Интро",
  Outro: "Аутро",
  "Post Chorus": "После припева",
  "Pre Chorus": "Предприпев",
  "Pre Chorus 1": "Предприпев 1",
  "Pre Chorus 2": "Предприпев 2",
  "Pre Chorus 3": "Предприпев 3",
  "Pre Chorus 4": "Предприпев 4",
  Rap: "Рэп",
  Refrain: "Рефрен",
  Solo: "Соло",
  Tag: "Тег",
  Turnaround: "Поворот",
  Vamp: "Остинато",
  Verse: "Куплет",
  "Verse 1": "Куплет 1",
  "Verse 2": "Куплет 2",
  "Verse 3": "Куплет 3",
  "Verse 4": "Куплет 4",
  "Verse 5": "Куплет 5",
  "Verse 6": "Куплет 6",
};

const defaultWrong = "поле неверно заполнено";

const mixed: Required<MixedLocale> = {
  default: defaultWrong,
  required: "это обязательное поле",
  oneOf: "это поле должно быть одним из: ${values}",
  notOneOf: "поле не должно быть одним из: ${values}",
  notType: defaultWrong,
  defined: "поле должно быть заполнено",
};

const string: Required<StringLocale> = {
  length: "поле должно иметь длину ${length}",
  min: "поле должно быть не короче ${min}",
  max: "поле не должно быть длиннее ${max}",
  matches: defaultWrong,
  email: "поле должно быть настоящим email",
  url: "поле ${path} должно быть настоящей ссылкой",
  uuid: defaultWrong,
  trim: defaultWrong,
  lowercase: "поле должно быть с маленькой буквы",
  uppercase: "поле должно быть с большой буквы",
};

const number: Required<NumberLocale> = {
  min: "поле должно быть больше или равно ${min}",
  max: "поле должно быть меньше или равно ${max}",
  lessThan: "поле должно быть меньше ${less}",
  moreThan: "поле должно быть больше ${more}",
  positive: "поле должно быть положительным числом",
  negative: "поле должно быть негативным числом",
  integer: "поле должно быть целым числом",
};

const date: Required<DateLocale> = {
  min: "поле должно быть позже ${min}",
  max: "поле должно быть раньше ${max}",
};

const boolean: BooleanLocale = {
  isValue: "поле должно иметь значение ${value}",
};

const object: Required<ObjectLocale> = {
  noUnknown: defaultWrong,
};

const array: Required<ArrayLocale> = {
  min: "поле должно иметь минимум ${min} элементов",
  max: "поле должно иметь меньше или равно ${max} элементов",
  length: "поле должно иметь ${length} элементов",
};

export const yupRu: LocaleObject = {
  mixed,
  string,
  number,
  date,
  boolean,
  object,
  array,
};
