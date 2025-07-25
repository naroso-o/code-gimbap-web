"use client";

import { GimbapIcon } from "@/components/icon/GimbapIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import { usePeriodStore } from "../../../stores/usePeriodStore";

export const EntryHeader = () => {
  const {
    user,
    isLoading,
    isUpdatePending,
    isEditingName,
    tempName,
    setTempName,
    handleEditClick,
    handleUpdateName,
    handleCancel,
  } = useUser();
  const { period } = usePeriodStore();

  return (
    <div className="mb-6 pt-4">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <GimbapIcon className="w-12 h-12" />
        </div>
        <h1
          className="text-xl font-medium text-stone-700"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {isLoading ? (
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
          ) : user ? (
            <>
              {isEditingName ? (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="w-32 text-center"
                    disabled={isUpdatePending}
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateName}
                    disabled={isUpdatePending}
                  >
                    {isUpdatePending ? "저장중..." : "저장"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isUpdatePending}
                  >
                    취소
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>{user.name}님의 김밥일기</span>
                  {user.name === user.email?.split("@")[0] && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEditClick}
                      className="text-xs"
                    >
                      이름 설정
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            "게스트님의 김밥일기"
          )}
        </h1>
        <p className="text-sm text-stone-600">
          {period?.start_date} ~ {period?.end_date}
        </p>
      </div>
    </div>
  );
};
