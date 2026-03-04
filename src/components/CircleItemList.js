import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Typography from '../components/Typography';
import { color } from '../color/color';

// ─────────────────────────────────────────────
// CircleItemList
// ─────────────────────────────────────────────
//
// Props:
//   items               - Array of { id, label, icon } objects
//   onItemPress          - (item) => void
//   activeId             - string | null — currently selected item id
//   circleSize           - number (default: 72)
//   iconSize             - number (default: 36)
//   activeRingColor      - string (default: '#AE6F28')
//   activeRingWidth      - number (default: 2)
//   circleBackgroundColor - string (default: '#F5F5F5')
//   labelSize            - number (default: 12)
//   labelColor           - string (default: '#3C200A')
//   horizontalPadding    - number (default: 16)
//   itemSpacing          - number (default: 20)

const CircleItemList = ({
  items,
  onItemPress,
  activeId = null,
  circleSize = 72,
  iconSize = 36,
  activeRingColor = color.borderBrown_CEBCA0,
  activeRingWidth = 2,
  circleBackgroundColor = color.white_FFFFFF,
  labelSize = 12,
  labelColor = color.brown_3C200A,
  horizontalPadding = 16,
  itemSpacing = 20,
}) => {
    const isActive = (id) => activeId === id;

    // Render icon — supports both React elements (SVG components) and image sources (require/uri)
    const renderIcon = (icon) => {
      if (React.isValidElement(icon)) {
        return icon;
      }
      return (
        <Image
          source={icon}
          style={{ width: iconSize, height: iconSize }}
          resizeMode="contain"
        />
      );
    };
  
    return (
      <View style={styles.wrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding, gap: itemSpacing },
          ]}
        >
          {items.map((item) => {
            const active = isActive(item.id);
  
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.itemContainer}
                onPress={() => onItemPress?.(item)}
                activeOpacity={0.7}
              >
                {/* Circle with optional active ring */}
                <View
                  style={[
                    styles.circle,
                    {
                      width: circleSize,
                      height: circleSize,
                      borderRadius: circleSize / 2,
                      backgroundColor: circleBackgroundColor,
                    },
                    active && {
                      borderWidth: activeRingWidth,
                      borderColor: activeRingColor,
                    },
                  ]}
                >
                  {renderIcon(item.icon)}
                </View>
  
                {/* Label */}
                <Typography
                  weight={active ? '600' : '400'}
                  size={labelSize}
                  color={labelColor}
                  style={styles.label}
                  numberOfLines={1}
                >
                  {item.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    wrapper: {
      marginBottom: 16,
    },
    scrollContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    itemContainer: {
      alignItems: 'center',
    },
    circle: {
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    label: {
      marginTop: 8,
      textAlign: 'center',
      maxWidth: 80,
    },
  });
  
  export default CircleItemList;