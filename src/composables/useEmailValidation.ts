import { ref } from 'vue';
import { userService } from '@/services/userService';
import type { User } from '@/types/user';
import i18n from '@/locales/i18n';

const { t } = i18n.global;

/**
 * Composable for email uniqueness validation
 * Can be used alongside VeeValidate/Zod for async email checking
 */
export function useEmailValidation() {
  const emailFormatError = ref('');
  const emailDuplicateError = ref('');
  const emailChecking = ref(false);
  let emailDebounceTimer: ReturnType<typeof setTimeout>;
  let lastValidatedEmail = '';

  const validateEmailFormat = (email: string): boolean => {
    if (!email) {
      emailFormatError.value = t('validation.emailRequired');
      return false;
    }

    if (!email.includes('@')) {
      emailFormatError.value = t('validation.emailInvalid');
      return false;
    }

    emailFormatError.value = '';
    return true;
  };

  const validateEmailUniqueness = async (
    email: string,
    currentUserId?: string,
    skipIfSameAsOriginal?: string
  ): Promise<boolean> => {
    const trimmedEmail = email?.trim().toLowerCase();

    if (!trimmedEmail) {
      emailDuplicateError.value = '';
      return true;
    }

    if (
      skipIfSameAsOriginal &&
      skipIfSameAsOriginal.toLowerCase() === trimmedEmail
    ) {
      emailDuplicateError.value = '';
      return true;
    }

    emailChecking.value = true;

    try {
      const res = await userService.getUsers(0, 1000);
      const users: User[] = res.data || [];
      const emailExists = users.some(
        (user) =>
          String(user.email || '').toLowerCase() === trimmedEmail &&
          (!currentUserId || user.id !== currentUserId)
      );

      if (emailExists) {
        emailDuplicateError.value = t('validation.emailDuplicate');
        return false;
      }

      emailDuplicateError.value = '';
      return true;
    } catch {
      console.error(t('validation.emailVerifyError'));
      emailDuplicateError.value = '';
      return true;
    } finally {
      emailChecking.value = false;
    }
  };

  const onEmailInput = (email: string) => {
    validateEmailFormat(email);
    emailDuplicateError.value = '';

    clearTimeout(emailDebounceTimer);
    emailDebounceTimer = setTimeout(async () => {
      if (email && email !== lastValidatedEmail) {
        lastValidatedEmail = email;
        await validateEmailUniqueness(email);
      }
    }, 800);
  };

  const validateEmailOnBlur = async (email: string) => {
    if (email) {
      await validateEmailUniqueness(email);
    }
  };

  const clearEmailErrors = () => {
    emailFormatError.value = '';
    emailDuplicateError.value = '';
  };

  return {
    emailFormatError,
    emailDuplicateError,
    emailChecking,
    validateEmailFormat,
    validateEmailUniqueness,
    onEmailInput,
    validateEmailOnBlur,
    clearEmailErrors,
  };
}
