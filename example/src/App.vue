<template>
  <TailwindCapacitorProvider>
    <App theme="ios">
      <Page>
        <Navbar title="Tailwind Capacitor Demo" />
        
        <div class="p-4 space-y-6">
          <!-- Buttons Section -->
          <Block>
            <BlockTitle>Buttons</BlockTitle>
            <div class="space-y-3">
              <Button fill="solid" color="primary">Solid Button</Button>
              <Button fill="outline" color="secondary">Outline Button</Button>
              <Button fill="clear" color="success">Clear Button</Button>
            </div>
          </Block>

          <!-- List Section -->
          <Block>
            <BlockTitle>Lists</BlockTitle>
            <List>
              <ListItem 
                title="Profile" 
                subtitle="Manage your account"
                chevron
              />
              <ListItem 
                title="Settings" 
                subtitle="App preferences"
                chevron
              />
              <ListItem 
                title="Notifications" 
                subtitle="Push notifications"
                chevron
              />
            </List>
          </Block>

          <!-- Form Elements -->
          <Block>
            <BlockTitle>Form Elements</BlockTitle>
            <List>
              <ListInput
                label="Name"
                type="text"
                placeholder="Enter your name"
              />
              <ListInput
                label="Email"
                type="email"
                placeholder="Enter your email"
              />
              <ListItem>
                <template #title>
                  <span>Enable notifications</span>
                </template>
                <template #after>
                  <Toggle checked />
                </template>
              </ListItem>
              <ListItem>
                <template #title>
                  <span>Accept terms</span>
                </template>
                <template #after>
                  <Checkbox checked />
                </template>
              </ListItem>
            </List>
          </Block>

          <!-- Cards -->
          <Block>
            <BlockTitle>Cards</BlockTitle>
            <Card>
              <div class="p-4">
                <h3 class="text-lg font-semibold mb-2">Card Title</h3>
                <p class="text-gray-600 mb-4">
                  This is a card component with some content inside.
                </p>
                <Button size="small" fill="outline">Learn More</Button>
              </div>
            </Card>
          </Block>

          <!-- Badges and Chips -->
          <Block>
            <BlockTitle>Badges & Chips</BlockTitle>
            <div class="flex flex-wrap gap-2 mb-4">
              <Badge color="primary">Primary</Badge>
              <Badge color="secondary">Secondary</Badge>
              <Badge color="success">Success</Badge>
              <Badge color="warning">Warning</Badge>
              <Badge color="danger">Danger</Badge>
            </div>
            <div class="flex flex-wrap gap-2">
              <Chip>Default Chip</Chip>
              <Chip color="primary">Primary Chip</Chip>
              <Chip color="success">Success Chip</Chip>
            </div>
          </Block>

          <!-- Progress and Range -->
          <Block>
            <BlockTitle>Progress & Range</BlockTitle>
            <div class="space-y-4">
              <div>
                <p class="mb-2 text-sm">Progress</p>
                <Progressbar :progress="65" />
              </div>
              <div>
                <p class="mb-2 text-sm">Range</p>
                <Range :value="45" />
              </div>
            </div>
          </Block>

          <!-- Action Buttons -->
          <div class="flex justify-center space-x-4 pt-4">
            <Button @click="showToast" color="primary">Show Toast</Button>
            <Button @click="showDialog" color="secondary">Show Dialog</Button>
          </div>
        </div>

        <!-- Toast -->
        <Toast 
          v-if="toastVisible"
          @toast:close="toastVisible = false"
        >
          <div class="flex items-center">
            <Icon name="check-circle" class="mr-2 text-green-500" />
            Toast message displayed!
          </div>
        </Toast>

        <!-- Dialog -->
        <Dialog 
          v-if="dialogVisible"
          @dialog:close="dialogVisible = false"
        >
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-4">Confirm Action</h3>
            <p class="mb-6">Are you sure you want to proceed?</p>
            <div class="flex space-x-3">
              <DialogButton @click="dialogVisible = false">Cancel</DialogButton>
              <DialogButton strong @click="dialogVisible = false">Confirm</DialogButton>
            </div>
          </div>
        </Dialog>

        <!-- FAB -->
        <Fab position="right-bottom" color="primary">
          <Icon name="plus" />
        </Fab>
      </Page>
    </App>
  </TailwindCapacitorProvider>
</template>

<script setup>
import { ref } from 'vue'
import {
  TailwindCapacitorProvider,
  App,
  Page,
  Navbar,
  Block,
  BlockTitle,
  Button,
  List,
  ListItem,
  ListInput,
  Card,
  Badge,
  Chip,
  Toggle,
  Checkbox,
  Progressbar,
  Range,
  Toast,
  Dialog,
  DialogButton,
  Icon,
  Fab
} from '@capgo/tailwind-capacitor/vue'

const toastVisible = ref(false)
const dialogVisible = ref(false)

const showToast = () => {
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 3000)
}

const showDialog = () => {
  dialogVisible.value = true
}
</script> 
