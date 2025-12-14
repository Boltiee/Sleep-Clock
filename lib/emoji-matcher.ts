/**
 * Smart emoji matching library for suggesting relevant emojis based on text input
 */

interface EmojiMapping {
  keywords: string[]
  emoji: string
  category: string
}

// Comprehensive emoji-to-keyword mapping
const EMOJI_MAPPINGS: EmojiMapping[] = [
  // Hygiene & Personal Care
  { keywords: ['teeth', 'brush', 'dental', 'toothbrush'], emoji: '🪥', category: 'hygiene' },
  { keywords: ['shower', 'bath', 'wash', 'clean yourself'], emoji: '🚿', category: 'hygiene' },
  { keywords: ['soap', 'hand wash', 'sanitize'], emoji: '🧼', category: 'hygiene' },
  { keywords: ['toilet', 'bathroom', 'pee', 'poo'], emoji: '🚽', category: 'hygiene' },
  { keywords: ['hair', 'comb', 'brush hair'], emoji: '💇', category: 'hygiene' },
  { keywords: ['towel', 'dry'], emoji: '🧻', category: 'hygiene' },
  
  // Cleaning & Chores
  { keywords: ['clean', 'sweep', 'broom', 'floor'], emoji: '🧹', category: 'cleaning' },
  { keywords: ['vacuum', 'hoover'], emoji: '🧽', category: 'cleaning' },
  { keywords: ['dishes', 'wash dishes', 'plate'], emoji: '🍽️', category: 'cleaning' },
  { keywords: ['laundry', 'clothes', 'wash clothes'], emoji: '👕', category: 'cleaning' },
  { keywords: ['trash', 'garbage', 'bin', 'rubbish'], emoji: '🗑️', category: 'cleaning' },
  { keywords: ['tidy', 'organize', 'arrange'], emoji: '📦', category: 'cleaning' },
  { keywords: ['dust', 'wipe'], emoji: '🧽', category: 'cleaning' },
  
  // Plants & Garden
  { keywords: ['plant', 'water plant', 'garden'], emoji: '🌱', category: 'plants' },
  { keywords: ['flower', 'rose'], emoji: '🌸', category: 'plants' },
  { keywords: ['tree', 'outdoor'], emoji: '🌳', category: 'plants' },
  { keywords: ['pot', 'potted'], emoji: '🪴', category: 'plants' },
  
  // Food & Kitchen
  { keywords: ['cook', 'kitchen', 'prepare'], emoji: '🍳', category: 'food' },
  { keywords: ['eat', 'meal', 'dinner', 'lunch', 'breakfast'], emoji: '🍽️', category: 'food' },
  { keywords: ['fruit', 'apple'], emoji: '🍎', category: 'food' },
  { keywords: ['vegetable', 'carrot'], emoji: '🥕', category: 'food' },
  { keywords: ['drink', 'water', 'beverage'], emoji: '💧', category: 'food' },
  
  // Bedroom & Sleep
  { keywords: ['bed', 'make bed', 'bedroom'], emoji: '🛏️', category: 'bedroom' },
  { keywords: ['pillow'], emoji: '🛌', category: 'bedroom' },
  { keywords: ['blanket', 'cover'], emoji: '🧸', category: 'bedroom' },
  { keywords: ['closet', 'wardrobe', 'clothes'], emoji: '👔', category: 'bedroom' },
  
  // Living Areas
  { keywords: ['lounge', 'living room', 'sofa', 'couch'], emoji: '🛋️', category: 'living' },
  { keywords: ['room', 'space'], emoji: '🏠', category: 'living' },
  { keywords: ['window'], emoji: '🪟', category: 'living' },
  { keywords: ['door'], emoji: '🚪', category: 'living' },
  
  // Pets & Animals
  { keywords: ['pet', 'dog', 'puppy'], emoji: '🐕', category: 'pets' },
  { keywords: ['cat', 'kitty'], emoji: '🐈', category: 'pets' },
  { keywords: ['fish', 'aquarium'], emoji: '🐠', category: 'pets' },
  { keywords: ['bird'], emoji: '🐦', category: 'pets' },
  { keywords: ['feed pet', 'pet food'], emoji: '🦴', category: 'pets' },
  
  // School & Learning
  { keywords: ['homework', 'study', 'school'], emoji: '📚', category: 'school' },
  { keywords: ['read', 'book', 'reading'], emoji: '📖', category: 'school' },
  { keywords: ['write', 'writing'], emoji: '✏️', category: 'school' },
  { keywords: ['practice', 'exercise'], emoji: '📝', category: 'school' },
  
  // Activities & Hobbies
  { keywords: ['play', 'toy', 'game'], emoji: '🎮', category: 'activities' },
  { keywords: ['draw', 'art', 'paint'], emoji: '🎨', category: 'activities' },
  { keywords: ['music', 'instrument'], emoji: '🎵', category: 'activities' },
  { keywords: ['dance'], emoji: '💃', category: 'activities' },
  { keywords: ['sport', 'exercise', 'workout'], emoji: '⚽', category: 'activities' },
  
  // Technology
  { keywords: ['tablet', 'ipad'], emoji: '📱', category: 'tech' },
  { keywords: ['computer', 'laptop'], emoji: '💻', category: 'tech' },
  { keywords: ['tv', 'television', 'screen'], emoji: '📺', category: 'tech' },
  
  // General & Misc
  { keywords: ['help', 'assist', 'support'], emoji: '🤝', category: 'general' },
  { keywords: ['check', 'tick', 'done', 'complete'], emoji: '✓', category: 'general' },
  { keywords: ['star', 'favorite'], emoji: '⭐', category: 'general' },
  { keywords: ['heart', 'love'], emoji: '❤️', category: 'general' },
  { keywords: ['smile', 'happy'], emoji: '😊', category: 'general' },
  
  // Characters & Tonies (popular kids characters)
  { keywords: ['elsa', 'frozen', 'ice', 'snow'], emoji: '❄️', category: 'characters' },
  { keywords: ['anna', 'frozen'], emoji: '👸', category: 'characters' },
  { keywords: ['lightning', 'mcqueen', 'cars', 'race'], emoji: '🏎️', category: 'characters' },
  { keywords: ['dinosaur', 'dino', 't-rex'], emoji: '🦕', category: 'characters' },
  { keywords: ['princess'], emoji: '👑', category: 'characters' },
  { keywords: ['prince'], emoji: '🤴', category: 'characters' },
  { keywords: ['unicorn', 'magical'], emoji: '🦄', category: 'characters' },
  { keywords: ['dragon'], emoji: '🐉', category: 'characters' },
  { keywords: ['elephant', 'benjamin'], emoji: '🐘', category: 'characters' },
  { keywords: ['lion', 'simba'], emoji: '🦁', category: 'characters' },
  { keywords: ['creative', 'imagination'], emoji: '🎨', category: 'characters' },
  { keywords: ['fairy', 'magic'], emoji: '🧚', category: 'characters' },
  { keywords: ['pirate'], emoji: '🏴‍☠️', category: 'characters' },
  { keywords: ['superhero', 'hero'], emoji: '🦸', category: 'characters' },
  { keywords: ['space', 'rocket', 'astronaut'], emoji: '🚀', category: 'characters' },
  { keywords: ['mermaid', 'ariel'], emoji: '🧜', category: 'characters' },
]

