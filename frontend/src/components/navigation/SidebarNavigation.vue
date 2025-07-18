<script setup lang="ts">
import { defineEmits, ref, onMounted } from 'vue'
import { Home, Search, Settings, ChevronRight, ChevronLeft, UserPlus, MessageCircle } from "lucide-vue-next"
import NexusLogo from './NexusLogo.vue'

// Define props directly with defineProps (no need to assign to a variable)
defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-collapsed', 'toggle-contacts', 'toggle-requests', 'toggle-search', 'toggle-settings', 'home-clicked'])

// Track which item is active
const activeItem = ref('')

const items = [
  { id: 'home', title: "Home", url: "#", icon: Home, action: () => {
    activeItem.value = 'home'
    emit('home-clicked')
  }},
  { id: 'contacts', title: "Contacts", url: "#", icon: MessageCircle, action: () => {
    activeItem.value = 'contacts'
    emit('toggle-contacts')
  }},
  { id: 'requests', title: "Requests", url: "#", icon: UserPlus, action: () => {
    activeItem.value = 'requests'
    emit('toggle-requests')
  }},
  { id: 'search', title: "Search", url: "#", icon: Search, action: () => {
    activeItem.value = 'search'
    emit('toggle-search')
  }},
  { id: 'settings', title: "Settings", url: "#", icon: Settings, action: () => {
    activeItem.value = 'settings'
    emit('toggle-settings')
  }},
];

function toggleSidebar() {
  emit('toggle-collapsed')
}

// Initialize the first item as active or set based on props
onMounted(() => {
  activeItem.value = 'home'
})
</script>

<template>
  <aside :class="[
    'fixed inset-y-0 left-0 z-20 transition-all duration-300 ease-in-out border-r border-border',
    'bg-gradient-to-b from-slate-50 to-sidebar dark:from-slate-900/50 dark:to-sidebar',
    collapsed ? 'w-16' : 'w-[var(--sidebar-width)]'
  ]"
  :data-collapsed="collapsed">
    <!-- Toggle Sidebar Button -->
    <button @click="toggleSidebar"
      class="absolute -right-3 top-5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full p-1 shadow-lg z-50 hover:shadow-indigo-300/40 dark:hover:shadow-indigo-700/30 transition-all duration-200"
      id="sidebar-toggle"
      :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
      <ChevronLeft v-if="!collapsed" class="h-4 w-4" />
      <ChevronRight v-else class="h-4 w-4" />
    </button>

    <div class="flex h-full flex-col">
      <!-- App Logo/Header -->
      <div class="p-4 flex justify-center items-center border-b border-border/50">
        <NexusLogo :collapsed="collapsed" />
      </div>

      <div class="p-2">
        <div class="relative w-full min-w-0 flex-col">
          <!-- Navigation Items -->
          <ul class="flex w-full min-w-0 flex-col gap-1.5 mt-2">
            <li v-for="item in items" :key="item.id" class="relative">
              <a 
                :href="item.url" 
                @click.prevent="item.action ? item.action() : null" 
                :title="item.title"
                :data-tooltip="item.title"
                :class="[
                  'flex items-center overflow-hidden rounded-lg text-left transition-all duration-200',
                  collapsed ? 'px-0 py-3 justify-center' : 'px-3 py-2.5 gap-3',
                  activeItem === item.id 
                    ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                ]"
              >
                <component 
                  :is="item.icon" 
                  :class="[
                    'flex-shrink-0 transition-all',
                    collapsed ? 'h-6 w-6' : 'h-5 w-5',
                    activeItem === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                  ]" 
                />
                <span :class="[
                  'transition-opacity duration-300 truncate',
                  collapsed ? 'opacity-0 w-0' : 'opacity-100'
                ]">
                  {{ item.title }}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Tooltip animation */
[data-tooltip] {
  position: relative;
}

[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  opacity: 0;
  left: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(-10px);
  background-color: hsl(var(--popover));
  color: hsl(var(--popover-foreground));
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  z-index: 50;
  margin-left: 0.75rem;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  transition: all 0.2s ease;
}

[data-collapsed=true] [data-tooltip]:hover::after {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

/* Fix for icon alignment in collapsed mode */
[data-collapsed=true] a {
  display: flex;
  justify-content: center;
  width: 100%;
}

[data-collapsed=true] a svg {
  margin: 0 auto;
}
</style>
