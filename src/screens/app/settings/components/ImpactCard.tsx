import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type ImpactCardProps = {
  impact: {
    totalContributed: number;
    peopleHelped: number;
    joinedSince: string;
  };
};

/**
 * ImpactCard component for displaying subscriber impact statistics
 * Used in subscriber settings screen
 */
const ImpactCard = ({ impact }: ImpactCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Your Impact</Text>
      
      <View style={styles.impactContainer}>
        <View style={styles.impactItem}>
          <Ionicons name="cash-outline" size={24} color={colors.black} />
          <Text style={styles.impactValue}>${impact.totalContributed}</Text>
          <Text style={styles.impactLabel}>Total Contributed</Text>
        </View>
        
        <View style={styles.impactItem}>
          <Ionicons name="people-outline" size={24} color={colors.black} />
          <Text style={styles.impactValue}>{impact.peopleHelped}</Text>
          <Text style={styles.impactLabel}>People Helped</Text>
        </View>
        
        <View style={styles.impactItem}>
          <Ionicons name="calendar-outline" size={24} color={colors.black} />
          <Text style={styles.impactValue}>{impact.joinedSince}</Text>
          <Text style={styles.impactLabel}>Joined Since</Text>
        </View>
      </View>
      
      <Text style={styles.thankYouText}>
        Thank you for your continued support! Your contributions are making a real difference in people's lives.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: 18,
    color: colors.black,
    marginBottom: 16,
  },
  impactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  impactItem: {
    alignItems: 'center',
    flex: 1,
  },
  impactValue: {
    fontFamily: typography.fonts.bold,
    fontSize: 18,
    color: colors.black,
    marginTop: 8,
    marginBottom: 4,
  },
  impactLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  thankYouText: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default ImpactCard;
