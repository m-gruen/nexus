<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { emojiCategories } from '@/data/emoji-data';
import { Search, Clock, Smile, Cat, Coffee, Umbrella, Plane, Briefcase, Hash, Flag } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select', 'close']);

// State
const searchQuery = ref('');
const activeCategory = ref('recently-used');
const recentEmojis = ref<string[]>([]);
const pickerElement = ref<HTMLElement | null>(null);

// Load recent emojis from localStorage if available
onMounted(() => {
  const savedRecentEmojis = localStorage.getItem('recentEmojis');
  if (savedRecentEmojis) {
    try {
      recentEmojis.value = JSON.parse(savedRecentEmojis);
    } catch (e) {
      recentEmojis.value = [];
    }
  } else {
    recentEmojis.value = [];
  }
});

// Scroll to section when activeCategory changes
watch(activeCategory, (newCategory) => {
  if (!pickerElement.value) return;

  nextTick(() => {
    const element = document.getElementById(`emoji-category-${newCategory}`);
    if (element && pickerElement.value) {
      const container = pickerElement.value.querySelector('.emoji-categories');
      if (container) {
        container.scrollTo({
          top: element.offsetTop - 8,
          behavior: 'smooth'
        });
      }
    }
  });
});

// Filter emojis based on search query
const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    // Add Recently Used as the first category if there are any recent emojis
    const categories = [...emojiCategories];

    if (recentEmojis.value.length > 0) {
      categories.unshift({
        id: 'recently-used',
        name: 'Recently Used',
        emojis: recentEmojis.value.slice(0, 32) // Cap at 32 emojis (4 rows of 8)
      });
    }

    return categories;
  }

  const query = searchQuery.value.toLowerCase();

  return emojiCategories.map(category => {
    return {
      ...category,
      emojis: category.emojis.filter(emoji => {
        // This is a simplified search - in a real app you might want to search emoji names/keywords
        return emoji.includes(query);
      })
    };
  }).filter(category => category.emojis.length > 0);
});

// Handle selecting an emoji
const selectEmoji = (emoji: string) => {
  emit('select', emoji);

  // Add to recent emojis
  const updatedRecentEmojis = [
    emoji,
    ...recentEmojis.value.filter(e => e !== emoji)
  ].slice(0, 32); // Keep only the 32 most recent (4 rows of 8)

  recentEmojis.value = updatedRecentEmojis;
  localStorage.setItem('recentEmojis', JSON.stringify(updatedRecentEmojis));
};

// Function to set active category
const setActiveCategory = (categoryId: string) => {
  // Only allow setting active category if it exists
  if (categoryId === 'recently-used' && recentEmojis.value.length === 0) {
    // If trying to navigate to empty recently used, go to first available category
    activeCategory.value = 'smileys-people';
    return;
  }
  activeCategory.value = categoryId;
};

// Close when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (pickerElement.value && !pickerElement.value.contains(event.target as Node)) {
    emit('close');
  }
};

// Add/remove event listener for click outside
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
  }
});
</script>

