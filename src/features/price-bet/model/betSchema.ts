import { z } from "zod";
import type { Price } from "@/shared/api/auctions/types";

export type BetFormValues = {
  price: number;
};

export const createBetSchema = (price: Price) => {
  return z.object({
    price: z.coerce
      .number({
        required_error: "Укажите сумму ставки",
        invalid_type_error: "Введите корректную сумму",
      })
      .positive("Цена должна быть больше 0")
      .superRefine((value, context) => {
        if (price.min_price !== null && value < price.min_price) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Минимальная ставка — ${price.min_price.toLocaleString("ru-RU")} ₽`,
          });
        }
        if (price.max_price !== null && value > price.max_price) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Максимальная ставка — ${price.max_price.toLocaleString("ru-RU")} ₽`,
          });
        }
        if (
          price.bet_step !== null &&
          price.min_price !== null &&
          (value - price.min_price) % price.bet_step !== 0
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Сумма должна соответствовать шагу ${price.bet_step.toLocaleString("ru-RU")} ₽`,
          });
        }
      }),
  });
};
