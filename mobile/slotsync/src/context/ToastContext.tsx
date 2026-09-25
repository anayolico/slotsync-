import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  Platform, 
  Dimensions,
  Easing
} from 'react-native';
import { 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X 
} from '../components/LucideIcons';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastItemData extends ToastOptions {
  id: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (options: ToastOptions | string) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Individual Animated Toast Component (Slides in from the right)
function AnimatedToastCard({ 
  item, 
  onDismiss 
}: { 
  item: ToastItemData; 
  onDismiss: (id: string) => void;
}) {
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const dismissToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: SCREEN_WIDTH,
        duration: 260,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      })
    ]).start(() => {
      onDismiss(item.id);
    });
  }, [item.id, onDismiss, translateX, opacity]);

  useEffect(() => {
    // Slide in smoothly from the right
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    // Auto dismiss timer
    const timer = setTimeout(() => {
      dismissToast();
    }, item.duration || 4000);

    return () => clearTimeout(timer);
  }, [dismissToast, item.duration, opacity, translateX]);

  const config = {
    error: {
      accentColor: '#ef4444',
      bgColor: '#ffffff',
      borderColor: '#fecaca',
      iconBg: '#fee2e2',
      defaultTitle: 'Error',
      Icon: AlertCircle,
    },
    success: {
      accentColor: '#10b981',
      bgColor: '#ffffff',
      borderColor: '#a7f3d0',
      iconBg: '#d1fae5',
      defaultTitle: 'Success',
      Icon: CheckCircle2,
    },
    warning: {
      accentColor: '#f59e0b',
      bgColor: '#ffffff',
      borderColor: '#fde68a',
      iconBg: '#fef3c7',
      defaultTitle: 'Attention',
      Icon: AlertTriangle,
    },
    info: {
      accentColor: '#6366f1',
      bgColor: '#ffffff',
      borderColor: '#c7d2fe',
      iconBg: '#e0e7ff',
      defaultTitle: 'Information',
      Icon: Info,
    },
  }[item.type];

  const IconComp = config.Icon;

  return (
    <Animated.View
      style={[
        styles.toastCard,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          transform: [{ translateX }],
          opacity,
        }
      ]}
    >
      {/* Left colored accent indicator */}
      <View style={[styles.leftStripe, { backgroundColor: config.accentColor }]} />

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
        <IconComp size={18} color={config.accentColor} strokeWidth={2.4} />
      </View>

      {/* Text Container */}
      <View style={styles.contentContainer}>
        <Text style={[styles.toastTitle, { color: '#0f172a' }]}>
          {item.title || config.defaultTitle}
        </Text>
        <Text style={styles.toastMessage} numberOfLines={3}>
          {item.message}
        </Text>
      </View>

      {/* Close Button */}
      <TouchableOpacity 
        style={styles.closeBtn} 
        onPress={dismissToast}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <X size={15} color="#94a3b8" strokeWidth={2.2} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions | string) => {
    const data: ToastOptions = typeof options === 'string' 
      ? { message: options, type: 'info' } 
      : options;

    const newToast: ToastItemData = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: data.type || 'info',
      title: data.title,
      message: data.message,
      duration: data.duration || 4000,
    };

    // Keep at most 3 toasts on screen at once
    setToasts((prev) => [...prev.slice(-2), newToast]);
  }, []);

  const showError = useCallback((message: string, title?: string) => {
    showToast({ type: 'error', message, title: title || 'Error' });
  }, [showToast]);

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast({ type: 'success', message, title: title || 'Success' });
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    showToast({ type: 'warning', message, title: title || 'Attention' });
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast({ type: 'info', message, title: title || 'Information' });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showWarning, showInfo, hideToast }}>
      {children}
      
      {/* Top-Right Floating Toast Portal Container */}
      <View style={styles.portalContainer} pointerEvents="box-none">
        {toasts.map((toast) => (
          <AnimatedToastCard 
            key={toast.id} 
            item={toast} 
            onDismiss={hideToast} 
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  portalContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 24,
    right: 14,
    left: 14,
    alignItems: 'flex-end',
    zIndex: 999999,
    elevation: 999999,
    gap: 8,
  },
  toastCard: {
    width: '100%',
    maxWidth: 360,
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingLeft: 14,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 8,
    gap: 10,
  },
  leftStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4.5,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  toastTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
