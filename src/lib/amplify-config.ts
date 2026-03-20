/**
 * Amplify Auth + Geo の設定
 *
 * Cognito の UserPoolId / UserPoolClientId / IdentityPoolId を環境変数から読み込み、
 * Amplify クライアントを初期化する。
 *
 * 環境変数 (.env.local に設定):
 *   NEXT_PUBLIC_COGNITO_USER_POOL_ID    — Cognito User Pool ID
 *   NEXT_PUBLIC_COGNITO_CLIENT_ID       — Cognito User Pool Client ID
 *   NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID — Cognito Identity Pool ID（Location Service 用）
 */
import { Amplify } from "aws-amplify";

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID!,
        loginWith: {
          email: true,
        },
        signUpVerificationMethod: "code",
      },
    },
  });
}
