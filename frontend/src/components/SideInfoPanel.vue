<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps({
  activePanelType: {
    type: String,
    required: true,
    validator: (value: string) => ['search', 'requests', 'contacts', 'none'].includes(value)
  }
});

// State for collapsible tips section
const showTips = ref(false);

// Reset showTips when panel type changes
watch(() => props.activePanelType, () => {
  // Auto-collapse tips when panel changes
  showTips.value = false;
});

const panelTitle = computed(() => {
  switch (props.activePanelType) {
    case 'search':
      return 'Finding New Contacts';
    case 'requests':
      return 'Contact Requests';
    case 'contacts':
      return 'Your Secure Connections';
    default:
      return 'Welcome to Nexus';
  }
});

const panelDescription = computed(() => {
  switch (props.activePanelType) {
    case 'search':
      return 'Search for users by their username to connect with them securely on Nexus. Adding contacts is the first step to encrypted communication.';
    case 'requests':
      return 'Review and manage incoming contact requests from other users. Accept requests from people you know and trust.';
    case 'contacts':
      return 'Select a contact to start a secure, end-to-end encrypted conversation. Your messages are protected and only visible to you and your contact.';
    default:
      return 'End-to-end encrypted messaging for secure communications.';
  }
});

const panelTips = computed(() => {
  switch (props.activePanelType) {
    case 'search':
      return [
        'Search for exact usernames to find people you know',
        'Always verify identities before starting sensitive conversations',
        'Send a brief introduction message when requesting connections',
        'Preferred contact searches use less data than global searches'
      ];
    case 'requests':
      return [
        'Verify identities before accepting contact requests',
        'You can accept or decline any incoming request',
        'Messages from unaccepted contacts won\'t be delivered',
        'You\'ll be notified when contacts accept your requests'
      ];
    case 'contacts':
      return [
        'Click on a contact to begin a secure conversation',
        'Verify security keys with your contacts for maximum security',
        'All messages are end-to-end encrypted',
        'You can manage contact details and preferences in each chat'
      ];
    default:
      return [];
  }
});

const illustrations = {
  search: ['🔍', '👥'],
  requests: ['✉️', '✓'],
  contacts: ['💬', '🔐'],
  none: ['🔒']
};

const getIllustrations = computed(() => {
  return props.activePanelType !== 'none' ? illustrations[props.activePanelType as keyof typeof illustrations] : [];
});
</script>

<template>
  <div class="info-panel">
    <div class="info-content">
      <div class="header">
        <div class="illustration-container">
          <span v-for="(icon, index) in getIllustrations" :key="index" class="illustration">{{ icon }}</span>
        </div>
        <h2 class="title">{{ panelTitle }}</h2>
        <p class="description">{{ panelDescription }}</p>
      </div>

      <div v-if="panelTips.length > 0" class="tips-section">
        <!-- Tips header with toggle button -->
        <div class="tips-header" @click="showTips = !showTips">
          <h3 class="tips-title">Tips</h3>
          <button class="tips-toggle" :class="{ 'is-expanded': showTips }" aria-label="Toggle tips visibility">
            <span class="toggle-icon">{{ showTips ? '−' : '+' }}</span>
          </button>
        </div>
        
        <!-- Collapsible tips content -->
        <div v-if="showTips" class="tips-container">
          <ul class="tips-list">
            <li v-for="(tip, index) in panelTips" :key="index" class="tip-item">
              <span class="tip-bullet">•</span>
              <span class="tip-text">{{ tip }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="security-note">
        <div class="security-icon">🛡️</div>
        <p class="security-text">
          <span class="security-highlight">Security Note:</span>
          <span v-if="activePanelType === 'search'">
            Always verify the identity of new contacts through a trusted channel before sharing sensitive information.
          </span>
          <span v-else-if="activePanelType === 'requests'">
            For maximum security, confirm contact requests through a separate communication channel when possible.
          </span>
          <span v-else-if="activePanelType === 'contacts'">
            Your messages are secured with end-to-end encryption. Remember to verify security keys with your contacts for maximum protection.
          </span>
          <span v-else>
            Nexus encrypts your messages end-to-end so only you and your contacts can read them.
          </span>
        </p>
      </div>

      <div class="brand-footer">
        <img src="/nexus_logo.png" alt="Nexus Logo" class="footer-logo" />
        <span class="brand-text">Nexus Secure Messaging</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-panel {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: 
    radial-gradient(circle at 20% 35%, rgba(99, 102, 241, 0.03) 0%, transparent 70%),
    radial-gradient(circle at 80% 60%, rgba(139, 92, 246, 0.03) 0%, transparent 70%);
}

.info-content {
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 1rem;
}

.illustration-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.illustration {
  font-size: 3.5rem;
  margin: 0 0.75rem;
  animation: float 3s ease-in-out infinite;
}

.illustration:nth-child(2) {
  animation-delay: 0.5s;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.description {
  font-size: 1.1rem;
  color: #6b7280;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
}

.tips-section {
  background-color: rgba(99, 102, 241, 0.05);
  border-radius: 12px;
  border-left: 4px solid #6366f1;
  overflow: hidden;
  transition: all 0.3s ease;
}

.tips-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tips-header:hover {
  background-color: rgba(99, 102, 241, 0.08);
}

.tips-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4f46e5;
  margin: 0;
}

.tips-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tips-toggle:hover {
  background-color: rgba(99, 102, 241, 0.2);
}

.toggle-icon {
  line-height: 1;
  font-size: 16px;
}

.tips-container {
  padding: 0 1.5rem 1.5rem;
  animation: slideDown 0.3s ease-out;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tip-item {
  display: flex;
  align-items: flex-start;
}

.tip-bullet {
  color: #6366f1;
  font-size: 1.5rem;
  line-height: 1.2;
  margin-right: 0.75rem;
}

.tip-text {
  color: #4b5563;
  line-height: 1.5;
}

.security-note {
  display: flex;
  align-items: center;
  background-color: rgba(99, 102, 241, 0.05);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.security-icon {
  font-size: 2rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.security-text {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.5;
}

.security-highlight {
  display: block;
  font-weight: 600;
  color: #4f46e5;
  margin-bottom: 0.25rem;
}

.brand-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
}

.footer-logo {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.brand-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Dark mode adjustments */
:global(.dark) .description,
:global(.dark) .tip-text {
  color: #9ca3af;
}

:global(.dark) .security-text {
  color: #d1d5db;
}

:global(.dark) .brand-text {
  color: #9ca3af;
}

:global(.dark) .tips-section {
  background-color: rgba(99, 102, 241, 0.1);
}

:global(.dark) .tips-header:hover {
  background-color: rgba(99, 102, 241, 0.15);
}

:global(.dark) .tips-toggle {
  background-color: rgba(99, 102, 241, 0.2);
  color: #818cf8;
}

:global(.dark) .tips-toggle:hover {
  background-color: rgba(99, 102, 241, 0.3);
}

:global(.dark) .security-note {
  background-color: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.2);
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}
</style>
