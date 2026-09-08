import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { FlightSort } from '../types/flight.types';

type FilterSortControlsProps = {
  onlyDirect: boolean;
  sort: FlightSort;
  onOnlyDirectChange: (value: boolean) => void;
  onSortChange: (sort: FlightSort) => void;
};

export function FilterSortControls({
  onlyDirect,
  sort,
  onOnlyDirectChange,
  onSortChange,
}: FilterSortControlsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Yalnızca direkt uçuşlar"
        accessibilityRole="switch"
        accessibilityState={{ checked: onlyDirect }}
        hitSlop={8}
        onPress={() => onOnlyDirectChange(!onlyDirect)}
        style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
      >
        <Text style={styles.controlText}>
          {onlyDirect ? '✓' : '○'} Yalnızca direkt
        </Text>
      </Pressable>

      <Text style={styles.sectionLabel}>Sırala</Text>
      <View accessibilityRole="radiogroup" style={styles.sortRow}>
        <SortButton
          label="En düşük fiyat"
          selected={sort === 'price'}
          onPress={() => onSortChange('price')}
        />
        <SortButton
          label="En kısa süre"
          selected={sort === 'duration'}
          onPress={() => onSortChange('duration')}
        />
      </View>
    </View>
  );
}

type SortButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function SortButton({ label, selected, onPress }: SortButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.sortButton,
        selected && styles.selectedSortButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.controlText, selected && styles.selectedText]}>
        {selected ? '●' : '○'} {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e7ec',
    backgroundColor: '#ffffff',
  },
  filterButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#b8bec8',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  sectionLabel: {
    marginTop: 14,
    marginBottom: 8,
    color: '#586174',
    fontSize: 13,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#b8bec8',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  selectedSortButton: {
    borderColor: '#2457a7',
    backgroundColor: '#eef4ff',
  },
  controlText: {
    color: '#243043',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedText: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.65,
  },
});
