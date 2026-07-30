// 枚举值的俄语展示标签(MVP 界面俄语,见蓝图第 0 节)

export const universityTypeRu: Record<string, string> = {
  COMPREHENSIVE: "Комплексный",
  SCIENCE_ENGINEERING: "Политехнический",
  NORMAL: "Педагогический",
  MEDICAL: "Медицинский",
  FINANCE_ECONOMICS: "Финансово-экономический",
  LANGUAGE: "Языковой",
  AGRICULTURE_FORESTRY: "Аграрный",
  ARTS: "Искусств",
  OTHER: "Другой",
};

export const degreeLevelRu: Record<string, string> = {
  LANGUAGE: "Языковые курсы",
  PREP: "Подготовительный факультет",
  BACHELOR: "Бакалавриат",
  MASTER: "Магистратура",
  PHD: "Аспирантура (PhD)",
  NON_DEGREE: "Краткосрочная программа",
};

export const teachingLanguageRu: Record<string, string> = {
  chinese: "китайский",
  english: "английский",
  russian: "русский",
};

export const scholarshipTypeRu: Record<string, string> = {
  CSC: "CSC (правительство КНР)",
  PROVINCIAL: "Провинциальная",
  UNIVERSITY: "Университетская",
  OTHER: "Другая",
};
