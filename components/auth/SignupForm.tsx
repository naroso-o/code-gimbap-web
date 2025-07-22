"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GimbapIcon } from "@/components/icon/GimbapIcon";
import { Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import {
  useSignupMutation,
  useResendEmailMutation,
  type SignupData,
} from "@/remote/users";

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export const SignupForm = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const { mutate: signup, isPending: isSignupPending } = useSignupMutation();
  const resendEmailMutation = useResendEmailMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("이름을 입력해주세요.");
      return false;
    }
    if (!formData.email.trim()) {
      setError("이메일을 입력해주세요.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    const signupData: SignupData = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
    };

    signup(signupData, {
      onSuccess: () => {
        setSuccess(true);
      },
      onError: (error) => {
        if (error.message === "User already registered") {
          setError("이미 가입된 이메일 주소입니다.");
        } else if (error.message.includes("Password")) {
          setError(
            "비밀번호가 너무 약습니다. 더 복잡한 비밀번호를 사용해주세요."
          );
        } else if (
          error.message.includes("NetworkError") ||
          error.message.includes("fetch")
        ) {
          setError(
            "네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요."
          );
        } else {
          setError(error.message || "회원가입 중 오류가 발생했습니다.");
        }
      },
    });
  };

  const handleResendEmail = () => {
    resendEmailMutation.mutate(
      { email: formData.email },
      {
        onSuccess: () => {
          alert("인증 이메일을 다시 보내드렸습니다.");
        },
        onError: (error) => {
          alert("이메일 재전송 실패: " + error.message);
        },
      }
    );
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "#F7F5F3" }}
      >
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <GimbapIcon className="w-16 h-16 mx-auto mb-4" />
            <h1
              className="text-2xl font-medium text-stone-700 mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              코드 김밥
            </h1>
            <p className="text-sm text-stone-500">블로그 스터디 모임</p>
          </div>

          <Card className="bg-white border border-stone-200 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-stone-700">
                  회원가입 완료!
                </h2>
                <div className="text-sm text-stone-600 leading-relaxed space-y-2">
                  <p>
                    이메일로 인증 링크를 보내드렸습니다.
                    <br />
                    인증을 완료한 후 로그인해주세요.
                  </p>
                  <div className="text-xs text-stone-500 mt-3 p-3 bg-stone-50 rounded-lg">
                    <p className="font-medium mb-1">
                      이메일을 받지 못하셨나요?
                    </p>
                    <ul className="text-left space-y-1">
                      <li>• 스팸/정크메일함을 확인해보세요</li>
                      <li>• 프로모션 탭(Gmail)을 확인해보세요</li>
                      <li>• 이메일 주소를 정확히 입력했는지 확인해보세요</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link href="/login">
                    <Button className="w-full">로그인 페이지로 이동</Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={handleResendEmail}
                    disabled={resendEmailMutation.isPending}
                  >
                    {resendEmailMutation.isPending
                      ? "전송 중..."
                      : "인증 이메일 다시 보내기"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-xs text-stone-500">
              함께 성장하는 김밥 스터디 🍙
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#F7F5F3" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <GimbapIcon className="w-16 h-16 mx-auto mb-4" />
          <h1
            className="text-2xl font-medium text-stone-700 mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            코드 김밥
          </h1>
          <p className="text-sm text-stone-500">블로그 스터디 모임</p>
        </div>

        <Card className="bg-white border border-stone-200 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-medium text-stone-700 mb-1">
                회원가입
              </h2>
              <p className="text-sm text-stone-500">김밥 스터디에 참여하세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                  <Input
                    type="text"
                    name="name"
                    placeholder="이름"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 border-stone-200 focus:border-stone-400 bg-white text-sm"
                    required
                    disabled={isSignupPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="이메일"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 border-stone-200 focus:border-stone-400 bg-white text-sm"
                    required
                    disabled={isSignupPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="비밀번호 (최소 6자)"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 border-stone-200 focus:border-stone-400 bg-white text-sm"
                    required
                    disabled={isSignupPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="비밀번호 확인"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 border-stone-200 focus:border-stone-400 bg-white text-sm"
                    required
                    disabled={isSignupPending}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm whitespace-pre-line">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSignupPending}
              >
                {isSignupPending ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    가입 중...
                  </span>
                ) : (
                  "회원가입"
                )}
              </Button>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm text-stone-500">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/login"
                  className="text-stone-700 hover:underline font-medium"
                >
                  로그인
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-stone-500">함께 성장하는 김밥 스터디 🍙</p>
        </div>
      </div>
    </div>
  );
};
