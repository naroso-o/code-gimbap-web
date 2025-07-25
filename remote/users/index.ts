import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { queryKeys } from "../keys";

export interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

/** 로그인한 유저 정보 조회 */
export const useUserQuery = () => {
  const supabase = createClient();
  const { queryKey } = queryKeys.users.current();

  return useQuery<User | null>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) throw error;
      if (!data?.user) return null;

      // 사용자 정보 정규화
      return {
        id: data.user.id,
        email: data.user.email || "",
        name:
          data.user.user_metadata?.name ||
          data.user.email?.split("@")[0] ||
          "사용자",
        is_admin: data.user.user_metadata?.is_admin || false,
        created_at: data.user.created_at || "",
        updated_at: data.user.updated_at || "",
      };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

/** 유저 정보 조회 */
export const useUserInfoQuery = (userId: string) => {
  const supabase = createClient();
  const { queryKey } = queryKeys.users.information(userId);

  return useQuery<User | null>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    [key: string]: string | boolean | number | undefined;
  };
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

// 사용자 메타데이터 업데이트
export const useUpdateUserMutation = () => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { queryKey } = queryKeys.users.current();

  return useMutation<
    AuthUser | null,
    Error,
    { name?: string; is_admin?: boolean }
  >({
    mutationFn: async (updates: { name?: string; is_admin?: boolean }) => {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });
      if (error) throw error;
      return data.user;
    },
    onMutate: async (updates) => {
      // 진행 중인 쿼리들을 취소
      await queryClient.cancelQueries({ queryKey });

      // 이전 데이터 백업
      const previousUser = queryClient.getQueryData(queryKey);

      // Optimistic update
      queryClient.setQueryData(queryKey, (old: User | null) => {
        if (!old) return old;
        return {
          ...old,
          ...updates,
        };
      });

      return { previousUser };
    },
    onError: (err, updates, context) => {},
    onSettled: () => {
      // 성공/실패 관계없이 데이터 다시 fetch
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

// 회원가입 인터페이스
export interface SignupData {
  email: string;
  password: string;
  name: string;
}

// 회원가입 Mutation
export const useSignupMutation = () => {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation<
    { user: AuthUser | null; needsEmailConfirmation: boolean },
    Error,
    SignupData
  >({
    mutationFn: async ({ email, password, name }: SignupData) => {
      // 1단계: Supabase Auth에 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name, // Database trigger가 사용할 user_metadata에 name 포함
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("사용자 생성에 실패했습니다.");
      }

      // 2단계: Database Trigger 확인 (선택적)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("id")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile check error:", profileError);
        }

        if (!userProfile) {
          console.warn("Profile not found after trigger, but continuing with signup");
        } else {
          console.log("User profile created via database trigger");
        }
      } catch (profileCheckError) {
        console.error("Profile verification failed:", profileCheckError);
      }

      return {
        user: authData.user,
        needsEmailConfirmation: !authData.user.email_confirmed_at
      };
    },
    onSuccess: () => {
      // 사용자 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current().queryKey });
    },
  });
};

// 이메일 재전송 Mutation
export const useResendEmailMutation = () => {
  const supabase = createClient();

  return useMutation<void, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        throw error;
      }
    },
  });
};
