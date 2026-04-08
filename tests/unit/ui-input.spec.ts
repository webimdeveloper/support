import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UiInput from '../../components/ui/UiInput.vue'

describe('UiInput', () => {
  it('renders label and placeholder', () => {
    const wrapper = mount(UiInput, {
      props: {
        modelValue: '',
        label: 'Client',
        placeholder: 'Type client name',
      },
    })

    expect(wrapper.text()).toContain('Client')
    expect(wrapper.find('input').attributes('placeholder')).toBe('Type client name')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(UiInput, {
      props: { modelValue: '' },
    })

    await wrapper.find('input').setValue('Acme')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Acme'])
  })
})