<template>
  <div v-if="isOpen" ref="pickerElement"
    class="emoji-picker bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl p-0 absolute bottom-20 left-2 z-40 border border-indigo-900/40"
    style="width: 320px; max-height: 420px;">

    <!-- Search bar -->
    <div class="emoji-search p-2 border-b border-indigo-900/30 sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 z-10">
      <div class="relative">
        <Search class="absolute left-2 top-1/2 transform -translate-y-1/2 text-indigo-300/70 h-4 w-4" />
        <input v-model="searchQuery" type="text" placeholder="Search emoji"
          class="w-full pl-8 pr-3 py-2 rounded-md bg-slate-800/80 text-indigo-100 border border-indigo-500/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-sm placeholder:text-indigo-300/50" />
      </div>
    </div>

    <!-- Emoji categories -->
    <div class="emoji-categories overflow-y-auto" style="max-height: 330px;">
      <!-- Show "Nothing found" message when search returns no results -->
      <div v-if="searchQuery.trim() && filteredCategories.length === 0"
        class="flex flex-col items-center justify-center p-8 text-indigo-300/80 h-64">
        <span class="text-4xl mb-2">😔</span>
        <span class="text-sm">Nothing found</span>
      </div>

      <div v-for="category in filteredCategories" :key="category.id" :id="`emoji-category-${category.id}`">
        <div class="text-xs font-medium text-indigo-300/80 px-3 pt-3 pb-1 sticky top-0 bg-slate-800/95 z-10">
          {{ category.name }}
        </div>
        <div class="grid grid-cols-8 gap-1 p-2">
          <button v-for="emoji in category.emojis" :key="`${category.id}-${emoji}`"
            class="emoji-btn p-1 rounded hover:bg-indigo-900/30 focus:bg-indigo-900/50 text-xl transition-colors" 
            @click="selectEmoji(emoji)">
            {{ emoji }}
          </button>
        </div>
      </div>

      <!-- Add empty space filler to maintain consistent height when few results -->
      <div v-if="filteredCategories.length > 0 && filteredCategories.length < 3" class="empty-space"
        style="min-height: 100px;"></div>
    </div>

    <!-- Category navigation -->
    <div class="category-nav border-t border-indigo-900/30 p-1 flex justify-between bg-gradient-to-r from-slate-900 to-slate-800 sticky bottom-0">
      <button @click="setActiveCategory('recently-used')" class="emoji-nav-btn p-1.5 rounded hover:bg-indigo-900/30 transition-colors"
        :class="{ 'bg-indigo-900/50': activeCategory === 'recently-used', 'opacity-50': recentEmojis.length === 0 }"
        :disabled="recentEmojis.length === 0">
        <Clock class="h-4 w-4" :class="activeCategory === 'recently-used' ? 'text-indigo-100' : 'text-indigo-300/70'" />
      </button>
      <button @click="setActiveCategory('smileys-people')" class="emoji-nav-btn p-1.5 rounded hover:bg-indigo-900/30 transition-colors"
        :class="{ 'bg-indigo-900/50': activeCategory === 'smileys-people' }">
        <Smile class="h-4 w-4" :class="activeCategory === 'smileys-people' ? 'text-indigo-100' : 'text-indigo-300/70'" />
      </button>
      <button @click="setActiveCategory('animals-nature')" class="emoji-nav-btn p-1.5 rounded hover:bg-indigo-900/30 transition-colors"
        :class="{ 'bg-indigo-900/50': activeCategory === 'animals-nature' }">
        <Cat class="h-4 w-4" :class="activeCategory === 'animals-nature' ? 'text-indigo-100' : 'text-indigo-300/70'" />
      </button>
      <button @click="setActiveCategory('food-drink')" class="emoji-nav-btn p-1.5 rounded hover:bg-indigo-900/30 transition-colors"
        :class="{ 'bg-indigo-900/50': activeCategory === 'food-drink' }">
        <Coffee class="h-4 w-4" :class="activeCategory === 'food-drink' ? 'text-indigo-100' : 'text-indigo-300/70'" />
      </button>
      <button @click="setActiveCategory('activities')" class="emoji-nav-btn p-1.5 rounded hover:bg-indigo-900/30 transition-colors"
        :class="{ 'bg-indigo-900/50': activeCategory === 'activities' }">
        <Umbrella class="h-4 w-4" :class="activeCategory === 'activities' ? 'text-indigo-100' : 'text-indigo-300/70'" />
      </button>
      <button @click="setActiveCategory('travel-places')" class="emoji-nav-btn p-1.5 rounded hover:bg-indigo-900/30 transition-colors"
        :class="{ 'bg-indigo-900/50': activeCategory === 'travel-places' }">
        <Plane class="h-4 w-4" :class="activeCategory === 'travel-places' ? 'text-indigo-100' : 'text-indigo-300/70'" />
      </button>
      <button @click="setActiveCategory('objects')" class="emoji-nav-btn p-1.5 rounded hover:bg-indigo-900/30 transition-colors"
        :class="{ 'bg-indigo-900/50': activeCategory === 'objects' }">
        <Briefcase class="h-4 w-4" :class="activeCategory === 'objects' ? 'text-indigo-100' : 'text-indigo-300/70'" />
      </button>
      <button @click="setActiveCategory('symbols')" class="emoji-nav-btn p-1.5 rounded hover:bg-indigo-900/30 transition-colors"
        :class="{ 'bg-indigo-900/50': activeCategory === 'symbols' }">
        <Hash class="h-4 w-4" :class="activeCategory === 'symbols' ? 'text-indigo-100' : 'text-indigo-300/70'" />
      </button>
      <button @click="setActiveCategory('flags')" class="emoji-nav-btn p-1.5 rounded hover:bg-indigo-900/30 transition-colors"
        :class="{ 'bg-indigo-900/50': activeCategory === 'flags' }">
        <Flag class="h-4 w-4" :class="activeCategory === 'flags' ? 'text-indigo-100' : 'text-indigo-300/70'" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.emoji-btn {
  transition: background-color 0.2s;
  user-select: none;
}

.emoji-categories {
  scrollbar-width: thin;
  scrollbar-color: rgba(129, 140, 248, 0.4) transparent;
}

.emoji-categories::-webkit-scrollbar {
  width: 4px;
}

.emoji-categories::-webkit-scrollbar-track {
  background: transparent;
}

.emoji-categories::-webkit-scrollbar-thumb {
  background-color: rgba(129, 140, 248, 0.4);
  border-radius: 10px;
}
</style>
