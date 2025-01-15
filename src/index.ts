import type { ComputedRef, InjectionKey, Ref, SlotsType } from 'vue'
import type { z } from 'zod'

import { computed, defineComponent, h, provide, ref } from 'vue'

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export const injectionSymbolCtx = Symbol('@flapili/form_ctx') as InjectionKey<{
  /**
   * The timestamp of the last time the form was changed.
   */
  changedAt: Ref<Date | null>
  /**
   * Whether the form is currently displaying errors.
   */
  displayErrors: Ref<boolean>
  /**
   * The result of the form's parse.
   */
  parseResult: ComputedRef<z.SafeParseReturnType<any, any>>
  /**
   * Whether the form has changed.
   */
  hasChanged: ComputedRef<boolean>
  /**
   * Whether the form is valid.
   */
  isValid: ComputedRef<boolean>
  /**
   * The function to call to get the errors for a given path.
   */
  getErrors: (...path: (string | number)[]) => z.ZodIssue[]
  /**
   * The function to call to start submitting the form.
   */
  submit: () => void
  /**
   * The function to call to reset the form.
   */
  reset: () => void
  /**
   * The function to call to toggle the display of errors.
   */
  toggleDisplayErrors: () => void
}>

/**
 * This is a composable that allows you to create a form from a zod schema, initial data, and a callback.
 *
 * @param options - The options to use for the form.
 * @param options.schema - The zod schema to use for the form.
 * @param options.initialData - The initial data to use for the form.
 * @param options.onSubmit - The callback to call when the form is submitted.
 */
export default function useForm<
  T extends z.ZodType,
  Input = z.input<T>,
  Output = z.output<T>,
>(
  { schema, initialData, onSubmit }: {
    schema: T
    initialData: Input
    onSubmit: (data: Output) => void
  },
) {
  const data = ref(deepClone(initialData))
  const parseResult = computed(() => schema.safeParse(data.value) as z.SafeParseReturnType<Input, Output>)

  const isValid = computed(() => parseResult.value.success)

  const getErrors = (...path: (string | number)[]) => {
    if (parseResult.value.success)
      return []

    return parseResult
      .value
      .error
      .errors
      .filter(error => error.path.join('.') === path.join('.'))
  }

  const displayErrors = ref(false)
  const changedAt = ref<Date | null>(null)
  const hasChanged = computed(() => changedAt.value !== null)

  const submit = () => {
    const res = schema.safeParse(data.value)
    if (res.success)
      onSubmit(res.data)
    else
      displayErrors.value = true
  }

  const reset = () => {
    data.value = deepClone(initialData)
    changedAt.value = null
    displayErrors.value = false
  }

  const toggleDisplayErrors = () => {
    displayErrors.value = !displayErrors.value
  }

  const Component = defineComponent({
    slots: Object as SlotsType<{
      /**
       * The default slot to use for the form.
       */
      default: {
        /**
         * The data to use for the form.
         */
        data: Input
        /**
         * Whether the form should display errors.
         */
        displayErrors: boolean
        /**
         * The timestamp of the last time the form was changed.
         */
        changedAt: Date | null
        /**
         * Whether the form has changed.
         */
        hasChanged: boolean
        /**
         * Whether the form is valid.
         */
        isValid: boolean
        /**
         * The result of the form's parse.
         */
        parseResult: z.SafeParseReturnType<Input, Output>
        /**
         * The function to call to start submitting the form.
         */
        submit: () => void
        /**
         * The function to call to get the errors for a given path.
         */
        getErrors: (...path: (string | number)[]) => z.ZodIssue[]
        /**
         * The function to call to reset the form.
         */
        reset: () => void
        /**
         * The function to call to toggle the display of errors.
         */
        toggleDisplayErrors: () => void
      }
    }>,
    setup(_props, { slots }) {
      provide(injectionSymbolCtx, { changedAt, displayErrors, parseResult, hasChanged, isValid, getErrors, submit, reset, toggleDisplayErrors })

      return () => h('form', {}, slots.default?.({
        data: data.value,
        displayErrors: displayErrors.value,
        changedAt: changedAt.value,
        hasChanged: hasChanged.value,
        isValid: isValid.value,
        parseResult: parseResult.value,
        submit,
        getErrors,
        reset,
        toggleDisplayErrors,
      }))
    },
  })

  return {
    Form: Component,
    data: data as Ref<Input>,
    parseResult,
    displayErrors,
    changedAt,
    hasChanged,
    isValid,
    getErrors,
    submit,
    reset,
    toggleDisplayErrors,
  }
}
