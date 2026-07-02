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
import { addDaysKey, dueLabel, formatTime, parseKey, todayKey, weekdayShort, weekOf } from '@/lib/dates';
import { successHaptic } from '@/lib/haptics';
import { useEvents } from '@/stores/events';
import { useTasks } from '@/stores/tasks';
import { colors, font, radius, space, tints } from '@/theme';

export default function PlanScreen() {
  const today = todayKey();
  const [selectedDay, setSelectedDay] = useState(today);
  const week = weekOf(today);

  const tasks = useTasks((s) => s.tasks);
  const lists = useTasks((s) => s.lists);
  const addTask = useTasks((s) => s.addTask);
  const toggleTask = useTasks((s) => s.toggle);
  const removeTask = useTasks((s) => s.remove);
  const events = useEvents((s) => s.events);
  const addEvent = useEvents((s) => s.add);
  const removeEvent = useEvents((s) => s.remove);

  const [listFilter, setListFilter] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);

  const [taskSheet, setTaskSheet] = useState(false);
  const [tTitle, setTTitle] = useState('');
  const [tList, setTList] = useState(lists[0]?.id ?? 'personal');
  const [tDue, setTDue] = useState<'today' | 'tomorrow' | 'selected' | 'none'>('none');
  const [tPriority, setTPriority] = useState(false);

  const [eventSheet, setEventSheet] = useState(false);
  const [eTitle, setETitle] = useState('');
  const [eStart, setEStart] = useState('');
  const [eDuration, setEDuration] = useState<number | null>(60);

  const dayEvents = events
    .filter((e) => e.date === selectedDay)
    .sort((a, b) => (a.start ?? '99').localeCompare(b.start ?? '99'));
  const dayTasks = tasks.filter((t) => t.due === selectedDay && !t.done);

  const openTasks = tasks.filter((t) => !t.done && (!listFilter || t.listId === listFilter));
  const doneTasks = tasks.filter((t) => t.done && (!listFilter || t.listId === listFilter));

  const saveTask = () => {
    if (!tTitle.trim()) return;
    const due =
      tDue === 'today' ? today
      : tDue === 'tomorrow' ? addDaysKey(today, 1)
      : tDue === 'selected' ? selectedDay
      : undefined;
    addTask({ title: tTitle, listId: tList, due, priority: tPriority });
    successHaptic();
    setTaskSheet(false);
    setTTitle('');
    setTPriority(false);
    setTDue('none');
  };

  const saveEvent = () => {
    if (!eTitle.trim()) return;
    const start = /^\d{1,2}:\d{2}$/.test(eStart.trim()) ? eStart.trim().padStart(5, '0') : undefined;
    addEvent({ title: eTitle, date: selectedDay, start, durationMin: eDuration ?? undefined });
    successHaptic();
    setEventSheet(false);
    setETitle('');
    setEStart('');
  };

  return (
    <Screen title="Plan" subtitle="One calendar, one task list — the whole week at a glance.">
      {/* week strip */}
      <View style={styles.week}>
        {week.map((key) => {
          const selected = key === selectedDay;
          const isToday = key === today;
          return (
            <Pressable
              key={key}
              onPress={() => setSelectedDay(key)}
              style={[styles.day, selected && styles.daySelected]}
            >
              <Text style={[styles.dayName, selected && { color: colors.card }]}>{weekdayShort(key)}</Text>
              <Text
                style={[
                  styles.dayNum,
                  selected && { color: colors.card },
                  isToday && !selected && { color: colors.accent },
                ]}
              >
                {parseKey(key).getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* selected day agenda */}
      <SectionHeader
        label={selectedDay === today ? 'Today' : weekdayShort(selectedDay)}
        action="+ Event"
        onAction={() => setEventSheet(true)}
      />
      {dayEvents.length === 0 && dayTasks.length === 0 ? (
        <EmptyState line="A blank day. Protect it, or plan it." />
      ) : (
        <Card>
          {dayEvents.map((e) => (
            <View key={e.id} style={styles.row}>
              <Text style={styles.time}>{e.start ? formatTime(e.start) : 'All day'}</Text>
              <Body style={{ flex: 1 }}>{e.title}</Body>
              {e.durationMin ? <Caption>{e.durationMin}m</Caption> : null}
              <Pressable onPress={() => removeEvent(e.id)} hitSlop={10}>
                <Feather name="x" size={15} color={colors.inkFaint} />
              </Pressable>
            </View>
          ))}
          {dayTasks.map((t) => (
            <View key={t.id} style={styles.row}>
              <Checkbox checked={t.done} onToggle={() => toggleTask(t.id)} size={22} color={tints.plan.color} />
              <Body style={{ flex: 1 }}>{t.title}</Body>
              {t.priority ? <Feather name="flag" size={14} color={colors.accent} /> : null}
            </View>
          ))}
        </Card>
      )}

      {/* tasks */}
      <SectionHeader label="Tasks" action="+ Task" onAction={() => setTaskSheet(true)} />
      <View style={styles.chipRow}>
        <Chip label="All" selected={!listFilter} onPress={() => setListFilter(null)} color={tints.plan.color} />
        {lists.map((l) => (
          <Chip
            key={l.id}
            label={l.name}
            selected={listFilter === l.id}
            onPress={() => setListFilter(l.id)}
            color={l.color}
          />
        ))}
      </View>

      {openTasks.length === 0 ? (
        <EmptyState line="Task list: empty. Manager: impressed." />
      ) : (
        <Card style={{ marginTop: space.sm }}>
          {openTasks.map((t) => {
            const list = lists.find((l) => l.id === t.listId);
            return (
              <View key={t.id} style={styles.row}>
                <Checkbox checked={t.done} onToggle={() => toggleTask(t.id)} size={22} color={tints.plan.color} />
                <View style={{ flex: 1 }}>
                  <Body>{t.title}</Body>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    {list ? (
                      <>
                        <View style={[styles.listDot, { backgroundColor: list.color }]} />
                        <Caption style={{ fontSize: 11 }}>{list.name}</Caption>
                      </>
                    ) : null}
                    {t.due ? (
                      <Caption style={{ fontSize: 11, color: t.due < today ? colors.danger : colors.inkSoft }}>
                        · {dueLabel(t.due)}
                      </Caption>
                    ) : null}
                  </View>
                </View>
                {t.priority ? <Feather name="flag" size={14} color={colors.accent} /> : null}
                <Pressable onPress={() => removeTask(t.id)} hitSlop={10}>
                  <Feather name="x" size={15} color={colors.inkFaint} />
                </Pressable>
              </View>
            );
          })}
        </Card>
      )}

      {doneTasks.length > 0 ? (
        <Pressable onPress={() => setShowDone((v) => !v)} style={{ marginTop: space.md }}>
          <Caption style={{ color: colors.inkFaint }}>
            {showDone ? 'Hide' : 'Show'} {doneTasks.length} completed
          </Caption>
        </Pressable>
      ) : null}
      {showDone
        ? doneTasks.map((t) => (
            <View key={t.id} style={[styles.row, { paddingHorizontal: space.lg }]}>
              <Checkbox checked onToggle={() => toggleTask(t.id)} size={22} color={colors.inkFaint} />
              <Body style={styles.strike}>{t.title}</Body>
            </View>
          ))
        : null}

      {/* new task sheet */}
      <Sheet visible={taskSheet} onClose={() => setTaskSheet(false)} title="A new task">
        <Field value={tTitle} onChangeText={setTTitle} placeholder="What needs doing?" autoFocus />
        <Micro style={{ marginTop: space.lg, marginBottom: space.sm }}>List</Micro>
        <View style={styles.chipRow}>
          {lists.map((l) => (
            <Chip key={l.id} label={l.name} selected={tList === l.id} onPress={() => setTList(l.id)} color={l.color} />
          ))}
        </View>
        <Micro style={{ marginTop: space.lg, marginBottom: space.sm }}>When</Micro>
        <View style={styles.chipRow}>
          <Chip label="Today" selected={tDue === 'today'} onPress={() => setTDue('today')} />
          <Chip label="Tomorrow" selected={tDue === 'tomorrow'} onPress={() => setTDue('tomorrow')} />
          {selectedDay !== today ? (
            <Chip
              label={`${weekdayShort(selectedDay)} ${parseKey(selectedDay).getDate()}`}
              selected={tDue === 'selected'}
              onPress={() => setTDue('selected')}
            />
          ) : null}
          <Chip label="Someday" selected={tDue === 'none'} onPress={() => setTDue('none')} />
        </View>
        <Micro style={{ marginTop: space.lg, marginBottom: space.sm }}>Priority</Micro>
        <View style={styles.chipRow}>
          <Chip label="🚩 This matters most" selected={tPriority} onPress={() => setTPriority((v) => !v)} color={colors.accent} />
        </View>
        <PillButton label="Add task" onPress={saveTask} disabled={!tTitle.trim()} style={{ marginTop: space.xl }} />
      </Sheet>

      {/* new event sheet */}
      <Sheet visible={eventSheet} onClose={() => setEventSheet(false)} title={`Event · ${weekdayShort(selectedDay)} ${parseKey(selectedDay).getDate()}`}>
        <Field value={eTitle} onChangeText={setETitle} placeholder="Lecture, meeting, gym…" autoFocus />
        <Micro style={{ marginTop: space.lg, marginBottom: space.sm }}>Start time (24h, e.g. 14:30) — optional</Micro>
        <Field value={eStart} onChangeText={setEStart} placeholder="14:30" keyboardType="numbers-and-punctuation" />
        <Micro style={{ marginTop: space.lg, marginBottom: space.sm }}>Duration</Micro>
        <View style={styles.chipRow}>
          {[30, 60, 90, 120].map((d) => (
            <Chip key={d} label={`${d}m`} selected={eDuration === d} onPress={() => setEDuration(d)} color={tints.plan.color} />
          ))}
          <Chip label="—" selected={eDuration === null} onPress={() => setEDuration(null)} color={tints.plan.color} />
        </View>
        <PillButton label="Add event" onPress={saveEvent} disabled={!eTitle.trim()} style={{ marginTop: space.xl }} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  week: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.field,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  daySelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  dayName: { fontFamily: font.body, fontSize: 10, color: colors.inkFaint, marginBottom: 2 },
  dayNum: { fontFamily: font.display, fontSize: 16, color: colors.ink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 9,
  },
  time: { fontFamily: font.semibold, fontSize: 12, color: colors.slate, width: 60 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  listDot: { width: 7, height: 7, borderRadius: 4 },
  strike: { textDecorationLine: 'line-through', color: colors.inkFaint },
});
