// Define a generic Dictionary type to represent any nested JSON structure
export type Dictionary = Record<string, any>;

// Define the dictionaries object with generic Dictionary type
const dictionaries: Record<string, () => Promise<Dictionary>> = {
    en: () => import("./locales/en.json").then((r) => r.default),
    du: () => import("./locales/du.json").then((r) => r.default)
};

// Define getDictionary with stricter typing for `lang`
export const getDictionary = (lang: keyof typeof dictionaries): Promise<Dictionary> => {
    const loadDictionary = dictionaries[lang];
    if (loadDictionary) {
        return loadDictionary();
    } else {
        throw new Error(`Dictionary for language '${lang}' not found.`);
    }
};
