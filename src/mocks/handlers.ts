import { getAuthMock } from "@/gen/api/auth/auth.msw";
import { getImagesMock } from "@/gen/api/images/images.msw";
import { getNavigationMock } from "@/gen/api/navigation/navigation.msw";
import { getNotificationsMock } from "@/gen/api/notifications/notifications.msw";
import { getReportsMock } from "@/gen/api/reports/reports.msw";
import { getStoresMock } from "@/gen/api/stores/stores.msw";
import { getToiletsMock } from "@/gen/api/toilets/toilets.msw";

export const handlers = [
  ...getAuthMock(),
  ...getImagesMock(),
  ...getNavigationMock(),
  ...getNotificationsMock(),
  ...getReportsMock(),
  ...getStoresMock(),
  ...getToiletsMock(),
];
