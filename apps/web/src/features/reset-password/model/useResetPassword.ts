import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getApiErrorCode } from '@/shared/api/apiClient';
import { forgotPasswordRequest, resetPasswordRequest } from '../api/passwordReset';

export type ResetPasswordStep = 'request' | 'verify' | 'reset' | 'done';

export function useResetPassword() {
  const [step, setStep] = useState<ResetPasswordStep>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeRejected, setIsCodeRejected] = useState(false);
  const forgot = useMutation({
    mutationFn: (value: string) => forgotPasswordRequest({ email: value }),
  });
  const reset = useMutation({ mutationFn: resetPasswordRequest });

  const requestCode = (value: string) =>
    forgot.mutate(value, {
      onSuccess: () => {
        setEmail(value);
        setIsCodeRejected(false);
        setStep('verify');
      },
    });

  const resendCode = () => {
    setIsCodeRejected(false);
    forgot.mutate(email);
  };

  const submitCode = (value: string) => {
    setCode(value);
    setIsCodeRejected(false);
    reset.reset();
    setStep('reset');
  };

  const submitPassword = (newPassword: string) =>
    reset.mutate(
      { email, code, newPassword },
      {
        onSuccess: () => setStep('done'),
        onError: (error) => {
          if (getApiErrorCode(error) !== 'RESET_CODE_INVALID') return;
          setIsCodeRejected(true);
          setStep('verify');
        },
      },
    );

  const goBack = () => {
    forgot.reset();
    setStep((current) => (current === 'reset' ? 'verify' : 'request'));
  };

  return {
    step,
    email,
    isCodeRejected,
    forgot,
    reset,
    requestCode,
    resendCode,
    submitCode,
    submitPassword,
    goBack,
  };
}
