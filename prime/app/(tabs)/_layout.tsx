import { Slot, Tabs, usePathname, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

function webShellColors(scheme: 'light' | 'dark' | null | undefined) {
  if (scheme === 'light') {
    return {
      webLayoutBg: '#F1F5F9',
      sidebarBg: '#FFFFFF',
      sidebarBorder: '#E2E8F0',
      hamburgerIcon: '#334155',
      sidebarTitle: '#0F172A',
      iconMuted: '#64748B',
      iconActive: '#0284C7',
      textMuted: '#475569',
      textActive: '#0284C7',
      itemActiveBg: '#E0F2FE',
      webContentBg: '#F1F5F9',
    };
  }
  return {
    webLayoutBg: '#020617',
    sidebarBg: '#020617',
    sidebarBorder: '#0F172A',
    hamburgerIcon: '#E2E8F0',
    sidebarTitle: '#F8FAFC',
    iconMuted: '#CBD5E1',
    iconActive: '#38BDF8',
    textMuted: '#CBD5E1',
    textActive: '#38BDF8',
    itemActiveBg: '#0F172A',
    webContentBg: '#020617',
  };
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const webColors = webShellColors(colorScheme);
  const isWeb = Platform.OS === 'web';
  const router = useRouter();
  const pathname = usePathname();

  const sidebarAnim = useRef(new Animated.Value(1)).current; // 1=open, 0=collapsed
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastClicked, setLastClicked] = useState<string | null>(null);

  const sidebarItems = useMemo(
    () => [
      { key: 'dashboard', label: 'Dashboard', route: '/explore', icon: 'bar-chart' },
      { key: 'history', label: 'History', route: '/history', icon: 'clock' },
      { key: 'templates', label: 'Templates', route: '/templates', icon: 'layers' },
      {
        key: 'ui',
        label: 'UI (Upload)',
        route: '/UI',
        icon: 'cloud-upload',
      },
      { key: 'profile', label: 'Profile', route: '/profile', icon: 'account-circle' },
      { key: 'settings', label: 'Settings', route: '/settings', icon: 'settings' },
      // Sign out: route to login (frontend-only for now).
      { key: 'logout', label: 'Logout', route: '/login', icon: 'logout' },
    ],
    [],
  );

  const sidebarWidth = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [72, 240],
  });
  const labelOpacity = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const labelWidth = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 160],
  });
  const labelTranslateX = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });

  const toggleSidebar = () => {
    const toValue = sidebarOpen ? 0 : 1;
    Animated.timing(sidebarAnim, {
      toValue,
      duration: 220,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
    setSidebarOpen((prev) => !prev);
  };

  if (isWeb) {
    const logoutItem = sidebarItems.find((i) => i.key === 'logout')!;
    const topItems = sidebarItems.filter((i) => i.key !== 'logout');

    return (
      <View style={[styles.webLayout, { backgroundColor: webColors.webLayoutBg }]}>
        <Animated.View
          style={[
            styles.sidebar,
            { width: sidebarWidth, backgroundColor: webColors.sidebarBg, borderRightColor: webColors.sidebarBorder },
          ]}>
          <View style={styles.sidebarInner}>
            <View style={styles.sidebarHeader}>
              <Pressable
                accessibilityRole="button"
                onPress={toggleSidebar}
                style={styles.hamburgerBtn}>
                <MaterialIcons
                  name="menu"
                  size={24}
                  color={webColors.hamburgerIcon}
                />
              </Pressable>

              <Animated.View
                style={[
                  styles.sidebarTitleWrap,
                  { opacity: labelOpacity, width: labelWidth, transform: [{ translateX: labelTranslateX }] },
                ]}>
                <Text style={[styles.sidebarTitle, { color: webColors.sidebarTitle }]}>Prime</Text>
              </Animated.View>
            </View>

            <View style={styles.sidebarNav}>
              {topItems.map((item) => {
                const isActive = lastClicked
                  ? lastClicked === item.key
                  : pathname?.startsWith(item.route);

                return (
                  <Pressable
                    key={item.key}
                    onPress={() => {
                      setLastClicked(item.key);
                      router.push(item.route as any);
                    }}
                    style={[
                      styles.sidebarItem,
                      isActive && { backgroundColor: webColors.itemActiveBg },
                      !sidebarOpen && styles.sidebarItemCollapsed,
                    ]}>
                    <View style={styles.sidebarIconWrap}>
                      <MaterialIcons
                        name={item.icon as any}
                        size={20}
                        color={isActive ? webColors.iconActive : webColors.iconMuted}
                      />
                    </View>

                    <Animated.View
                      style={[
                        styles.sidebarItemLabelWrap,
                        { opacity: labelOpacity, width: labelWidth, transform: [{ translateX: labelTranslateX }] },
                      ]}>
                      <Text
                        style={[
                          styles.sidebarItemText,
                          { color: isActive ? webColors.textActive : webColors.textMuted },
                        ]}>
                        {item.label}
                      </Text>
                    </Animated.View>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => {
                setLastClicked(logoutItem.key);
                router.push(logoutItem.route as any);
              }}
              style={[styles.sidebarLogout, !sidebarOpen && styles.sidebarItemCollapsed]}>
              <View style={styles.sidebarIconWrap}>
                <MaterialIcons name={logoutItem.icon as any} size={20} color="#F97316" />
              </View>

              <Animated.View
                style={[
                  styles.sidebarItemLabelWrap,
                  { opacity: labelOpacity, width: labelWidth, transform: [{ translateX: labelTranslateX }] },
                ]}>
                <Text style={styles.sidebarLogoutText}>{logoutItem.label}</Text>
              </Animated.View>
            </Pressable>
          </View>
        </Animated.View>

        <View style={[styles.webContent, { backgroundColor: webColors.webContentBg }]}>
          <Slot />
        </View>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
      }}
    >
      <Tabs.Screen
        name="UI"
        options={{
          title: 'UI',
          tabBarIcon: ({ color }) =>
            <MaterialIcons name="cloud-upload" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
          title: 'Dashboard',
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          href: null,
          title: 'Dashboard',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) =>
            <MaterialIcons name="account-circle" size={28} color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: 'Settings',
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          href: null,
          title: 'Charts',
        }}
      />

      <Tabs.Screen
        name="templates"
        options={{
          href: null,
          title: 'Templates',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  webLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    borderRightWidth: 1,
    height: '100%',
  },
  sidebarInner: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  sidebarTitleWrap: {
    overflow: 'hidden',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sidebarNav: {
    flex: 1,
    paddingTop: 6,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  sidebarItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  sidebarIconWrap: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarItemLabelWrap: {
    overflow: 'hidden',
    paddingRight: 8,
  },
  sidebarItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  sidebarLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  sidebarLogoutText: {
    color: '#F97316',
    fontWeight: '600',
    fontSize: 15,
  },
  webContent: {
    flex: 1,
  },
});

