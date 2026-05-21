import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tokens } from '../design-tokens';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo: string | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, errorInfo: null };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.setState({ errorInfo: error.message });
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😵</Text>
          <Text style={styles.title}>出了点问题</Text>
          <Text style={styles.subtitle}>
            {this.state.errorInfo ?? '请重启应用重试'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.color.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Tokens.spacing.xxl,
  },
  emoji: { fontSize: 48, marginBottom: Tokens.spacing.l },
  title: {
    ...Tokens.typography.title,
    color: Tokens.color.textPrimary,
    marginBottom: Tokens.spacing.s,
  },
  subtitle: {
    ...Tokens.typography.body,
    color: Tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: Tokens.spacing.xl,
  },
  button: {
    backgroundColor: Tokens.color.surfaceElevated,
    paddingHorizontal: Tokens.spacing.xxl,
    paddingVertical: Tokens.spacing.m,
    borderRadius: Tokens.radius.button,
  },
  buttonText: {
    ...Tokens.typography.body,
    color: Tokens.color.textPrimary,
    fontWeight: '600',
  },
});
