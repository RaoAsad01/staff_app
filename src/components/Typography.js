import React from 'react';
import { Text as RNText } from 'react-native';
import { typography, createTypographyStyle, getTypographyStyle } from '../constants/typography';

const Typography = ({
  children,
  variant = 'body1',
  style,
  weight,
  size,
  lineHeight,
  letterSpacing,
  color,
  align = 'left',
  numberOfLines,
  onPress,
  ...props
}) => {
  // Get base typography style
  let textStyle = getTypographyStyle(variant);

  // Override with custom properties if provided
  if (weight || size || lineHeight || letterSpacing) {
    textStyle = {
      ...textStyle,
      ...createTypographyStyle({
        weight: weight || textStyle.fontWeight,
        size: size || textStyle.fontSize,
        lineHeightPercent: lineHeight || 120,
        letterSpacingValue: letterSpacing || 0,
      }),
    };
  }

  // Add color and alignment
  const finalStyle = [
    textStyle,
    {
      color,
      textAlign: align,
    },
    style,
  ];

  return (
    <RNText
      style={finalStyle}
      numberOfLines={numberOfLines}
      onPress={onPress}
      {...props}
    >
      {children}
    </RNText>
  );
};

// Predefined Typography components for common use cases
export const Heading1 = (props) => <Typography variant="h1" {...props} />;
export const Heading2 = (props) => <Typography variant="h2" {...props} />;
export const Heading3 = (props) => <Typography variant="h3" {...props} />;
export const Heading4 = (props) => <Typography variant="h4" {...props} />;
export const Heading5 = (props) => <Typography variant="h5" {...props} />;
export const Heading6 = (props) => <Typography variant="h6" {...props} />;

export const Body1 = (props) => <Typography variant="body1" {...props} />;
export const Body2 = (props) => <Typography variant="body2" {...props} />;

export const ButtonText = (props) => <Typography variant="button" {...props} />;
export const ButtonTextDemiBold = (props) => <Typography variant="buttonDemiBold" {...props} />;
export const ButtonTextSmall = (props) => <Typography variant="buttonSmall" {...props} />;

export const Caption = (props) => <Typography variant="caption" {...props} />;
export const Overline = (props) => <Typography variant="overline" {...props} />;

export const Label = (props) => <Typography variant="label" {...props} />;

export const TabText = (props) => <Typography variant="tab" {...props} />;
export const TabTextActive = (props) => <Typography variant="tabActive" {...props} />;

export const InputText = (props) => <Typography variant="input" {...props} />;
export const InputPlaceholder = (props) => <Typography variant="inputPlaceholder" {...props} />;

export default Typography; 