---
name: sanity-ui
description: Build React UIs with Sanity's design system. Use when creating custom Studio plugins, Tool interfaces, or content editing UIs.
allowed-tools: WebFetch, Read, Glob, Grep
---

# Sanity UI

Build React interfaces using Sanity UI's component library and theme system.

## Procedure

1. **Setup Check**
   * Check if `@sanity/ui` is installed in package.json
   * If missing: `npm install @sanity/ui styled-components`
   * **Important:** Check context:
     * **Building Studio plugins/tools?** → ThemeProvider already provided by Studio - no setup needed
     * **Building standalone apps (App SDK)?** → Must wrap with `<ThemeProvider theme={studioTheme}>`
   * **Rule:** ThemeProvider is auto-provided in Studio context (plugins, tools, Studio components)

2. **Identify Component Needs**
   * **Layout?** → Use Box, Stack, Flex, Grid, Container, Inline
   * **Forms?** → Use TextInput, TextArea, Select, Checkbox, Radio, Switch, Label
   * **Interactive?** → Use Button, Card (as="button"), Dialog, Popover, Menu
   * **Feedback?** → Use Toast (via useToast hook), Spinner, Badge
   * **Typography?** → Use Text, Heading, Code, Kbd
   * **Media?** → Use Avatar

3. **Apply Design System**
   * **Rule:** Always use spacing scale (0-7) where 1=4px, 2=8px, 3=12px, 4=16px, 5=24px, 6=48px, 7=96px
   * **Rule:** Use semantic tones: `default`, `primary`, `positive` (green), `caution` (yellow), `critical` (red), `transparent`, `inherit`
   * **Rule:** Apply responsive props as arrays: `padding={[3, 4, 5]}` for [mobile, tablet, desktop]
   * **Action:** Use `studioTheme` for consistent styling with Sanity Studio

4. **Common Patterns**
   * **Document Panel:** Fixed header/footer, scrollable content area, optional side inspector
   * **Form Field:** Stack with space={2}, Label + description + validation + input
   * **Banner:** Card with tone, padding={1}, radius={3} for contextual messages
   * **Empty State:** Centered Container with Stack of Text + Button
   * **Loading:** Centered Flex with Spinner + Text
   * **Portal Management:** Use PortalProvider for dialogs, popovers, tooltips

5. **Reference Lookup**
   * **Action:** For comprehensive component props → Load `sanity://rules/sanity-ui.mdc`
   * **Action:** For theme customization → Check buildTheme() in rule file
   * **Action:** For advanced patterns → Check rule file content editing patterns
   * **Official docs:** https://www.sanity.io/ui

## Examples

### Studio Plugin/Tool (ThemeProvider Already Provided)

```tsx
import {Stack, Card, Text} from '@sanity/ui'

// No ThemeProvider needed - Studio provides it
export function MyStudioTool() {
  return (
    <Stack space={4} padding={4}>
      <Card padding={4} radius={2} shadow={1}>
        <Text size={2}>Content</Text>
      </Card>
    </Stack>
  )
}
```

### Standalone App (ThemeProvider Required)

```tsx
import {ThemeProvider, studioTheme, Stack, Card, Text} from '@sanity/ui'

// ThemeProvider required for standalone apps
export function MyApp() {
  return (
    <ThemeProvider theme={studioTheme}>
      <Stack space={4} padding={4}>
        <Card padding={4} radius={2} shadow={1}>
          <Text size={2}>Content</Text>
        </Card>
      </Stack>
    </ThemeProvider>
  )
}
```

### Form with Validation

```tsx
import {Stack, Label, Text, TextInput, Button} from '@sanity/ui'
import {useState} from 'react'

export function MyForm() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  return (
    <Stack space={4}>
      <Stack space={2}>
        <Label size={1} weight="semibold">Name</Label>
        <Text size={1} muted>Enter your full name</Text>
        <TextInput
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        {error && (
          <Text size={1} style={{color: 'var(--card-fg-color)'}}>
            {error}
          </Text>
        )}
      </Stack>
      <Button text="Submit" tone="primary" />
    </Stack>
  )
}
```

### Document Panel Layout

```tsx
import {Flex, Box, Card, Text} from '@sanity/ui'

export function DocumentPanel({header, content, footer}) {
  return (
    <Flex direction="column" height="fill">
      {/* Fixed header */}
      {header}

      {/* Scrollable content */}
      <Box flex={1} overflow="auto">
        <Box padding={4}>
          {content}
        </Box>
      </Box>

      {/* Fixed footer */}
      {footer}
    </Flex>
  )
}
```

### Loading State

```tsx
import {Flex, Spinner, Text, Stack} from '@sanity/ui'

export function LoadingPane({message = 'Loading...'}) {
  return (
    <Flex align="center" direction="column" height="fill" justify="center">
      <Stack space={3} align="center">
        <Spinner />
        <Text size={1} muted>{message}</Text>
      </Stack>
    </Flex>
  )
}
```
