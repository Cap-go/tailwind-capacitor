<template>
  <TailwindCapacitorProvider :dark="darkMode" :theme="platformTheme">
    <App :theme="platformTheme" :dark="darkMode">
      <Page class="safe-areas">
        <Navbar title="Tailwind Capacitor Demo" />

        <div class="p-4 pb-safe space-y-6">
          <Block strong inset>
            <BlockTitle :with-block="false">Theme controls</BlockTitle>
            <div class="flex flex-wrap gap-2 items-center">
              <Button small :outline="platformTheme !== 'ios'" @click="platformTheme = 'ios'">
                iOS
              </Button>
              <Button small :outline="platformTheme !== 'material'" @click="platformTheme = 'material'">
                Material
              </Button>
              <Button small clear @click="darkMode = !darkMode">
                {{ darkMode ? 'Dark' : 'Light' }}
              </Button>
            </div>
          </Block>

          <Block strong inset>
            <BlockTitle :with-block="false">New Ionic style components</BlockTitle>
            <div class="space-y-3">
              <Alert>Default alert</Alert>
              <div class="flex gap-3 items-center">
                <Avatar>MD</Avatar>
                <Thumbnail class="w-14 h-14 flex items-center justify-center">A</Thumbnail>
              </div>
              <Skeleton class="h-4 w-full" />
              <Note>Note label for ion-item style text</Note>
              <Accordion>
                <AccordionItem>Section one</AccordionItem>
                <AccordionItem>Section two</AccordionItem>
              </Accordion>
              <Tabs>
                <Tab active>Tab A</Tab>
                <Tab>Tab B</Tab>
              </Tabs>
              <Textarea placeholder="Textarea" />
              <Select>
                <option>Option A</option>
              </Select>
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
            </List>
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
  Toast,
  Dialog,
  DialogButton,
  Fab,
  Alert,
  Avatar,
  Thumbnail,
  Skeleton,
  Note,
  Accordion,
  AccordionItem,
  Tabs,
  Tab,
  Textarea,
  Select,
} from '@/capacitor/index.js'

const toastVisible = ref(false)
const dialogVisible = ref(false)
const platformTheme = ref('ios')
const darkMode = ref(false)

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
