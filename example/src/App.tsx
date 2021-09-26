export const Button = createVariant(Pressable, {
  paddingHorizontal: '$space.10',
  paddingVertical: '$space.8',
  _pressed: {
    backgroundColor: '$colors.blue',
  },
  variants: {
    solid: {
      true: {
        backgroundColor: '$colors.primary',
      },
    },
  },
  defaultVariants: {
    solid: true,
  },
});
