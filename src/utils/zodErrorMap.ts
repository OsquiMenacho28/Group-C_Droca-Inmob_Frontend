import { z } from 'zod';
import i18n from '@/locales/i18n';

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  const { t } = i18n.global;

  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined') {
        return { message: t('validation.required') || 'Required' };
      }
      break;
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        return { message: t('validation.emailInvalid') || 'Invalid email' };
      }
      break;
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        if (issue.minimum === 1) return { message: t('validation.required') || 'Required' };
        return { message: t('validation.tooShort', { min: issue.minimum }) };
      }
      break;
    case z.ZodIssueCode.invalid_enum_value:
      return { message: t('validation.invalidSelection') || 'Invalid selection' };
  }

  return { message: ctx.defaultError };
};

export const setGlobalZodErrorMap = () => {
  z.setErrorMap(customErrorMap);
};
