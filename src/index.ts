import type { InjectionKey, Reactive, Ref, SlotsType } from 'vue'
import type { z } from 'zod'

import { computed, defineComponent, h, onMounted, provide, ref, useAttrs, watch } from 'vue'

/**
 * The context of the form.
 */
export interface Context<
  onSubmitCb extends (...args: any[]) => any,
  Schema extends z.ZodType,
  Input = z.input<Schema>,
  Output = z.output<Schema>,
> {
  /**
   * The data of the form.
   */
  data: Reactive<Input>
  /**
   * The result of the form's parse.
   */
  readonly parseResult: z.SafeParseReturnType<Input, Output> | null
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
  readonly hasChanged: boolean
  /**
   * The status of the form.
   */
  readonly status: 'parsing' | 'valid' | 'invalid'
  /**
   * The result of the form's submit.
   */
  submit: () => ReturnType<onSubmitCb>
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

/**
 * The symbol to use to provide the form context.
 */
export const injectionSymbolCtx = Symbol('@flapili/vue-form_ctx') as InjectionKey<Context<(...args: any[]) => any, z.ZodType>>

/**
 * This is a composable that allows you to create a form from a zod schema, initial data, and a callback.
 *
 * @param schema - The zod schema to use for the form.
 * @param input - The data to use for the form.
 * @param onSubmit - The callback to call when the form is submitted.
 * @param options - The options to use for the form.
 * @param options.displayErrors - Whether the form should display errors.
 * @param options.mutateDisplayErrorsOnError - Whether the displayErrors should be mutated when the form is invalid (apply only after first form submission try to avoid bad DX).
 */
export function useFormComponent<
  Schema extends z.ZodType,
  onSubmitCb extends (data: z.output<Schema>) => ReturnType<onSubmitCb>,
  Input = z.input<Schema>,
  Output = z.output<Schema>,
>(
  schema: Schema,
  input: Reactive<Input>,
  onSubmit: onSubmitCb,
  options?: {
    /**
     * Whether the form should display errors.
     */
    displayErrors?: Ref<boolean>
    /**
     * Whether the displayErrors should be mutated when the form is invalid.
     */
    mutateDisplayErrorsOnError?: boolean
  },
) {
  // keep a copy of the initial data to reset the form
  const initialInput = JSON.parse(JSON.stringify(input)) as Input

  const status = ref<'parsing' | 'valid' | 'invalid'>('parsing')
  const parseResult = ref<z.SafeParseReturnType<Input, Output> | null>(null)

  onMounted(() => {
    watch(input, async (v) => {
      status.value = 'parsing'
      parseResult.value = await schema.safeParseAsync(v)
      status.value = parseResult.value.success ? 'valid' : 'invalid'
    }, { deep: true, immediate: true })
  })

  const getErrors = (...path: (string | number)[]) => {
    const v = parseResult.value
    if (!v)
      return []

    if (v.success)
      return []

    return v.error.errors.filter(error => error.path.join('.') === path.join('.'))
  }

  const displayErrors = options?.displayErrors ?? ref(false)
  const changedAt = ref<Date | null>(null)
  const hasChanged = computed(() => changedAt.value !== null)

  const submit = () => {
    const res = schema.safeParse(input)
    if (res.success === false) {
      if (options?.mutateDisplayErrorsOnError)
        displayErrors.value = true
      throw res.error
    }

    return onSubmit(res.data)
  }

  const reset = () => {
    changedAt.value = null
    displayErrors.value = false
    Object.assign(input, initialInput)
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
        data: Reactive<Input>
        /**
         * The result of the form's parse.
         */
        readonly parseResult: z.SafeParseReturnType<Input, Output> | null
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
        readonly hasChanged: boolean
        /**
         * The status of the form.
         */
        readonly status: 'parsing' | 'valid' | 'invalid'
        /**
         * The function to call to start submitting the form.
         */
        readonly submit: () => ReturnType<onSubmitCb>
        /**
         * The function to call to get the errors for a given path.
         */
        readonly getErrors: (...path: (string | number)[]) => z.ZodIssue[]
        /**
         * The function to call to reset the form.
         */
        readonly reset: () => void
        /**
         * The function to call to toggle the display of errors.
         */
        readonly toggleDisplayErrors: () => void
      }
    }>,
    setup(_props, { slots }) {
      const attrs = useAttrs()

      provide(injectionSymbolCtx, {
        data: input,
        changedAt: changedAt.value,
        displayErrors: displayErrors.value,
        parseResult: parseResult.value,
        hasChanged: hasChanged.value,
        status: status.value,
        submit,
        getErrors,
        reset,
        toggleDisplayErrors,
      } satisfies Context<onSubmitCb, Schema>)

      return () => h('form', attrs, slots.default?.({
        data: input,
        changedAt: changedAt.value,
        displayErrors: displayErrors.value,
        parseResult: parseResult.value as z.SafeParseReturnType<Input, Output> | null,
        hasChanged: hasChanged.value,
        status: status.value,
        submit,
        getErrors,
        reset,
        toggleDisplayErrors,
      }))
    },
  })

  return Component
}