/**
 * Normalize text for matching (lowercase, remove special chars)
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '')
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1)
  const s2 = normalizeText(str2)
  
  // Exact match
  if (s1 === s2) return 1.0
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.8
  
  // Word-based matching
  const words1 = s1.split(/\s+/)
  const words2 = s2.split(/\s+/)
  
  let matchCount = 0
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1 === w2 || w1.includes(w2) || w2.includes(w1)) {
        matchCount++
        break
      }
    }
  }
  
  if (matchCount > 0) {
    return 0.5 + (matchCount / Math.max(words1.length, words2.length)) * 0.3
  }
  
  // Levenshtein-like partial match
  let matches = 0
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matches++
  }
  
  return matches / Math.max(s1.length, s2.length) * 0.3
}

/**
 * Get emoji suggestions for given text
 * Returns up to maxSuggestions emojis, ordered by relevance
 */
export function getEmojiSuggestions(text: string, maxSuggestions: number = 5): string[] {
  if (!text || text.trim().length === 0) {
    return ['✓'] // Default fallback
  }
  
  const normalizedInput = normalizeText(text)
  
  // Score each emoji mapping
  const scored = EMOJI_MAPPINGS.map(mapping => {
    const scores = mapping.keywords.map(keyword => 
      calculateSimilarity(normalizedInput, keyword)
    )
    const maxScore = Math.max(...scores)
    
    return {
      emoji: mapping.emoji,
      score: maxScore,
      category: mapping.category
    }
  })
  
  // Sort by score (descending) and remove duplicates
  const sorted = scored
    .filter(item => item.score > 0.3) // Only include reasonable matches
    .sort((a, b) => b.score - a.score)
  
  // Remove duplicate emojis
  const unique = Array.from(new Set(sorted.map(item => item.emoji)))
  
  // Return top suggestions, or default if none found
  const suggestions = unique.slice(0, maxSuggestions)
  
  if (suggestions.length === 0) {
    return ['✓', '⭐', '✨', '🎯', '📌'] // Fallback suggestions
  }
  
  // Pad with generic emojis if we don't have enough
  while (suggestions.length < Math.min(maxSuggestions, 5)) {
    const fallbacks = ['✓', '⭐', '✨', '🎯', '📌', '💡', '🎈', '🌟', '💫', '🎪']
    const fallback = fallbacks.find(f => !suggestions.includes(f))
    if (fallback) suggestions.push(fallback)
    else break
  }
  
  return suggestions
}

/**
 * Get a single best emoji suggestion
 */
export function getBestEmoji(text: string): string {
  const suggestions = getEmojiSuggestions(text, 1)
  return suggestions[0] || '✓'
}
