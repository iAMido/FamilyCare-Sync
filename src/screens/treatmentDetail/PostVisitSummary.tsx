import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { updateTreatment } from '../../services/firestoreService';
import { Treatment } from '../../types/Treatment';
import { AppUser } from '../../types/User';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import dayjs from 'dayjs';

interface Props {
  treatment: Treatment;
  currentUser: AppUser | null;
  onUpdate: () => void;
}

export function PostVisitSummary({ treatment, currentUser, onUpdate }: Props) {
  const [text, setText] = useState(treatment.summary?.text ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isCompleted = treatment.status === 'completed';
  const canEdit = !isCompleted && !!currentUser;

  async function handleSave() {
    setSaving(true);
    await updateTreatment(treatment.id, {
      summary: { text, attachments: treatment.summary?.attachments ?? [] },
      status: 'completed',
    });
    setSaving(false);
    setSaved(true);
    onUpdate();
  }

  if (isCompleted && treatment.summary) {
    return (
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{treatment.summary.text || 'No summary provided.'}</Text>
        {treatment.summary.updatedAt && (
          <Text style={styles.summaryDate}>
            Updated {dayjs(treatment.summary.updatedAt).format('D MMM, HH:mm')}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.hint}>
        Add a summary of the visit so the whole family stays informed.
      </Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Doctor said... Next steps... Medications changed..."
        placeholderTextColor={Colors.textMuted}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        editable={!isCompleted}
      />
      {!isCompleted && (
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving || !text.trim()}
        >
          {saving ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.saveBtnText}>
              {saved ? '✅ Saved' : 'Save Summary & Mark Complete'}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  input: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  summaryBox: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  summaryText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  summaryDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
