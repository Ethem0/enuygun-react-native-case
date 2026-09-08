import { Pressable, StyleSheet, Text } from 'react-native';

type FavoriteButtonProps = {
  isFavorite?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

export function FavoriteButton({
  isFavorite = false,
  onPress,
  disabled = onPress === undefined,
}: FavoriteButtonProps) {
  return (
    <Pressable
      accessibilityLabel={
        disabled
          ? 'Favori özelliği henüz kullanılamıyor'
          : isFavorite
            ? 'Favorilerden çıkar'
            : 'Favorilere ekle'
      }
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: isFavorite }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{isFavorite ? '★ Favori' : '☆ Favori'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#b8bec8',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: '#243043',
    fontSize: 14,
    fontWeight: '600',
  },
});
