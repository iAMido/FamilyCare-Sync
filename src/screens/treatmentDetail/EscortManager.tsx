import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { updateTreatment } from '../../services/firestoreService';
import { Treatment } from '../../types/Treatment';
import { AppUser } from '../../types/User';
import { Avatar } from '../../components/common/Avatar';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';

interface Props {
  treatment: Treatment;
  family: AppUser[];
  currentUser: AppUser | null;
  onUpdate: () => void;
}

export function EscortManager({ treatment, family, currentUser, onUpdate }: Props) {
  const caregivers = family.filter((u) => u.role === 'caregiver');
  const escort = family.find((u) => u.uid === treatment.escortId);
  const isDisabled = treatment.status !== 'scheduled';

  async function assign(uid: string) {
    await updateTreatment(treatment.id, { escortId: uid });
    onUpdate();
  }

  async function unassign() {
    await updateTreatment(treatment.id, { escortId: null });
    onUpdate();
  }

  return (
    <View>
      {escort ? (
        <View style={styles.assignedRow}>
          <Avatar name={escort.displayName} size={40} color={escort.avatarColor} />
          <View style={styles.assignedInfo}>
            <Text style={styles.assignedName}>{escort.displayName}</Text>
            <Text style={styles.assignedSub}>
              {escort.uid === currentUser?.uid ? 'You are attending' : 'Assigned escort'}
            </Text>
          </View>
          {!isDisabled && (
            <TouchableOpacity onPress={unassign} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>Change</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View>
          {!isDisabled && currentUser?.role === 'caregiver' && (
            <TouchableOpacity
              style={styles.imGoingBtn}
              onPress={() => assign(currentUser.uid)}
            >
              <Text style={styles.imGoingText}>✋ I'm Going</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.orLabel}>Assign to:</Text>
          <View style={styles.familyList}>
            {caregivers.map((member) => (
              <TouchableOpacity
                key={member.uid}
                style={styles.memberBtn}
                onPress={() => assign(member.uid)}
                disabled={isDisabled}
              >
                <Avatar name={member.displayName} size={32} color={member.avatarColor} />
                <Text style={styles.memberName}>{member.displayName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  assignedInfo: {
    flex: 1,
  },
  assignedName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  assignedSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  removeBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  imGoingBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  imGoingText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  orLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  familyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  memberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  memberName: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
});
