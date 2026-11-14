<template>
  <TailwindCapacitorProvider :dark="darkMode" :theme="platformTheme">
    <App :theme="platformTheme" :dark="darkMode">
      <Page class="demo-page no-safe-areas-top">
        <Navbar title="Tailwind Capacitor Demo" />

        <div class="p-4 pb-16 space-y-4 demo-shell">
          <Block strong inset>
            <BlockTitle :with-block="false">Theme controls</BlockTitle>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="theme-chip"
                :class="{ 'theme-chip-active': platformTheme === 'ios' }"
                @click="platformTheme = 'ios'"
              >
                iOS
              </button>
              <button
                type="button"
                class="theme-chip"
                :class="{ 'theme-chip-active': platformTheme === 'material' }"
                @click="platformTheme = 'material'"
              >
                Material
              </button>
              <button
                type="button"
                class="theme-chip"
                :class="{ 'theme-chip-active': !darkMode }"
                @click="darkMode = false"
              >
                Light
              </button>
              <button
                type="button"
                class="theme-chip"
                :class="{ 'theme-chip-active': darkMode }"
                @click="darkMode = true"
              >
                Dark
              </button>
            </div>
          </Block>

          <Block strong inset>
            <BlockTitle :with-block="false">New Ionic style components</BlockTitle>
            <Note>
              Demo ({{ platformTheme }} / {{ darkMode ? 'dark' : 'light' }})
            </Note>
          </Block>

          <Block strong inset>
            <BlockTitle>Alerts and content</BlockTitle>
            <Refresher>Pull to refresh</Refresher>
            <Alert>Default alert banner text</Alert>
            <Note>Supporting note text</Note>
            <div class="demo-media-row">
              <Avatar>MD</Avatar>
              <Thumbnail class="demo-thumbnail">
                <img
                  src="/demo-thumbnail.png"
                  alt="Sample thumbnail"
                  width="48"
                  height="48"
                />
              </Thumbnail>
            </div>
          </Block>

          <Block strong inset>
            <BlockTitle>Accordion</BlockTitle>
            <Accordion>
              <AccordionItem>Accordion section one</AccordionItem>
              <AccordionItem>Accordion section two</AccordionItem>
            </Accordion>
          </Block>

          <Block strong inset>
            <BlockTitle>Tabs and navigation</BlockTitle>
            <Segmented strong rounded class="w-full">
              <SegmentedButton strong :active="tab === 'a'" @click="tab = 'a'">
                Tab A
              </SegmentedButton>
              <SegmentedButton strong :active="tab === 'b'" @click="tab = 'b'">
                Tab B
              </SegmentedButton>
            </Segmented>
            <Tabs strong rounded class="w-full mt-2">
              <Tab :active="tab2 === 'one'" @click="tab2 = 'one'">Tabs one</Tab>
              <Tab :active="tab2 === 'two'" @click="tab2 = 'two'">Tabs two</Tab>
            </Tabs>
            <Tabbar labels class="mt-2">
              <TabbarLink :active="tab === 'a'">Home</TabbarLink>
              <TabbarLink>Settings</TabbarLink>
            </Tabbar>
            <div class="demo-back-row flex items-center gap-2 mt-2">
              <NavbarBackLink :show-text="false" @click.prevent />
              <span class="text-sm">Back button</span>
            </div>
          </Block>

          <Block strong inset>
            <BlockTitle>Lists and menus</BlockTitle>
            <List strong inset>
              <ListItem title="List row" after="Detail" />
            </List>
            <MenuList strong inset>
              <MenuListItem title="Menu item A" />
              <MenuListItem title="Menu item B" />
            </MenuList>
            <ItemSliding class="demo-item-sliding mt-2">
              <ListItem component="div" title="Sliding list item" />
            </ItemSliding>
            <Reorder class="p-1 mt-2 w-full">
              <List strong inset margin="my-0" outline dividers dividers-ios>
                <ListItem title="Reorder row 1" component="div" />
                <ListItem title="Reorder row 2" component="div" />
              </List>
            </Reorder>
          </Block>

          <Block strong inset>
            <BlockTitle>Forms and pickers</BlockTitle>
            <Datetime>Nov 13, 2026 4:00 PM</Datetime>
            <Picker>Picker: Medium</Picker>
            <Textarea placeholder="Write notes here" />
            <Select label="Fruit">
              <option>Option A</option>
              <option>Option B</option>
            </Select>
            <InputOtp>1 2 3 4</InputOtp>
          </Block>

          <Block strong inset>
            <BlockTitle>Loading and overlays</BlockTitle>
            <div class="flex items-center gap-2 py-2">
              <Preloader class="w-6 h-6" />
              <span class="text-sm opacity-80">Loading spinner</span>
            </div>
            <Modal>Modal surface (inline demo)</Modal>
          </Block>

          <Block strong inset>
            <BlockTitle>Layout primitives</BlockTitle>
            <SplitPane class="demo-split-pane min-h-20">
              <div
                class="p-3 rounded-lg bg-primary/10 text-center text-xs leading-snug"
              >
                Split left
              </div>
              <div
                class="p-3 rounded-lg bg-black/5 dark:bg-white/10 text-center text-xs leading-snug"
              >
                Split right
              </div>
            </SplitPane>
            <Header class="mt-2 px-2 py-1 text-xs font-semibold uppercase">
              Section header
            </Header>
            <Footer class="px-2 py-1 text-xs opacity-70">Section footer</Footer>
            <InfiniteScroll>Infinite scroll footer</InfiniteScroll>
            <TouchRipple class="inline-flex mt-2">
              <Button small outline inline>Ripple target</Button>
            </TouchRipple>
          </Block>
        </div>
      </Page>
    </App>
  </TailwindCapacitorProvider>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  TailwindCapacitorProvider,
  App,
  Page,
  Navbar,
  Block,
  BlockTitle,
  Button,
  Alert,
  Avatar,
  Thumbnail,
  Skeleton,
  Note,
  Accordion,
  AccordionItem,
  Segmented,
  SegmentedButton,
  Tabs,
  Tab,
  Tabbar,
  TabbarLink,
  List,
  ListItem,
  MenuList,
  MenuListItem,
  ItemSliding,
  Reorder,
  Datetime,
  Picker,
  Textarea,
  Select,
  InputOtp,
  Preloader,
  Modal,
  SplitPane,
  InfiniteScroll,
  Refresher,
  Header,
  Footer,
  NavbarBackLink,
  TouchRipple,
} from '@/capacitor/index.js'

const platformTheme = ref('ios')
const darkMode = ref(false)
const tab = ref('a')
const tab2 = ref('one')

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const theme = params.get('theme')
  if (theme === 'ios' || theme === 'material') {
    platformTheme.value = theme
  }
  const dark = params.get('dark')
  if (dark === '1' || dark === 'true') darkMode.value = true
  if (dark === '0' || dark === 'false') darkMode.value = false
})
</script>
