import { GalleryVerticalEnd } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <h1 className="text-center text-xl font-bold">新規登録</h1>
      <form>
        <FieldGroup className="space-y-2">
          <Field>
            <FieldLabel htmlFor="email">メールアドレス</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              variant="underline"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">パスワード</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              variant="underline"
              required
            />
          </Field>
          <Field>
            <Button type="submit">アカウントを作成</Button>
          </Field>
          <FieldSeparator>または</FieldSeparator>
          <Field>
            <Button variant="outline" type="button" className="flex gap-2">
              <Image src="/google.svg" alt="Google" width={20} height={20} />
              Googleでログイン
            </Button>
          </Field>
          <FieldDescription className="text-center text-sm">
            アカウントをすでにお持ちの方は{` `}
            <Link href="/login" className="underline hover:text-primary">
              ログイン
            </Link>
          </FieldDescription>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-sm text-center">
        <Link href="/terms" className="underline hover:text-primary">
          利用規約
        </Link>
        {` `}
        <Link href="/privacy" className="underline hover:text-primary">
          プライバシーポリシー
        </Link>
      </FieldDescription>
    </div>
  );
}
