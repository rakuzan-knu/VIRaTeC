import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getApiErrorCode } from '@/shared/api/apiClient';
import {
  forgotPasswordRequest,
  resetPasswordRequest,
  verifyResetCodeRequest,
} from '../api/passwordReset';

export type ResetPasswordStep = 'request' | 'verify' | 'reset' | 'done';

export function useResetPassword() {
  const [step, setStep] = useState<ResetPasswordStep>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeRejected, setIsCodeRejected] = useState(false);
  const forgot = useMutation({
    mutationFn: (value: string) => forgotPasswordRequest({ email: value }),
  });
  const verify = useMutation({
    mutationFn: (value: string) => verifyResetCodeRequest({ email, code: value }),
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
    verify.reset();
    forgot.mutate(email);
  };

  const submitCode = (value: string) => {
    if (verify.isPending) return;
    setIsCodeRejected(false);
    forgot.reset();
    verify.mutate(value, {
      onSuccess: () => {
        setCode(value);
        reset.reset();
        setStep('reset');
      },
      onError: (error) => {
        if (getApiErrorCode(error) === 'RESET_CODE_INVALID') setIsCodeRejected(true);
      },
    });
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
    verify.reset();
    setStep((current) => (current === 'reset' ? 'verify' : 'request'));
  };

  return {
    step,
    email,
    isCodeRejected,
    forgot,
    verify,
    reset,
    requestCode,
    resendCode,
    submitCode,
    submitPassword,
    goBack,
  };
}
