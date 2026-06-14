import { useMutation } from '@tanstack/react-query'
import { login } from '../api/authRepository'

/**
 * @returns {{ mutate: (kredensial: { email: string, password: string }) => void,
 *             isPending: boolean, error: Error | null }}
 */
export function useLogin() {
  return useMutation({
    mutationFn: login,
  })
}
