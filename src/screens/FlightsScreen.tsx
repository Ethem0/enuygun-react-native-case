import { useEffect, useRef } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterSortControls } from '../components/FilterSortControls';
import { FlightCard } from '../components/FlightCard';
import type { RootStackParamList } from '../navigation/navigation.types';
import { useFlightListStore } from '../stores/flightListStore';
import type { FlightDto } from '../types/flight.types';

type FlightsScreenProps = NativeStackScreenProps<RootStackParamList, 'Flights'>;

export function FlightsScreen({ navigation }: FlightsScreenProps) {
  const listRef = useRef<FlatList<FlightDto>>(null);
  const items = useFlightListStore((state) => state.items);
  const meta = useFlightListStore((state) => state.meta);
  const sort = useFlightListStore((state) => state.sort);
  const onlyDirect = useFlightListStore((state) => state.onlyDirect);
  const isInitialLoading = useFlightListStore(
    (state) => state.isInitialLoading,
  );
  const initialError = useFlightListStore((state) => state.initialError);
  const isPaginationLoading = useFlightListStore(
    (state) => state.isPaginationLoading,
  );
  const paginationError = useFlightListStore(
    (state) => state.paginationError,
  );
  const fetchInitial = useFlightListStore((state) => state.fetchInitial);
  const fetchNextPage = useFlightListStore((state) => state.fetchNextPage);
  const changeOnlyDirect = useFlightListStore(
    (state) => state.changeOnlyDirect,
  );
  const changeSort = useFlightListStore((state) => state.changeSort);
  const retryInitial = useFlightListStore((state) => state.retryInitial);
  const retryPagination = useFlightListStore(
    (state) => state.retryPagination,
  );

  useEffect(() => {
    void fetchInitial();
  }, [fetchInitial]);

  useEffect(() => {
    listRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, [onlyDirect, sort]);

  const isWaitingForFirstResponse =
    meta === null && initialError === null && items.length === 0;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <FilterSortControls
        onlyDirect={onlyDirect}
        sort={sort}
        onOnlyDirectChange={(value) => void changeOnlyDirect(value)}
        onSortChange={(value) => void changeSort(value)}
      />

      {meta !== null ? (
        <Text accessibilityLiveRegion="polite" style={styles.resultCount}>
          {meta.total} uçuş bulundu
        </Text>
      ) : null}

      {isInitialLoading || isWaitingForFirstResponse ? (
        <View style={styles.centeredState}>
          <ActivityIndicator accessibilityLabel="Uçuşlar yükleniyor" size="large" />
          <Text style={styles.stateText}>Uçuşlar yükleniyor…</Text>
        </View>
      ) : initialError !== null ? (
        <StateMessage
          actionLabel="Tekrar dene"
          message={initialError}
          title="Uçuşlar yüklenemedi"
          onAction={() => void retryInitial()}
        />
      ) : meta !== null && items.length === 0 ? (
        <StateMessage
          actionLabel={onlyDirect ? 'Direkt filtresini temizle' : undefined}
          message={
            onlyDirect
              ? 'Yalnızca direkt uçuş filtresine uygun sonuç yok.'
              : undefined
          }
          title="Uçuş bulunamadı"
          onAction={onlyDirect ? () => void changeOnlyDirect(false) : undefined}
        />
      ) : (
        <FlatList
          ref={listRef}
          contentContainerStyle={styles.listContent}
          data={items}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            <PaginationFooter
              error={paginationError}
              isLoading={isPaginationLoading}
              onRetry={() => void retryPagination()}
            />
          }
          onEndReached={() => void fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <FlightCard
              flight={item}
              onPress={() =>
                navigation.navigate('FlightDetail', { flightId: item.id })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

type StateMessageProps = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

function StateMessage({
  title,
  message,
  actionLabel,
  onAction,
}: StateMessageProps) {
  return (
    <View style={styles.centeredState}>
      <Text accessibilityRole="header" style={styles.stateTitle}>
        {title}
      </Text>
      {message ? <Text style={styles.stateText}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type PaginationFooterProps = {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

function PaginationFooter({
  isLoading,
  error,
  onRetry,
}: PaginationFooterProps) {
  if (isLoading) {
    return (
      <View style={styles.paginationState}>
        <ActivityIndicator accessibilityLabel="Daha fazla uçuş yükleniyor" />
        <Text style={styles.paginationText}>Daha fazla uçuş yükleniyor…</Text>
      </View>
    );
  }

  if (error !== null) {
    return (
      <View style={styles.paginationState}>
        <Text style={styles.paginationText}>{error}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Text style={styles.actionButtonText}>Tekrar dene</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  resultCount: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#3e4859',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 2,
    paddingBottom: 24,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateTitle: {
    color: '#151b26',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateText: {
    marginTop: 8,
    color: '#586174',
    fontSize: 15,
    textAlign: 'center',
  },
  actionButton: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#2457a7',
    paddingHorizontal: 18,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  paginationState: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  paginationText: {
    marginTop: 8,
    color: '#586174',
    fontSize: 14,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
