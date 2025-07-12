# Typography System

This typography system provides a consistent way to handle fonts, sizes, weights, and spacing throughout your React Native app.

## Features

- **TT Norms Pro** as the primary font family
- Consistent font weights, sizes, and line heights
- Platform-specific font handling
- Reusable Typography components
- Helper functions for custom typography styles

## Usage

### 1. Using Predefined Typography Components

```jsx
import Typography, { 
  Heading1, 
  Body1, 
  ButtonText, 
  Label,
  TabText,
  TabTextActive 
} from '../components/Typography';

// Basic usage
<Body1>This is body text</Body1>
<Heading1>This is a heading</Heading1>

// With custom color
<ButtonText color="#FF0000">Red button text</ButtonText>

// With custom alignment
<Label align="center">Centered label</Label>

// With custom style
<Body1 style={{ marginBottom: 10 }}>Text with margin</Body1>
```

### 2. Using the Main Typography Component

```jsx
import Typography from '../components/Typography';

// Using predefined variants
<Typography variant="h1">Heading 1</Typography>
<Typography variant="body1">Body text</Typography>
<Typography variant="button">Button text</Typography>

// Custom typography
<Typography 
  weight="500"
  size={16}
  lineHeight={120}
  letterSpacing={0}
  color="#333333"
>
  Custom styled text
</Typography>
```

### 3. Using Typography Constants Directly

```jsx
import { typography, createTypographyStyle } from '../constants/typography';

// Using predefined styles
const styles = StyleSheet.create({
  title: typography.h1,
  subtitle: typography.h3,
  body: typography.body1,
});

// Creating custom styles
const customStyle = createTypographyStyle({
  weight: '500',
  size: 14,
  lineHeightPercent: 120,
  letterSpacingValue: 0,
});
```

## Available Typography Variants

### Headings
- `h1` - Large heading (28px, bold)
- `h2` - Medium heading (24px, semi-bold)
- `h3` - Small heading (20px, semi-bold)
- `h4` - Extra small heading (18px, medium)
- `h5` - Tiny heading (16px, medium)
- `h6` - Micro heading (14px, medium)

### Body Text
- `body1` - Primary body text (14px, regular)
- `body2` - Secondary body text (12px, regular)

### Buttons
- `button` - Button text (14px, medium)
- `buttonSmall` - Small button text (12px, medium)

### Special
- `caption` - Caption text (10px, regular)
- `overline` - Overline text (10px, medium, uppercase)
- `label` - Label text (14px, medium)

### UI Elements
- `tab` - Tab text (14px, regular)
- `tabActive` - Active tab text (14px, medium)
- `input` - Input text (14px, regular)
- `inputPlaceholder` - Input placeholder (12px, regular)

## Font Weights

```jsx
import { fontWeight } from '../constants/typography';

// Available weights
fontWeight.thin        // 100
fontWeight.extraLight  // 200
fontWeight.light       // 300
fontWeight.regular     // 400
fontWeight.medium      // 500
fontWeight.semiBold    // 600
fontWeight.bold        // 700
fontWeight.extraBold   // 800
fontWeight.black       // 900
```

## Font Sizes

```jsx
import { fontSize } from '../constants/typography';

// Available sizes
fontSize.xs    // 10px
fontSize.sm    // 12px
fontSize.base  // 14px
fontSize.lg    // 16px
fontSize.xl    // 18px
fontSize['2xl'] // 20px
fontSize['3xl'] // 24px
fontSize['4xl'] // 28px
fontSize['5xl'] // 32px
fontSize['6xl'] // 36px
```

## Line Heights

```jsx
import { lineHeight } from '../constants/typography';

// Available line heights (as percentage)
lineHeight.tight   // 100%
lineHeight.normal  // 120%
lineHeight.relaxed // 140%
lineHeight.loose   // 160%
```

## Letter Spacing

```jsx
import { letterSpacing } from '../constants/typography';

// Available letter spacing
letterSpacing.tight  // -0.5
letterSpacing.normal // 0
letterSpacing.wide   // 0.5
letterSpacing.wider  // 1
letterSpacing.widest // 2
```

## Examples

### Dashboard Header
```jsx
<View style={styles.header}>
  <Body1 style={styles.eventName}>{eventInfo?.event_title}</Body1>
  <Body1 style={styles.separator}>   </Body1>
  <Body1 style={styles.cityName}>{eventInfo?.cityName}</Body1>
</View>
```

### Tab Navigation
```jsx
<TouchableOpacity style={styles.tabButton}>
  <Typography 
    variant={selectedTab === 'All' ? "tabActive" : "tab"}
    color={selectedTab === 'All' ? color.brown_3C200A : color.black_544B45}
  >
    All
  </Typography>
</TouchableOpacity>
```

### Button Text
```jsx
<TouchableOpacity style={styles.button}>
  <ButtonText color={color.white_FFFFFF}>
    Submit
  </ButtonText>
</TouchableOpacity>
```

### Input Field
```jsx
<TextInput
  style={[styles.input, typography.input]}
  placeholder="Enter text..."
  placeholderTextColor={color.brown_766F6A}
/>
```

## Migration Guide

### Before (Inline Styles)
```jsx
<Text style={{
  fontFamily: 'TTNormsPro',
  fontWeight: '500',
  fontSize: 14,
  lineHeight: 16.8,
  letterSpacing: 0,
}}>
  Text content
</Text>
```

### After (Typography System)
```jsx
<Label>Text content</Label>
// or
<Typography variant="label">Text content</Typography>
```

## Benefits

1. **Consistency** - All text follows the same design system
2. **Maintainability** - Change typography in one place
3. **Performance** - Predefined styles reduce style calculations
4. **Type Safety** - Predefined variants prevent typos
5. **Design System** - Follows your exact typography specifications

## Your Specific Requirements

Based on your requirements:
- **Font Family**: TT Norms Pro
- **Font Weight**: 500 (Medium)
- **Font Size**: 14px
- **Line Height**: 120%
- **Letter Spacing**: 0%

This is now available as:
```jsx
<Label>Your text here</Label>
// or
<Typography 
  weight="500"
  size={14}
  lineHeight={120}
  letterSpacing={0}
>
  Your text here
</Typography>
``` 