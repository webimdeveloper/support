import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UiButton from '../../components/ui/UiButton.vue'

describe('UiButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(UiButton, {
      slots: { default: 'Save' },
    })

    expect(wrapper.text()).toContain('Save')
  })

  it('disables when loading', () => {
    const wrapper = mount(UiButton, {
      props: { loading: true },
      slots: { default: 'Saving' },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
