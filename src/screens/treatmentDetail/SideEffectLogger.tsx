import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SideEffect, SideEffectSeverity } from '../../types/Treatment';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import { useLanguage } from '../../contexts/LanguageContext';

const SEVERITY_OPTIONS: SideEffectSeverity[] = ['mild', 'moderate', 'severe'];

const SEVERITY_COLORS: Record<SideEffectSeverity, string> = {
  mild: '#5BB5C3',
  moderate: '#E8734A',
  severe: '#C0392B',
};

const SEVERITY_BG: Record<SideEffectSeverity, string> = {
  mild: '#EBF8FB',
  moderate: '#FDF0EB',
  severe: '#FDECEC',
};

interface SideEffectLoggerProps {
  sideEffects: SideEffect[];
  onChange: (effects: SideEffect[]) => void;
  readonly?: boolean;
}

export function SideEffectLogger({ sideEffects, onChange, readonly }: SideEffectLoggerProps) {
  const { t } = useLanguage();
  const [showAdd, setShowAdd] = useState(false);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SideEffectSeverity>('mild');

  function handleAdd() {
    if (!description.trim()) return;
    const newEffect: SideEffect = {
      id: `se_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      description: description.trim(),
      severity,
      loggedAt: new Date(),
    };
    onChange([...sideEffects, newEffect]);
    setDescription('');
    setSeverity('mild');
    setShowAdd(false);
  }

  function handleDelete(id: string) {
    Alert.alert('Remove', 'Remove this side effect?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => onChange(sideEffects.filter((e) => e.id !== id)),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('side_effects')}</Text>
        {!readonly && (
          <TouchableOpacity onPress={() => setShowAdd(!showAdd)} style={styles.addLink}>
            <Text style={styles.addLinkText}>{t('add_side_effect')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Add form */}
      {showAdd && !readonly && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Nausea, fatigue, headache…"
            placeholderTextColor={Colors.textMuted}
            autoFocus
          />

          {/* Severity picker */}
          <View style={styles.severityRow}>
            {SEVERITY_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.severityChip,
                  { backgroundColor: severity === s ? SEVERITY_COLORS[s] : Colors.surface },
                  { borderColor: SEVERITY_COLORS[s] },
                ]}
                onPress={() => setSeverity(s)}
              >
                <Text style={[
                  styles.severityLabel,
                  { color: severity === s ? '#fff' : SEVERITY_COLORS[s] },
                ]}>
                  {t(`severity_${s}` as any)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setShowAdd(false); setDescription(''); }}
            >
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !description.trim() && styles.saveBtnDisabled]}
              onPress={handleAdd}
              disabled={!description.trim()}
            >
              <Text style={styles.saveBtnText}>{t('done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Effects list */}
      {sideEffects.length === 0 ? (
        <Text style={styles.empty}>{t('no_side_effects')}</Text>
      ) : (
        <View style={styles.list}>
          {sideEffects.map((effect) => (
            <View
              key={effect.id}
              style={[styles.effectRow, { backgroundColor: SEVERITY_BG[effect.severity] }]}
            >
              <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLORS[effect.severity] }]} />
              <View style={styles.effectInfo}>
                <Text style={styles.effectDesc}>{effect.description}</Text>
                <View style={styles.effectMeta}>
                  <Text style={[styles.effectSeverity, { color: SEVERITY_COLORS[effect.severity] }]}>
                    {t(`severity_${effect.severity}` as any)}
                  </Text>
                  <Text style={styles.effectDate}>
                    {new Date(effect.loggedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              {!readonly && (
                <TouchableOpacity onPress={() => handleDelete(effect.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  addLink: { padding: 4 },
  addLinkText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  addForm: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  severityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  severityChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  severityLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  saveBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: {
    fontSize: FontSize.sm,
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.semibold,
  },
  empty: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  list: { gap: Spacing.xs },
  effectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  effectInfo: { flex: 1 },
  effectDesc: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  effectMeta: { flexDirection: 'row', gap: Spacing.sm, marginTop: 2 },
  effectSeverity: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  effectDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  deleteBtn: { padding: 4 },
  deleteText: { fontSize: 14, color: Colors.textMuted },
});
