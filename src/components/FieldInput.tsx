import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { colors } from '@/theme/colors';
import { ui } from '@/theme/ui';
import type { SetupField } from '@/types';
import { normalizeClockTime } from '@/lib/time-format';

interface FieldInputProps {
  field: SetupField;
  value: string | boolean | undefined;
  onChange: (value: string | boolean) => void;
  onFocus?: () => void;
  compact?: boolean;
}

export function FieldInput({ field, value, onChange, onFocus, compact = false }: FieldInputProps) {
  const label = field.label || field.fieldName;
  const required = field.required && !field.skipped;

  if (field.type === 'checkbox') {
    return (
      <Pressable style={[styles.row, compact && styles.compact]} onPress={() => onChange(!(value === true))}>
        <Switch value={value === true} onValueChange={onChange} trackColor={{ true: colors.primary }} />
        <View style={styles.labelWrap}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.required}>Pflichtfeld</Text> : null}
        </View>
      </Pressable>
    );
  }

  if (field.type === 'dropdown' && field.options.length > 0) {
    return (
      <View style={[styles.block, compact && styles.compact]}>
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
        </Text>
        <View style={styles.optionList}>
          {field.options.map((option) => {
            const selected = String(value ?? '') === option;
            return (
              <Pressable
                key={option}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => onChange(option)}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  const isMultiline = ['Text63', 'Text64', 'Text66', 'Text67', 'Text70'].includes(field.fieldName);

  return (
    <View style={[styles.block, compact && styles.compact]}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.requiredStar}> *</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, isMultiline && styles.multiline]}
        value={String(value ?? '')}
        onChangeText={(text) => {
          const isTimeField = field.fieldName && ['Text21', 'Text22', 'Text23', 'Text24'].some((n) => field.fieldName.includes(n));
          onChange(isTimeField ? normalizeClockTime(text) : text);
        }}
        onFocus={onFocus}
        multiline={isMultiline}
        placeholder={`${label} eingeben`}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: ui.spacing.md,
  },
  compact: {
    marginBottom: ui.spacing.sm,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: ui.radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: ui.spacing.md,
    padding: ui.spacing.sm,
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  required: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  requiredStar: {
    color: colors.danger,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: ui.radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  optionList: {
    gap: 8,
  },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: ui.radius.sm,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
