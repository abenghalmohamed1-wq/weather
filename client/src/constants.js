export const LANGUAGES = [
  { code: 'en',     label: 'English',  flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr',     label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar',     label: 'العربية',  flag: '🇲🇦', dir: 'rtl' },
  { code: 'darija', label: 'دارجة',    flag: '🇲🇦', dir: 'rtl' },
]

export const GREETINGS = {
  en:     "Hello! 👋 I'm your AI Weather Assistant. Ask me about current, forecast, or past weather — try *\"What was the weather in Paris on Jan 15, 2023?\"*",
  fr:     "Bonjour! 👋 Je suis votre assistant météo IA. Demandez-moi la météo actuelle, future ou passée.",
  ar:     "مرحبا! 👋 أنا مساعدك في الأرصاد الجوية. اسألني عن الطقس الحالي أو المستقبلي أو التاريخي.",
  darija: "السلام عليكم! 👋 أنا مساعدك فالطقس. سوالني على طقس اليوم ولا نهار معين فالماضي.",
}

export const PLACEHOLDERS = {
  en:     'Ask about weather… e.g. "What was the weather in Casablanca on March 10, 2024?"',
  fr:     'Posez votre question… ex: "Quel temps faisait-il à Paris le 15 janvier 2023?"',
  ar:     'اسأل عن الطقس… مثلاً: "كيف كان الطقس في الدار البيضاء في 10 مارس 2024؟"',
  darija: 'سوال على الطقس… مثلاً: "كيفاش كان الطقس فالدار البيضاء في 10 مارس 2024؟"',
}

export const SUGGESTION_CHIPS = {
  en: [
    "What's the weather in Casablanca now?",
    "Will it rain in Marrakech tomorrow?",
    "Weather in Paris on Jan 15, 2023",
    "How cold was Cairo last December?",
  ],
  fr: [
    "Météo à Casablanca maintenant",
    "Pluie à Marrakech demain?",
    "Météo Paris 15 janvier 2023",
    "Froid au Caire en décembre?",
  ],
  ar: [
    "طقس الدار البيضاء الآن",
    "هل ستمطر في مراكش غداً؟",
    "طقس باريس 15 يناير 2023",
    "برد القاهرة في ديسمبر؟",
  ],
  darija: [
    "واش كاين شمس فالدار البيضاء دابا؟",
    "غادي يشتا فمراكش غدا؟",
    "كيفاش كان الطقس فباريس 15 يناير 2023",
    "واش كان برد فالقاهرة ديسمبر؟",
  ],
}
