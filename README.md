# @flapili/vue-form

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
npm install @flapili/vue-form zod # npm
pnpm add @flapili/vue-form zod # pnpm
yarn add @flapili/vue-form zod # yarn
```

## Usage

Here's a basic example of how to use the form library:

```vue
<script setup lang="ts">
import { useFormComponent } from '@flapili/vue-form'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Email is invalid'),
}).transform((data) => {
  return {
    ...data,
    NAME_UPPER: data.name.toUpperCase(),
  }
})

const input = reactive({
  email: '',
  name: '',
})

async function onSubmitCallback(res: z.infer<typeof schema>) {
  console.log(res) // will log { NAME_UPPER: '...', email: '...', name: '...' }
  return 'submitted to backend'
}

const FormComponent = useFormComponent(schema, input, onSubmitCallback)
</script>

<template>
  <div class="size-full flex flex-col items-center justify-center">
    <h1>Test form</h1>
    {{ input }}
    <FormComponent v-slot="{ data, submit, parseResult, displayErrors, toggleDisplayErrors, reset, status }">
      <input v-model="data.name" class="border border-gray-300 rounded-md p-2" :class="{ 'border-red-500': displayErrors }">
      <input v-model="data.email" class="border border-gray-300 rounded-md p-2" :class="{ 'border-red-500': displayErrors }">
      <button
        type="button"
        class="rounded-md bg-blue-500 p-2 text-white disabled:opacity-50"
        :disabled="status !== 'valid'"
        @click="submit().then(res => console.warn(`return of onSubmitCallback = ${res}`))"
      >
        Submit
      </button>
      <pre>{{ parseResult?.error?.issues ?? [] }}</pre>
      <div class="flex flex-col gap-2 children:(rounded-md bg-gray-200 p-2)">
        <button type="button" @click="toggleDisplayErrors">
          Toggle errors showing
        </button>
        <button type="button" @click="reset">
          Reset
        </button>
      </div>
    </FormComponent>
  </div>
</template>
```

## API Reference

### useFormComponent Parameters

| Parameter                            | Description                                                     |
|--------------------------------------|-----------------------------------------------------------------|
| `schema`                             | The Zod schema for form validation                              |
| `input`                              | The reactive form data                                          |
| `onSubmit`                           | Callback function called with validated data on form submission |
| `options`                            | Optional configuration object                                   |
| `options.displayErrors`              | Optional ref to control error display                           |
| `options.mutateDisplayErrorsOnError` | Whether to show errors automatically on validation failure      |

The `options` parameter is optional and can be omitted.

### Form Context

The form provides a context with the following properties:

| Property              | Description                                            |
|-----------------------|--------------------------------------------------------|
| `data`                | The reactive form data                                 |
| `parseResult`         | Current validation result                              |
| `displayErrors`       | Whether validation errors should be displayed          |
| `changedAt`           | Timestamp of last form change                          |
| `hasChanged`          | Whether the form has been modified                     |
| `status`              | Current form validation status (parsing/valid/invalid) |
| `submit`              | Submit the form                                        |
| `getErrors`           | Get validation errors for a specific field path        |
| `reset`               | Reset the form to initial values                       |
| `toggleDisplayErrors` | Toggle error display                                   |

### Form Component Slot Props

The Form component provides all the context properties listed above to its default slot. These can be destructured in the template to access form state and methods:

As an example, the following code renders the form data:
```vue
<FormComponent v-slot="{ data }">
  <pre>{{ data }}</pre>
</FormComponent>
```

## License

MIT License © 2024 Benoît Deveaux

Todo:

- [ ] Add a contributing guide
- [ ] setup CI/CD
- [ ] setup tests
