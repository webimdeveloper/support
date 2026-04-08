export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'gray',
    },
    button: {
      slots: {
        base: 'font-medium',
      },
      defaultVariants: {
        color: 'primary',
      },
    },
    input: {
      slots: {
        base: 'rounded-md',
      },
    },
    table: {
      slots: {
        th: 'text-left text-sm font-medium',
      },
    },
  },
})
