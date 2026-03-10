import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Typography from '../components/Typography';
import { color } from '../color/color';

// ─────────────────────────────────────────────
// CircleItemList
//
// Renders a horizontal scrollable tab bar.
// Active tab: bold label + brown underline indicator.
// Inactive tabs: regular weight label, no underline.
//
// Props:
//   items               - Array of { id, label } objects (icon ignored)
//   onItemPress         - (item) => void
//   activeId            - string | null — currently selected item id
//   activeRingColor     - string — underline/active color (default: btnBrown)
//   labelColor          - string — text color for all tabs
//   horizontalPadding   - number (default: 16)
//   itemSpacing         - number — gap between tabs (default: 24)
//   labelSize           - number — font size (default: 14)
// ─────────────────────────────────────────────

const CircleItemList = ({
  items,
  onItemPress,
  activeId = null,
  activeRingColor = color.btnBrown_AE6F28,
  labelColor = color.brown_3C200A,
  horizontalPadding = 16,
  itemSpacing = 24,
  labelSize = 14,

  // Legacy props accepted but not used (keeps existing call-sites from crashing)
  circleSize,
  iconSize,
  activeRingWidth,
  circleBackgroundColor,
}) => {
  const isActive = (id) => activeId === id;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: horizontalPadding },
        ]}
      >
        {items.map((item, index) => {
          const active = isActive(item.id);

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.tabItem,
                { marginRight: index < items.length - 1 ? itemSpacing : 0 },
              ]}
              onPress={() => onItemPress?.(item)}
              activeOpacity={0.7}
            >
              {/* Label */}
              <Typography
                weight={active ? '700' : '400'}
                size={labelSize}
                color={labelColor}
                numberOfLines={1}
              >
                {item.label}
              </Typography>

              {/* Active underline indicator */}
              <View
                style={[
                  styles.underline,
                  active
                    ? { backgroundColor: activeRingColor }
                    : { backgroundColor: 'transparent' },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Full-width bottom border */}
      <View style={[styles.bottomBorder]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 0,
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  underline: {
    height: 2.5,
    width: '100%',
    borderRadius: 2,
    marginTop: 6,
  },
  bottomBorder: {
    height: 1,
    backgroundColor: '#E8E8E8',
    width: '100%',
  },
});

export default CircleItemList;