export type GuideRow = [glyph: string, reading: string, example?: string]

export const vowels: GuideRow[] = [
  ['অ', 'a'], ['আ', 'ā'], ['ই', 'i'], ['ঈ', 'ī'], ['উ', 'u'], ['ঊ', 'ū'],
  ['এ', 'e'], ['ঐ', 'oi'], ['ও', 'o'], ['ঔ', 'ou'],
]

export const vowelSigns: GuideRow[] = [
  ['া', 'ā', 'কা kā'], ['ি', 'i', 'কি ki'], ['ী', 'ī', 'কী kī'], ['ু', 'u', 'কু ku'], ['ূ', 'ū', 'কূ kū'], ['ো', 'o', 'কো ko'], ['ে', 'e', 'কে ke'],
]

export const consonants: GuideRow[] = [
  ['ক', 'k', 'খুলনা'], ['খ', 'kh', 'খুলনা'], ['গ', 'g'], ['ঘ', 'gh'], ['ঙ', 'ng'],
  ['চ', 'ch', 'চট্টগ্রাম'], ['ছ', 'chh'], ['জ', 'j'], ['ঝ', 'jh'], ['ঞ', 'ñ'],
  ['ট', 'ṭ'], ['ঠ', 'ṭh'], ['ড', 'ḍ'], ['ঢ', 'ḍh'], ['ণ', 'ṇ'],
  ['ত', 't'], ['থ', 'th'], ['দ', 'd'], ['ধ', 'dh'], ['ন', 'n'],
  ['প', 'p'], ['ফ', 'ph', 'ফেনী'], ['ব', 'b'], ['ভ', 'bh'], ['ম', 'm'],
  ['য/য়', 'y'], ['র', 'r'], ['ল', 'l'], ['শ/ষ/স', 'ś/ṣ/s'], ['হ', 'h'],
]

export const suffixNotes = [
  'পুর/-পুর (pur) … 町・都市（Faridpur 等）',
  'গঞ্জ/-গঞ্জ (ganj) … 市・マーケット起源（Narayanganj 等）',
  "বাজার (bāzār) … 市場（Cox's Bazar）",
]

export const variants = [
  'Chattogram ↔ Chittagong',
  'Bogura ↔ Bogra',
  'Barishal ↔ Barisal',
  'Jashore ↔ Jessore',
]

export function getGuideData() {
  return { vowels, vowelSigns, consonants, suffixNotes, variants }
}
