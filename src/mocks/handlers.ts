import { getImagesMock } from "@/gen/api/images/images.msw";
import { getToiletsMock } from "@/gen/api/toilets/toilets.msw";

export const handlers = [...getImagesMock(), ...getToiletsMock()];
