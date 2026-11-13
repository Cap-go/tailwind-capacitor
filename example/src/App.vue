<template>
  <TailwindCapacitorProvider>
    <App theme="ios">
      <Page class="safe-areas">
        <Navbar title="Tailwind Capacitor Demo" />

        <div class="p-4 pb-safe space-y-6">
          <Block strong inset>
            <BlockTitle :with-block="false">Safe areas</BlockTitle>
            <p class="text-sm opacity-80 mb-3">
              Navbar respects safe area insets. Content uses
              <code class="text-xs">pb-safe</code> with
              <code class="text-xs">safe-areas</code> on the page.
            </p>
            <div class="ios:rounded-xl android:rounded-md hairline hairline-color p-4 bg-light">
              Platform variants:
              <span class="ios:inline hidden">iOS</span>
              <span class="android:inline hidden">Android / Web</span>
            </div>
          </Block>

          <Block>
            <BlockTitle>Buttons</BlockTitle>
            <div class="space-y-3">
              <Button>Solid Button</Button>
              <Button outline>Outline Button</Button>
              <Button clear>Clear Button</Button>
            </div>
          </Block>

          <Block>
            <BlockTitle>Lists</BlockTitle>
            <List>
              <ListItem title="Profile" subtitle="Manage your account" chevron />
              <ListItem title="Settings" subtitle="App preferences" chevron />
              <ListItem title="Notifications" subtitle="Push notifications" chevron />
            </List>
          </Block>

          <Block>
            <BlockTitle>Form Elements</BlockTitle>
            <List>
              <ListInput label="Name" type="text" placeholder="Enter your name" />
              <ListInput label="Email" type="email" placeholder="Enter your email" />
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

          <Block>
            <BlockTitle>Cards</BlockTitle>
            <Card>
              <div class="p-4">
                <h3 class="text-lg font-semibold mb-2">Card Title</h3>
                <p class="text-gray-600 mb-4">
                  This is a card component with some content inside.
                </p>
                <Button small outline>Learn More</Button>
              </div>
            </Card>
          </Block>

          <Block>
            <BlockTitle>Badges & Chips</BlockTitle>
            <div class="flex flex-wrap gap-2 mb-4">
              <Badge>Primary</Badge>
              <Badge>Secondary</Badge>
              <Badge>Success</Badge>
              <Badge>Warning</Badge>
              <Badge>Danger</Badge>
            </div>
            <div class="flex flex-wrap gap-2">
              <Chip>Default Chip</Chip>
              <Chip>Primary Chip</Chip>
              <Chip>Success Chip</Chip>
            </div>
          </Block>

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

          <div class="flex justify-center space-x-4 pt-4">
            <Button @click="showToast">Show Toast</Button>
            <Button outline @click="showDialog">Show Dialog</Button>
          </div>
        </div>

        <Toast :opened="toastVisible" position="center">
          Toast message displayed!
        </Toast>

        <Dialog :opened="dialogVisible" @backdropclick="dialogVisible = false">
          <template #title>Confirm Action</template>
          Are you sure you want to proceed?
          <template #buttons>
            <DialogButton @click="dialogVisible = false">Cancel</DialogButton>
            <DialogButton strong @click="dialogVisible = false">Confirm</DialogButton>
          </template>
        </Dialog>

        <Fab href>
          <span class="text-2xl leading-none">+</span>
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
  Fab
} from '@/capacitor/index.js'

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
