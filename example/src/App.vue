<template>
  <TailwindCapacitorProvider :dark="darkMode" :theme="platformTheme">
    <App :theme="platformTheme" :dark="darkMode">
      <Page class="safe-areas">
        <Navbar title="Tailwind Capacitor Demo" />

        <div class="p-4 pb-safe space-y-6">
          <Block strong inset>
            <BlockTitle :with-block="false">Theme controls</BlockTitle>
            <div class="flex flex-wrap gap-2 items-center">
              <Button small :tonal="platformTheme === 'ios'" @click="platformTheme = 'ios'">
                iOS
              </Button>
              <Button small :tonal="platformTheme === 'material'" @click="platformTheme = 'material'">
                Material
              </Button>
              <Button small outline @click="darkMode = false">Light</Button>
              <Button small outline @click="darkMode = true">Dark</Button>
            </div>
          </Block>

          <Block strong inset>
            <BlockTitle :with-block="false">New Ionic style components</BlockTitle>
            <Note>Demo section ({{ platformTheme }} / {{ darkMode ? 'dark' : 'light' }})</Note>
            <Alert>Default alert banner text</Alert>
            <div class="flex gap-3 items-center py-2">
              <Avatar>MD</Avatar>
              <Thumbnail>A</Thumbnail>
            </div>
            <Skeleton class="h-4 w-full mb-3" />
            <Accordion class="mb-3">
              <AccordionItem>Section one</AccordionItem>
              <AccordionItem>Section two</AccordionItem>
            </Accordion>
            <Segmented strong rounded class="w-full mb-3">
              <SegmentedButton strong :active="tab === 'a'" @click="tab = 'a'">Tab A</SegmentedButton>
              <SegmentedButton strong :active="tab === 'b'" @click="tab = 'b'">Tab B</SegmentedButton>
            </Segmented>
            <Textarea placeholder="Write notes here" />
            <Select label="Fruit">
              <option>Option A</option>
              <option>Option B</option>
            </Select>
          </Block>

          <Block>
            <BlockTitle>Buttons</BlockTitle>
            <div class="space-y-3">
              <Button>Solid Button</Button>
              <Button outline>Outline Button</Button>
            </div>
          </Block>
        </div>
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
  Segmented,
  SegmentedButton,
  Textarea,
  Select,
} from '@/capacitor/index.js'

const dialogVisible = ref(false)
const platformTheme = ref('ios')
const darkMode = ref(false)
const tab = ref('a')
</script>
