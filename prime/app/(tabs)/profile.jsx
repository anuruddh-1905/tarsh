import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const Profile = () => {
  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>AP</Text>
        </View>
      </View>

      {/* User info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>Anuruddh Pratap</Text>
        <Text style={styles.email}>anuruddh.pratap@example.com</Text>
      </View>

      {/* Account settings list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>

        <Pressable style={styles.row} android_ripple={{ color: '#0F172A' }}>
          <Text style={styles.rowText}>My Infographics</Text>
        </Pressable>

        <Pressable style={styles.row} android_ripple={{ color: '#0F172A' }}>
          <Text style={styles.rowText}>Brand Settings</Text>
        </Pressable>

        <Pressable style={[styles.row, styles.signOutRow]} android_ripple={{ color: '#0F172A' }}>
          <Text style={[styles.rowText, styles.signOutText]}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1E293B', // slate-800
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0EA5E9', // sky-500
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E5E7EB', // gray-200
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F9FAFB', // gray-50
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748B', // slate-500
  },
  section: {
    backgroundColor: '#020617', // keep flat dark
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#111827', // gray-900
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF', // gray-400
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#020617',
    backgroundColor: '#030712',
  },
  rowText: {
    fontSize: 16,
    color: '#E5E7EB', // gray-200
  },
  signOutRow: {
    backgroundColor: '#020617',
  },
  signOutText: {
    color: '#F97316', // orange-500
    fontWeight: '600',
  },
});

export default Profile;

