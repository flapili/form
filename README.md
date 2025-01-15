# @flapili/form

A Vue 3 form library that integrates Zod for powerful form validation.

## Features

- 🔒 Type-safe form handling with Zod schemas
- 🎯 Simple API with composable functions
- ⚡ Reactive form state management
- 🎨 Flexible error handling and display
- 🔄 Form reset and submission controls
- 📝 Comprehensive TypeScript support

## Installation

```bash
npm install @flapili/form zod # npm
pnpm add @flapili/form zod # pnpm
yarn add @flapili/form zod # yarn
```

## Usage

Here's a basic example of how to use the form library:

```vue
<script setup lang="ts">
import useForm from '@flapili/form'
import { z } from 'zod'

const { Form } = useForm({
  // The schema to use for the form, this will be used to validate the form data
  // and run zod's effect functions (transform, refine, etc ...)
  schema: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Email is invalid'),
  }).transform((data) => {
    return {
      ...data,
      NAME: data.name.toUpperCase(),
    }
  }),
  // The initial data to use for the form,
  // this will be used to initialize the form state
  initialData: {
    email: '',
    name: '',
  },
  // The function to call when the form is submitted (and the data is validated)
  onSubmit: res => console.warn(res),
})
</script>

<template>
  <div>
    <Form v-slot="{ data, submit, parseResult, isValid, displayErrors, toggleDisplayErrors, reset }">
      <input v-model="data.name" class="border border-gray-300 rounded-md p-2" :class="{ 'border-red-500': displayErrors }">
      <input v-model="data.email" class="border border-gray-300 rounded-md p-2" :class="{ 'border-red-500': displayErrors }">
      <button type="button" class="rounded-md bg-blue-500 p-2 text-white disabled:opacity-50" :disabled="!isValid" @click="submit">
        Submit
      </button>
      <pre>{{ parseResult.success === false ? parseResult.error.issues : parseResult.data }}</pre>
      <div class="flex flex-col gap-2 children:(rounded-md bg-gray-200 p-2)">
        <button type="button" @click="toggleDisplayErrors">
          Toggle errors showing
        </button>
        <button type="button" @click="reset">
          Reset
        </button>
      </div>
    </Form>
  </div>
</template>
```

## API Reference

### useForm Options

| Option        | Description                                                     |
|---------------|-----------------------------------------------------------------|
| `schema`      | The Zod schema for form validation                              |
| `initialData` | The initial form data                                           |
| `onSubmit`    | Callback function called with validated data on form submission |

### Return Values

| Name                  | Description                                |
|-----------------------|--------------------------------------------|
| `Form`                | Vue component that wraps your form         |
| `data`                | Reactive form data                         |
| `parseResult`         | Current validation result                  |
| `displayErrors`       | Whether to display validation errors       |
| `changedAt`           | Timestamp of last form change              |
| `hasChanged`          | Whether the form has been modified         |
| `isValid`             | Whether the form is currently valid        |
| `getErrors`           | Get validation errors for a specific field |
| `submit`              | Submit the form                            |
| `reset`               | Reset the form to initial values           |
| `toggleDisplayErrors` | Toggle error display                       |

### Form Slot Props

The Form component provides the following props to its default slot:

| Prop                  | Description                        |
|-----------------------|------------------------------------|
| `data`                | Current form data                  |
| `displayErrors`       | Whether errors should be displayed |
| `changedAt`           | Timestamp of last change           |
| `hasChanged`          | Whether form has changed           |
| `isValid`             | Whether form is valid              |
| `parseResult`         | Current validation result          |
| `submit`              | Submit function                    |
| `getErrors`           | Get field errors                   |
| `reset`               | Reset function                     |
| `toggleDisplayErrors` | Toggle error display               |

## License

MIT License © 2024 Benoît Deveaux

Todo:

- [ ] Add a contributing guide
- [ ] setup CI/CD
- [ ] setup tests
