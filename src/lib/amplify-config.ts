/**
 * Amplify Auth の設定
 *
 * Cognito の UserPoolId と UserPoolClientId を環境変数から読み込み、
 * Amplify クライアントを初期化する。
 *
 * 環境変数 (.env.local に設定):
 *   NEXT_PUBLIC_COGNITO_USER_POOL_ID    — Cognito User Pool ID (例: ap-northeast-1_xxxxx)
 *   NEXT_PUBLIC_COGNITO_CLIENT_ID       — Cognito User Pool Client ID (26文字の英数字)
 */
import { Amplify } from "aws-amplify";

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        loginWith: {
          email: true,
        },
        signUpVerificationMethod: "code",
      },
    },
  });
}
