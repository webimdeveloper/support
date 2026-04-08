import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UiBadge from '../../components/ui/UiBadge.vue'

describe('UiBadge', () => {
  it('uses success tone classes', () => {
    const wrapper = mount(UiBadge, {
      props: { tone: 'success' },
      slots: { default: 'Active' },
    })

    expect(wrapper.text()).toContain('Active')
    expect(wrapper.attributes('class')).toContain('bg-green-100')
  })

  it('uses neutral tone by default', () => {
    const wrapper = mount(UiBadge, {
      slots: { default: 'New' },
    })

    expect(wrapper.attributes('class')).toContain('bg-gray-200')
  })
})
