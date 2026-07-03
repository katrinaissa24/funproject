import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { Field } from '@/components/Field';
import { PillButton } from '@/components/PillButton';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { Sheet } from '@/components/Sheet';
import { Body, Caption, Micro } from '@/components/typography';
import { addDaysKey, todayKey } from '@/lib/dates';
import { successHaptic, tapHaptic } from '@/lib/haptics';
import { useGoals } from '@/stores/goals';
import { useInbox } from '@/stores/inbox';
import { DUMP_LIST_ID, useTasks } from '@/stores/tasks';
import { colors, font, space, tints } from '@/theme';
import type { IdeaTag, InboxItem } from '@/types';

const IDEA_TAGS: IdeaTag[] = ['video', 'marketing', 'startup', 'random'];
type Filter = 'unsorted' | 'idea' | 'shopping' | 'note';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'unsorted', label: 'Unsorted' },
  { key: 'idea', label: 'Ideas' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'note', label: 'Notes' },
];

export default function InboxScreen() {
  const items = useInbox((s) => s.items);
  const add = useInbox((s) => s.add);
  const sortInto = useInbox((s) => s.sortInto);
  const toggleDone = useInbox((s) => s.toggleDone);
  const remove = useInbox((s) => s.remove);
  const addTask = useTasks((s) => s.addTask);
  const lists = useTasks((s) => s.lists);
  const addGoal = useGoals((s) => s.addGoal);

  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState<Filter>('unsorted');
  const [triaging, setTriaging] = useState<InboxItem | null>(null);
  const [taskStep, setTaskStep] = useState(false);
  const [taskList, setTaskList] = useState(DUMP_LIST_ID);
  const [taskDue, setTaskDue] = useState<'today' | 'tomorrow' | 'none'>('none');

  const capture = () => {
    if (!draft.trim()) return;
    add(draft);
    setDraft('');
    tapHaptic();
    setFilter('unsorted');
  };

  const openTriage = (item: InboxItem) => {
    setTriaging(item);
    setTaskStep(false);
    setTaskList(DUMP_LIST_ID);
    setTaskDue('none');
  };

  const closeTriage = () => setTriaging(null);

  const confirmTask = () => {
    if (!triaging) return;
    addTask({
      title: triaging.text,
      listId: taskList,
      due: taskDue === 'today' ? todayKey() : taskDue === 'tomorrow' ? addDaysKey(todayKey(), 1) : undefined,
    });
    remove(triaging.id);
    successHaptic();
    closeTriage();
  };

  const confirmIdea = (tag: IdeaTag) => {
    if (!triaging) return;
    sortInto(triaging.id, 'idea', tag);
    successHaptic();
    closeTriage();
  };

  const confirmSimple = (kind: 'shopping' | 'note') => {
    if (!triaging) return;
    sortInto(triaging.id, kind);
    successHaptic();
    closeTriage();
  };

  const confirmGoal = () => {
    if (!triaging) return;
    addGoal({
      title: triaging.text,
      why: 'Captured in a brain dump — open it and give it a why.',
      milestones: [],
    });
    remove(triaging.id);
    successHaptic();
    closeTriage();
  };

  const shown = items.filter((i) => i.kind === filter);
  const unsortedCount = items.filter((i) => i.kind === 'unsorted').length;

  return (
    <Screen title="Inbox" subtitle="Dump it here the second it appears. Sort it in one tap, later.">
      {/* capture */}
      <View style={styles.captureRow}>
        <Field
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={capture}
          placeholder="What’s on your mind?"
          returnKeyType="done"
          style={{ flex: 1 }}
        />
        <Pressable onPress={capture} style={styles.captureBtn} hitSlop={6}>
          <Feather name="arrow-up" size={20} color={colors.card} />
        </Pressable>
      </View>

      {/* filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const count = f.key === 'unsorted' ? unsortedCount : undefined;
          return (
            <Chip
              key={f.key}
              label={count ? `${f.label} · ${count}` : f.label}
              selected={filter === f.key}
              onPress={() => setFilter(f.key)}
              color={tints.inbox.color}
            />
          );
        })}
      </View>

      {shown.length === 0 ? (
        <EmptyState
          line={
            filter === 'unsorted'
              ? 'All sorted. Your head is clear.'
              : `Nothing filed under ${FILTERS.find((f) => f.key === filter)!.label.toLowerCase()} yet.`
          }
          caption={filter === 'unsorted' ? 'Anything you dump above lands here first.' : undefined}
        />
      ) : (
        shown.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => (item.kind === 'unsorted' ? openTriage(item) : undefined)}
          >
            <Card style={styles.itemCard}>
              {item.kind === 'shopping' ? (
                <Checkbox
                  checked={!!item.done}
                  onToggle={() => toggleDone(item.id)}
                  color={tints.inbox.color}
                  size={22}
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <Body style={item.done ? styles.strike : undefined}>{item.text}</Body>
                {item.kind === 'idea' && item.tag ? (
                  <Micro style={{ marginTop: 6, color: tints.inbox.color }}>{item.tag}</Micro>
                ) : null}
              </View>
              {item.kind === 'unsorted' ? (
                <Feather name="chevron-right" size={18} color={colors.inkFaint} />
              ) : (
                <Pressable onPress={() => remove(item.id)} hitSlop={10}>
                  <Feather name="x" size={16} color={colors.inkFaint} />
                </Pressable>
              )}
            </Card>
          </Pressable>
        ))
      )}

      {/* triage sheet */}
      <Sheet visible={!!triaging} onClose={closeTriage} title="Where does this belong?">
        {triaging ? (
          <>
            <Text style={styles.triageText}>“{triaging.text}”</Text>

            {!taskStep ? (
              <>
                <SectionHeader label="Turn it into" />
                <View style={styles.destGrid}>
                  <DestButton icon="check-square" label="Task" onPress={() => setTaskStep(true)} />
                  <DestButton icon="shopping-bag" label="Shopping" onPress={() => confirmSimple('shopping')} />
                  <DestButton icon="file-text" label="Note" onPress={() => confirmSimple('note')} />
                  <DestButton icon="target" label="Goal" onPress={confirmGoal} />
                  <DestButton
                    icon="trash-2"
                    label="Let it go"
                    onPress={() => {
                      remove(triaging.id);
                      closeTriage();
                    }}
                  />
                </View>
                <SectionHeader label="Or tag it as an idea" />
                <View style={styles.filterRow}>
                  {IDEA_TAGS.map((tag) => (
                    <Chip key={tag} label={tag} onPress={() => confirmIdea(tag)} color={tints.inbox.color} />
                  ))}
                </View>
              </>
            ) : (
              <>
                <SectionHeader label="Which list?" />
                <View style={styles.filterRow}>
                  {lists.map((l) => (
                    <Chip
                      key={l.id}
                      label={l.name}
                      selected={taskList === l.id}
                      onPress={() => setTaskList(l.id)}
                      color={l.color}
                    />
                  ))}
                </View>
                <SectionHeader label="When?" />
                <View style={styles.filterRow}>
                  <Chip label="Today" selected={taskDue === 'today'} onPress={() => setTaskDue('today')} />
                  <Chip label="Tomorrow" selected={taskDue === 'tomorrow'} onPress={() => setTaskDue('tomorrow')} />
                  <Chip label="Someday" selected={taskDue === 'none'} onPress={() => setTaskDue('none')} />
                </View>
                <PillButton label="Add task" onPress={confirmTask} style={{ marginTop: space.xl }} />
              </>
            )}
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

function DestButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.dest}>
      <Feather name={icon} size={18} color={colors.ink} />
      <Caption style={{ color: colors.ink, fontFamily: font.medium }}>{label}</Caption>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  captureRow: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  captureBtn: {
    backgroundColor: colors.ink,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg, marginBottom: space.sm },
  itemCard: {
    marginTop: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  strike: { textDecorationLine: 'line-through', color: colors.inkFaint },
  triageText: {
    fontFamily: font.serifItalic,
    fontSize: 17,
    lineHeight: 24,
    color: colors.ink,
  },
  destGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  dest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
