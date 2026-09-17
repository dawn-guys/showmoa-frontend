"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { TextField } from "@/shared/components/text-field";

type PasswordFieldProps = Omit<
  React.ComponentProps<typeof TextField>,
  "type" | "endAdornment"
>;

/**
 * 비밀번호 입력 필드. 눈 아이콘으로 표시/암호화를 토글한다.
 * 표시 여부는 순수 UI 상태라 컴포넌트 내부에서 관리한다.
 */
export function PasswordField({
  autoComplete = "current-password",
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
          className="-mr-2 flex size-11 items-center justify-center rounded-full text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      }
    />
  );
}
