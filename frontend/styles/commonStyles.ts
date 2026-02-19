import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  authContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.large,
  },
  authTitle: {
    fontSize: theme.fontSizes.h1,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.large * 2,
    textAlign: 'center',
  },
  authButton: {
    marginTop: theme.spacing.large,
    width: '100%',
  },
  authFooter: {
    flexDirection: 'row',
    marginTop: theme.spacing.large * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authFooterText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.textSecondary,
  },
  authFooterLink: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xsmall,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    marginTop: theme.spacing.small,
    textAlign: 'center',
    width: '100%',
  },
});
