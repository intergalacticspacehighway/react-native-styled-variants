const spacingProperties = {
  margin: true,
  marginTop: true,
  marginRight: true,
  marginBottom: true,
  marginLeft: true,
  marginHorizontal: true,
  marginVertical: true,
  marginStart: true,
  marginEnd: true,
  padding: true,
  paddingTop: true,
  paddingRight: true,
  paddingBottom: true,
  paddingLeft: true,
  paddingHorizontal: true,
  paddingVertical: true,
  paddingStart: true,
  paddingEnd: true,
};

const spacingPropertiesShorthand = {
  m: 'margin',
  mt: 'marginTop',
  mr: 'marginRight',
  mb: 'marginBottom',
  ml: 'marginLeft',
  mx: 'marginHorizontal',
  my: 'marginVertical',
  ms: 'marginStart',
  me: 'marginEnd',
  p: 'padding',
  pt: 'paddingTop',
  pr: 'paddingRight',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  px: 'paddingHorizontal',
  py: 'paddingVertical',
  ps: 'paddingStart',
  pe: 'paddingEnd',
};

const typographyProperties = {
  fontFamily: true,
  fontSize: true,
  fontStyle: true,
  fontWeight: true,
  letterSpacing: true,
  lineHeight: true,
  textAlign: true,
  textDecorationLine: true,
  textDecorationStyle: true,
  textTransform: true,
};

const layoutProperties = {
  width: true,
  height: true,
  minWidth: true,
  maxWidth: true,
  minHeight: true,
  maxHeight: true,
  overflow: true,
  aspectRatio: true,
  alignContent: true,
  alignItems: true,
  alignSelf: true,
  justifyContent: true,
  flex: true,
  flexBasis: true,
  flexDirection: true,
  flexGrow: true,
  flexShrink: true,
  flexWrap: true,
};

const positionProperties = {
  position: true,
  top: true,
  right: true,
  bottom: true,
  left: true,
  start: true,
  end: true,
};

const borderProperties = {
  borderBottomWidth: true,
  borderLeftWidth: true,
  borderRightWidth: true,
  borderStyle: true,
  borderTopWidth: true,
  borderStartWidth: true,
  borderEndWidth: true,
  borderWidth: true,
};

const borderRadiusProperties = {
  borderRadius: true,
  borderBottomLeftRadius: true,
  borderBottomRightRadius: true,
  borderTopLeftRadius: true,
  borderTopRightRadius: true,
  borderBottomStartRadius: true,
  borderBottomEndRadius: true,
  borderTopStartRadius: true,
  borderTopEndRadius: true,
};

const borderColorProperties = {
  borderColor: true,
  borderTopColor: true,
  borderRightColor: true,
  borderLeftColor: true,
  borderBottomColor: true,
  borderStartColor: true,
  borderEndColor: true,
};

const shadowProperties = {
  shadowOpacity: true,
  shadowOffset: true,
  shadowRadius: true,
  elevation: true,
};

const textShadowProperties = {
  textShadowOffset: true,
  textShadowRadius: true,
};

module.exports = {
  ...spacingProperties,
  ...layoutProperties,
  ...spacingPropertiesShorthand,
  ...typographyProperties,
  ...positionProperties,
  ...borderColorProperties,
  ...borderProperties,
  ...shadowProperties,
  ...textShadowProperties,
  ...borderRadiusProperties,
  backgroundColor: true,
  bg: 'backgroundColor',
  color: true,
  opacity: true,
  zIndex: true,
};
