export const QUESTION_TYPE_MAP = {
  "Multiple Choice":          "MULTIPLE_CHOICE",
  "Short Answer":             "SHORT_ANSWER",
  "Fill in the blank":        "FILL_IN_THE_BLANK",
  "True / False / Not Given": "TRUE_FALSE_NOT_GIVEN",
  "Yes / No / Not Given":     "YES_NO_NOT_GIVEN",
  "Heading Matching":         "HEADING_MATCHING",
  "Matching":                 "MATCHING",
  "Sentence Completion":      "SENTENCE_COMPLETION",
  "Summary Completion":       "SUMMARY_COMPLETION",
  "Table Completion":         "TABLE_COMPLETION",
  "Note Completion":          "NOTE_COMPLETION",
  "Form Completion":          "FORM_COMPLETION",
  "Map / Diagram Labeling":   "MAP_LABELING",
};

export const QUESTION_TYPE_DISPLAY = Object.fromEntries(
  Object.entries(QUESTION_TYPE_MAP).map(([k, v]) => [v, k])
);

export const QUESTION_TYPE_OPTIONS = Object.keys(QUESTION_TYPE_MAP);
